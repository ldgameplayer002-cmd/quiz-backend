import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { grade, subject, quizData } = await request.json();

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Read from Vercel Env
    const REPO = 'ldgameplayer002-cmd/quiz-data';
    const BRANCH = 'main';

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN trên server' }, { status: 500 });
    }

    // Generate unique filename
    const filename = `quiz_${Date.now()}.json`;
    const path = `${grade}/${subject}/assignments/${filename}`; 
    // Notice: Using assignments folder for custom quizzes

    // Convert JSON payload to Base64 (Required by GitHub API)
    const contentStr = JSON.stringify(quizData, null, 2);
    // Safe Base64 encoding for UTF-8
    const contentBase64 = Buffer.from(contentStr, 'utf8').toString('base64');

    const url = `https://api.github.com/repos/${REPO}/contents/${path}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Tạo đề thi mới: ${filename}`,
        content: contentBase64,
        branch: BRANCH
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Github API Error (Tạo file): ${res.status} - ${errBody}`);
    }

    // --- BƯỚC 2: CẬP NHẬT INDEX.JSON ---
    const indexPath = `${grade}/${subject}/assignments/index.json`;
    const indexUrl = `https://api.github.com/repos/${REPO}/contents/${indexPath}`;
    
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

    // Thêm object mới vào đầu mảng (mới nhất lên trên)
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    indexData.unshift({
      id: filename.replace('.json', ''),
      title: quizData.title || `Bài tập ${subject} mới`,
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
        message: `Update index: Thêm bài ${filename}`,
        content: newIndexBase64,
        branch: BRANCH,
        ...(indexSha && { sha: indexSha }) // Nếu file đã tồn tại thì phải kèm sha
      })
    });

    if (!updateIndexRes.ok) {
      console.error("Lỗi khi update index.json", await updateIndexRes.text());
    }

    return NextResponse.json({ success: true, file: filename });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
