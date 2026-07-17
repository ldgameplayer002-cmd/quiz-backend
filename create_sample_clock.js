const fs = require('fs');
const path = require('path');
const https = require('https');

async function pushSample() {
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
  
  const timestamp = Date.now();
  const FILE_NAME = `sample_clock_${timestamp}.json`;
  const FILE_PATH = `class1/math/assignments/${FILE_NAME}`;
  const INDEX_PATH = `class1/math/assignments/index.json`;

  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NodeJS-Update'
  };

  const sampleData = {
    "title": "Bài tập xem đồng hồ",
    "description": "Bé hãy chỉnh đồng hồ theo yêu cầu nhé",
    "rewardPoints": 20,
    "questions": [
      {
        "type": "CLOCK_SET",
        "content": "Con hãy chỉnh đồng hồ chỉ 10 giờ 30 phút nhé!",
        "correctAnswer": "10:30"
      },
      {
        "type": "CLOCK_SET",
        "content": "Con hãy chỉnh đồng hồ chỉ 2 giờ 15 phút nhé!",
        "correctAnswer": "02:15"
      }
    ]
  };

  try {
    // 1. Push file mới
    console.log(`Đang tạo file ${FILE_NAME}...`);
    const putBody = {
      message: `Create sample CLOCK_SET test`,
      content: Buffer.from(JSON.stringify(sampleData, null, 2), 'utf8').toString('base64'),
      branch: BRANCH
    };

    const putRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) throw new Error("Tạo file thất bại: " + await putRes.text());
    
    // 2. Lấy index.json hiện tại
    console.log("Đang cập nhật index.json...");
    let indexData = [];
    let indexSha = null;
    const getIndexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${INDEX_PATH}?ref=${BRANCH}`, { headers });
    
    if (getIndexRes.ok) {
      const data = await getIndexRes.json();
      indexSha = data.sha;
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      indexData = JSON.parse(content);
    }

    // 3. Thêm file mới vào index
    indexData.unshift({
      fileUrl: `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${FILE_PATH}`,
      title: sampleData.title,
      date: new Date().toLocaleDateString('vi-VN'),
      author: 'admin',
      status: 'active',
      version: 1
    });

    // 4. Push index.json
    const putIndexBody = {
      message: `Update index.json for ${FILE_NAME}`,
      content: Buffer.from(JSON.stringify(indexData, null, 2), 'utf8').toString('base64'),
      branch: BRANCH
    };
    if (indexSha) putIndexBody.sha = indexSha;

    const putIndexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${INDEX_PATH}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(putIndexBody)
    });

    if (!putIndexRes.ok) throw new Error("Cập nhật index.json thất bại: " + await putIndexRes.text());

    console.log("🎉 Thành công! Đã thêm đề mẫu lên Github.");
  } catch (e) {
    console.error("Lỗi:", e.message);
  }
}

pushSample();
