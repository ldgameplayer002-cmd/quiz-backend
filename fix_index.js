const fs = require('fs');
const path = require('path');

async function fixIndex() {
  const envPath = path.join(__dirname, '.env.local');
  let GITHUB_TOKEN = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GITHUB_TOKEN=(.+)/);
    if (match) GITHUB_TOKEN = match[1].trim();
  }

  if (!GITHUB_TOKEN) {
    console.error("Lỗi: Không tìm thấy GITHUB_TOKEN");
    process.exit(1);
  }

  const OWNER = 'ldgameplayer002-cmd';
  const REPO = 'quiz-data';
  const BRANCH = 'main';
  const INDEX_PATH = `class1/math/assignments/index.json`;

  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NodeJS-Update'
  };

  try {
    const getIndexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${INDEX_PATH}?ref=${BRANCH}`, { headers });
    
    if (!getIndexRes.ok) throw new Error("Không thể tải index.json");
    
    const data = await getIndexRes.json();
    const indexSha = data.sha;
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const indexData = JSON.parse(content);

    let changed = false;
    indexData.forEach(item => {
      if (item.fileUrl && item.fileUrl.startsWith('http')) {
        // Trích xuất relative path từ URL
        const parts = item.fileUrl.split('main/');
        if (parts.length > 1) {
          item.fileUrl = parts[1];
          changed = true;
        }
      }
      if (!item.id && item.fileUrl) {
        // Tạo id từ filename
        item.id = item.fileUrl.split('/').pop().replace('.json', '');
        changed = true;
      }
    });

    if (!changed) {
      console.log("Không có gì cần sửa trong index.json");
      return;
    }

    const putIndexBody = {
      message: `Fix index.json incorrect fileUrl and missing id`,
      content: Buffer.from(JSON.stringify(indexData, null, 2), 'utf8').toString('base64'),
      branch: BRANCH,
      sha: indexSha
    };

    const putIndexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${INDEX_PATH}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(putIndexBody)
    });

    if (!putIndexRes.ok) throw new Error("Cập nhật index.json thất bại: " + await putIndexRes.text());

    console.log("🎉 Đã sửa file index.json thành công!");
  } catch (e) {
    console.error("Lỗi:", e.message);
  }
}

fixIndex();
