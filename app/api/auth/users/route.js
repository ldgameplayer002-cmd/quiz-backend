import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const REPO = 'ldgameplayer002-cmd/quiz-data';
const BRANCH = 'main';
const PATH = 'masterData/users.json';

async function fetchUsersFromGithub(token) {
  const url = `https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Cache-Control': 'no-cache'
    }
  });

  if (res.status === 404) {
    return { data: {}, sha: null };
  }

  if (!res.ok) throw new Error(`Github API Error: ${res.status}`);

  const result = await res.json();
  const contentStr = Buffer.from(result.content, 'base64').toString('utf8');
  return { data: JSON.parse(contentStr), sha: result.sha };
}

export async function GET(request) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN' }, { status: 500 });

  try {
    const { data } = await fetchUsersFromGithub(GITHUB_TOKEN);
    const safeData = { ...data };
    for (let key in safeData) {
      delete safeData[key].password;
    }
    return NextResponse.json(safeData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN' }, { status: 500 });

  try {
    const { users } = await request.json();

    // Hash new/updated passwords
    for (const key in users) {
      const pwd = users[key].password;
      if (pwd && !pwd.startsWith('$2')) { // simple check for bcrypt prefix
        const salt = bcrypt.genSaltSync(10);
        users[key].password = bcrypt.hashSync(pwd, salt);
      }
    }

    const { sha } = await fetchUsersFromGithub(GITHUB_TOKEN);
    const contentStr = JSON.stringify(users, null, 2);
    const contentBase64 = Buffer.from(contentStr, 'utf8').toString('base64');

    const url = `https://api.github.com/repos/${REPO}/contents/${PATH}`;
    const bodyObj = {
      message: `Cập nhật danh sách users`,
      content: contentBase64,
      branch: BRANCH
    };
    if (sha) bodyObj.sha = sha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObj)
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Github PUT Error: ${res.status} - ${errBody}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
