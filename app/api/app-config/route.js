import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'ldgameplayer002-cmd/quiz-data';
    const filePath = 'appConfig/version.json';
    
    const url = `https://api.github.com/repos/${REPO}/contents/${filePath}?ref=main&t=${Date.now()}`;
    const res = await fetch(url, {
      headers: GITHUB_TOKEN ? { 
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      } : { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ release: 1, latestVersionCode: 1, latestVersionName: '1.0.0', url: '', description: '', forceUpdate: false });
      }
      throw new Error(`Failed to fetch version: ${res.status}`);
    }

    const data = await res.json();
    const contentStr = Buffer.from(data.content, 'base64').toString('utf8');
    const parsedData = JSON.parse(contentStr);
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Lỗi khi lấy version:', error);
    return NextResponse.json({ error: 'Lỗi khi tải cấu hình', url: '' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { url, description, release, forceUpdate } = payload;
    
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'ldgameplayer002-cmd/quiz-data';
    const BRANCH = 'main';
    const filePath = 'appConfig/version.json';

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'Thiếu GITHUB_TOKEN' }, { status: 500 });
    }

    // 1. Fetch current data to increment versions
    const fileUrl = `https://api.github.com/repos/${REPO}/contents/${filePath}`;
    const getRes = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    let currentData = { release: 1, latestVersionCode: 0, latestVersionName: "1.0.0" };
    
    if (getRes.ok) {
      const gitData = await getRes.json();
      sha = gitData.sha;
      try {
        currentData = JSON.parse(Buffer.from(gitData.content, 'base64').toString('utf8'));
      } catch (e) { console.error("Lỗi parse file json cũ", e); }
    }

    // 2. Logic Auto Versioning
    let newRelease = parseInt(release || currentData.release || 1);
    let oldRelease = parseInt(currentData.release || 1);
    let newVersionCode = (parseInt(currentData.latestVersionCode) || 0) + 1;
    let newVersionName = "1.0.0";
    
    if (newRelease > oldRelease) {
      // Big update reset
      newVersionName = `${newRelease}.0.0`;
    } else {
      // Minor update
      let oldName = currentData.latestVersionName || "1.0.0";
      let parts = oldName.split('.').map(n => parseInt(n) || 0);
      let major = newRelease;
      let minor = parts[1] || 0;
      let patch = parts[2] || 0;
      
      patch += 1;
      if (patch > 9) {
        minor += 1;
        patch = 0;
      }
      newVersionName = `${major}.${minor}.${patch}`;
    }

    const newData = {
      release: newRelease,
      latestVersionCode: newVersionCode,
      latestVersionName: newVersionName,
      url: url || "",
      description: description || "",
      forceUpdate: forceUpdate === true
    };

    const newContent = JSON.stringify(newData, null, 2);
    const contentBase64 = Buffer.from(newContent, 'utf-8').toString('base64');

    const putBody = {
      message: `Cập nhật Version App lên ${newVersionName} (Code: ${newVersionCode})`,
      content: contentBase64,
      branch: BRANCH
    };
    if (sha) putBody.sha = sha;

    const updateRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Update Github Error: ${err}`);
    }

    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    console.error('Lỗi khi cập nhật appConfig:', error);
    return NextResponse.json({ error: 'Không thể cập nhật cấu hình' }, { status: 500 });
  }
}
