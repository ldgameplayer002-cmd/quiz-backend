const fs = require('fs');
const bcrypt = require('bcryptjs');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envFile.match(/GITHUB_TOKEN=([^\n]+)/);
const GITHUB_TOKEN = tokenMatch ? tokenMatch[1].trim() : null;

const REPO = 'ldgameplayer002-cmd/quiz-data';
const BRANCH = 'main';
const PATH = 'masterData/users.json';

async function fix() {
  if (!GITHUB_TOKEN) return console.log("NO TOKEN");
  
  const url = `https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'Cache-Control': 'no-cache' }
  });
  
  if (!res.ok) return console.error("Error fetching", res.status);
  
  const result = await res.json();
  const contentStr = Buffer.from(result.content, 'base64').toString('utf8');
  let usersData = JSON.parse(contentStr);
  
  if (usersData['admin']) {
    console.log("Found admin, setting default password 'admin'");
    usersData['admin'].password = bcrypt.hashSync('admin', bcrypt.genSaltSync(10));
  } else {
    usersData['admin'] = {
      role: 'ADMIN',
      status: 'active',
      subjects: ['ALL'],
      grades: ['ALL'],
      password: bcrypt.hashSync('admin', bcrypt.genSaltSync(10))
    };
  }

  const newContent = Buffer.from(JSON.stringify(usersData, null, 2), 'utf8').toString('base64');
  
  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Fix admin password',
      content: newContent,
      branch: BRANCH,
      sha: result.sha
    })
  });
  
  if (putRes.ok) {
    console.log("Success! Admin password is now 'admin'");
  } else {
    console.log("Error updating", await putRes.text());
  }
}

fix();
