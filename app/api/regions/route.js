import { NextResponse } from 'next/server';

const REPO = 'ldgameplayer002-cmd/quiz-data';
const BRANCH = 'main';
const PATH = 'masterData/regions.json';

async function fetchRegionsFromGithub(token) {
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
    const { data } = await fetchRegionsFromGithub(GITHUB_TOKEN);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN' }, { status: 500 });

  try {
    const { regions } = await request.json();

    const { sha } = await fetchRegionsFromGithub(GITHUB_TOKEN);
    const contentStr = JSON.stringify(regions, null, 2);
    const contentBase64 = Buffer.from(contentStr, 'utf8').toString('base64');

    const url = `https://api.github.com/repos/${REPO}/contents/${PATH}`;
    const bodyObj = {
      message: `Cập nhật danh sách regions`,
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
