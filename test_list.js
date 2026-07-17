const fs = require('fs');
const path = require('path');

async function testList() {
  const envPath = path.join(__dirname, '.env.local');
  let GITHUB_TOKEN = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GITHUB_TOKEN=(.+)/);
    if (match) GITHUB_TOKEN = match[1].trim();
  }

  const OWNER = 'ldgameplayer002-cmd';
  const REPO = 'quiz-data';
  const BRANCH = 'main';
  const indexPath = `class1/math/assignments/index.json`;

  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'QuizApp-Admin'
  };

  const indexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${indexPath}?ref=${BRANCH}`, { headers });
  
  if (indexRes.ok) {
    const indexData = await indexRes.json();
    const content = Buffer.from(indexData.content, 'base64').toString('utf8');
    try {
      const activeFiles = JSON.parse(content);
      console.log("Parse OK, count:", activeFiles.length);
    } catch (e) {
      console.error('Lỗi parse index.json', e.message);
      console.log("Raw content snippet:", content.substring(0, 100));
    }
  } else {
    console.error("Index file not found");
  }
}
testList();
