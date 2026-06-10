const fs = require('fs');
const path = require('path');
const https = require('https');

async function updateSchema() {
  const envPath = path.join(__dirname, '.env.local');
  let GITHUB_TOKEN = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GITHUB_TOKEN=(.+)/);
    if (match) GITHUB_TOKEN = match[1].trim();
  }

  if (!GITHUB_TOKEN) {
    console.error("Lỗi: Không tìm thấy GITHUB_TOKEN trong file .env.local");
    process.exit(1);
  }

  const OWNER = 'ldgameplayer002-cmd';
  const REPO = 'quiz-data';
  const BRANCH = 'main';
  const FILE_PATH = 'masterData/question_types/math.json';

  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NodeJS-Update'
  };

  try {
    // 1. Lấy file cũ
    console.log("Đang lấy dữ liệu math.json hiện tại từ Github...");
    const getRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`, { headers });
    if (!getRes.ok) throw new Error("Không thể tải math.json");
    
    const data = await getRes.json();
    const sha = data.sha;
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const schema = JSON.parse(content);

    // 2. Cập nhật MATH_ARITHMETIC thành dạng Toán Đố
    schema.MATH_ARITHMETIC = {
      "name": "Toán đố có lời văn",
      "description": "Bài tập giải toán có lời văn",
      "fields": {
        "content": {
          "type": "string",
          "label": "Đề bài (VD: Bố có 15 cái kẹo...)"
        },
        "correctAnswer": {
          "type": "number",
          "label": "Kết quả đúng"
        }
      },
      "template": {
        "type": "MATH_ARITHMETIC",
        "content": "Bố có 15 cái kẹo, bố cho anh 7 cái, cho em 3 cái. Hỏi bố có bao nhiêu cái kẹo?",
        "correctAnswer": 15
      }
    };

    // 3. Put ngược lên Github
    console.log("Đang cập nhật math.json lên Github...");
    const putBody = {
      message: "Update MATH_ARITHMETIC schema to Word Problem",
      content: Buffer.from(JSON.stringify(schema, null, 2), 'utf8').toString('base64'),
      sha: sha,
      branch: BRANCH
    };

    const putRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) throw new Error("Cập nhật thất bại: " + await putRes.text());
    
    console.log("🎉 Thành công! Bạn hãy F5 lại trang Web để xem kết quả.");
  } catch (e) {
    console.error("Lỗi:", e.message);
  }
}

updateSchema();
