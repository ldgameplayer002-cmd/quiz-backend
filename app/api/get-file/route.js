import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('fileUrl');

  if (!fileUrl) {
    return NextResponse.json({ error: 'Thiếu fileUrl' }, { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = 'ldgameplayer002-cmd';
  const REPO = 'quiz-data';
  const BRANCH = 'main';

  try {
    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'QuizApp-Admin'
    };

    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${fileUrl}?ref=${BRANCH}`, { headers });
    
    if (!res.ok) {
      throw new Error('Không thể tải file từ Github');
    }

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    
    return NextResponse.json({ content: JSON.parse(content), sha: data.sha });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
