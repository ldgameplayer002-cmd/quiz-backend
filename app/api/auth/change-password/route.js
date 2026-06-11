import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const REPO = 'ldgameplayer002-cmd/quiz-data';
const BRANCH = 'main';
const PATH = 'masterData/users.json';

export async function POST(request) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN' }, { status: 500 });

  try {
    const { username, oldPassword, newPassword } = await request.json();
    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Vui lòng nhập đủ thông tin' }, { status: 400 });
    }

    const url = `https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    });

    if (res.status === 404) return NextResponse.json({ error: 'Không tìm thấy CSDL Users' }, { status: 404 });
    if (!res.ok) throw new Error(`Github API Error: ${res.status}`);

    const result = await res.json();
    const contentStr = Buffer.from(result.content, 'base64').toString('utf8');
    const usersData = JSON.parse(contentStr);

    const user = usersData[username];
    if (!user) return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 });

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Mật khẩu cũ không chính xác' }, { status: 401 });
    }

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);

    const updateBody = {
      message: `Đổi mật khẩu cho user ${username}`,
      content: Buffer.from(JSON.stringify(usersData, null, 2), 'utf8').toString('base64'),
      branch: BRANCH,
      sha: result.sha
    };

    const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody)
    });

    if (!putRes.ok) {
      const errBody = await putRes.text();
      throw new Error(`Github PUT Error: ${putRes.status} - ${errBody}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
