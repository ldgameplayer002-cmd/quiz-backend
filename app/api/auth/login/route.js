import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const REPO = 'ldgameplayer002-cmd/quiz-data';
const BRANCH = 'main';
const PATH = 'masterData/users.json';

export async function POST(request) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN' }, { status: 500 });

  try {
    const { username, password } = await request.json();

    const url = `https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    });

    let usersData = {};
    if (res.status === 404) {
      // Hardcode fallback Admin if no users file yet
      if (username === 'admin' && password === 'admin') {
        return NextResponse.json({ success: true, user: { username: 'admin', role: 'ADMIN', subjects: ['ALL'] } });
      }
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
    }

    if (!res.ok) throw new Error(`Github API Error: ${res.status}`);

    const result = await res.json();
    const contentStr = Buffer.from(result.content, 'base64').toString('utf8');
    usersData = JSON.parse(contentStr);

    const user = usersData[username];
    if (!user) {
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        username,
        role: user.role,
        subjects: user.subjects || []
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
