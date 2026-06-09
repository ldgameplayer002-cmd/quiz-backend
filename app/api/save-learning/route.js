import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { grade, subject, learningData } = body;

    if (!grade || !subject || !learningData) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc (grade, subject, learningData)' }, { status: 400 });
    }

    // Lấy Token từ biến môi trường
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN trong .env.local' }, { status: 500 });
    }

    // Thông tin Github Repo
    const OWNER = 'ldgameplayer002-cmd';
    const REPO = 'quiz-data';
    const BRANCH = 'main';

    // Tạo tên file
    const filename = `${grade}_${subject}_${Date.now()}.json`;
    const path = `${grade}/${subject}/learning/${filename}`;

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

    // Chuyển JSON thành Base64 để Github hiểu
    const contentString = JSON.stringify(learningData, null, 2);
    const contentBase64 = Buffer.from(contentString, 'utf-8').toString('base64');

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Thêm bài học mới: ${filename}`,
        content: contentBase64,
        branch: BRANCH
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Lỗi từ Github API' }, { status: res.status });
    }

    // --- BƯỚC 2: CẬP NHẬT INDEX.JSON ---
    const indexPath = `${grade}/${subject}/learning/index.json`;
    const indexUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${indexPath}`;
    
    // Lấy index.json hiện tại
    const indexRes = await fetch(indexUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let indexData = [];
    let indexSha = null;

    if (indexRes.ok) {
      const indexJson = await indexRes.json();
      indexSha = indexJson.sha;
      const contentStr = Buffer.from(indexJson.content, 'base64').toString('utf8');
      try {
        indexData = JSON.parse(contentStr.replace(/^\uFEFF/, '')); // Xóa BOM nếu có
      } catch (e) {
        indexData = []; // Nếu file rỗng hoặc lỗi thì tạo mảng mới
      }
    }

    // Thêm object mới vào đầu mảng
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    indexData.unshift({
      id: filename.replace('.json', ''),
      title: learningData.title || `Bài học ${subject} mới`,
      date: dateStr,
      fileUrl: path
    });

    // Đẩy index.json mới lên
    const newIndexBase64 = Buffer.from(JSON.stringify(indexData, null, 2), 'utf8').toString('base64');
    
    const updateIndexRes = await fetch(indexUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update index: Thêm bài học ${filename}`,
        content: newIndexBase64,
        branch: BRANCH,
        ...(indexSha && { sha: indexSha })
      })
    });

    if (!updateIndexRes.ok) {
      console.error("Lỗi khi update index.json", await updateIndexRes.text());
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error('Lỗi khi lưu bài học:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
