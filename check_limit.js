const fs = require('fs');
const path = require('path');

async function checkRateLimit() {
  const envPath = path.join(__dirname, '.env.local');
  let GITHUB_TOKEN = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GITHUB_TOKEN=(.+)/);
    if (match) GITHUB_TOKEN = match[1].trim();
  }

  const res = await fetch('https://api.github.com/rate_limit', {
    headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data.rate, null, 2));
}

checkRateLimit();
