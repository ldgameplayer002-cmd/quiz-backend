const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const tokenMatch = envContent.match(/GITHUB_TOKEN=(.*)/);
const token = tokenMatch ? tokenMatch[1].trim() : '';


const repo = 'ldgameplayer002-cmd/quiz-data';

async function migrate() {
  const getOldUrl = `https://api.github.com/repos/${repo}/contents/appUpdate/version.json`;
  const getOldRes = await fetch(getOldUrl, { headers: { Authorization: `Bearer ${token}` } });
  
  if (!getOldRes.ok) {
    console.log("No old file found at appUpdate/version.json");
    return;
  }
  
  const oldData = await getOldRes.json();
  const content = oldData.content;
  const sha = oldData.sha;
  
  // Put to new path
  const newUrl = `https://api.github.com/repos/${repo}/contents/appConfig/version.json`;
  const putRes = await fetch(newUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Migrate to appConfig',
      content: content,
      branch: 'main'
    })
  });
  
  if (putRes.ok) {
    console.log("Created new file at appConfig/version.json");
    
    // Delete old
    const delRes = await fetch(getOldUrl, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Delete old appUpdate folder',
        sha: sha,
        branch: 'main'
      })
    });
    if (delRes.ok) {
      console.log("Deleted old file");
    } else {
      console.log("Failed to delete old file:", await delRes.text());
    }
  } else {
    console.log("Failed to create new file:", await putRes.text());
  }
}
migrate();
