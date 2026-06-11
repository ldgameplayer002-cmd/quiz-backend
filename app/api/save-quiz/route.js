import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { grade, subject, quizData, existingFileUrl, existingSha, author } = await request.json();

    if (!grade || !subject || !quizData) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'ldgameplayer002-cmd/quiz-data';
    const BRANCH = 'main';

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN trên server' }, { status: 500 });
    }

    const folderPath = `${grade}/${subject}/assignments`;
    
    // Tạo tên file chuẩn YYYY_MM_DD_HH_mm_ss_title
    const d = new Date();
    const dateStr = `${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,'0')}_${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}_${String(d.getMinutes()).padStart(2,'0')}_${String(d.getSeconds()).padStart(2,'0')}`;
    const safeTitle = quizData.title ? quizData.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").toLowerCase() : 'bai_tap';
    const filename = `${dateStr}_${safeTitle}.json`;
    
    const filePath = existingFileUrl ? existingFileUrl : `${folderPath}/${filename}`;
    const indexPath = `${folderPath}/index.json`;

    // 1. Tính toán Version
    let currentVersion = 1;
    if (existingFileUrl) {
      try {
        const oldFileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${existingFileUrl}?ref=${BRANCH}`, {
          headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (oldFileRes.ok) {
          const oldFileData = await oldFileRes.json();
          const oldContentStr = Buffer.from(oldFileData.content, 'base64').toString('utf8');
          const oldQuizData = JSON.parse(oldContentStr.replace(/^\uFEFF/, ''));
          
          currentVersion = oldQuizData.version || 1;
          
          const oldCompare = { ...oldQuizData };
          delete oldCompare.version;
          const newCompare = { ...quizData };
          delete newCompare.version;
          
          if (JSON.stringify(oldCompare) !== JSON.stringify(newCompare)) {
            currentVersion += 1;
          }
        }
      } catch (e) {
        console.error("Lỗi so sánh version bài cũ:", e);
      }
    }
    quizData.version = currentVersion;

    // Convert JSON payload to Base64
    const contentStr = JSON.stringify(quizData, null, 2);
    const contentBase64 = Buffer.from(contentStr, 'utf8').toString('base64');

    // 1. Tạo hoặc Cập nhật file quiz
    const putBody = {
      message: existingFileUrl ? `Cập nhật đề thi: ${filePath}` : `Tạo đề thi mới: ${filename}`,
      content: contentBase64,
      branch: BRANCH,
      ...(existingSha && { sha: existingSha })
    };

    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody)
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Github API Error (File): ${res.status} - ${errBody}`);
    }

    // 2. Cập nhật index.json
    const indexUrl = `https://api.github.com/repos/${REPO}/contents/${indexPath}`;
    const indexRes = await fetch(indexUrl, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    let indexData = [];
    let indexSha = null;

    if (indexRes.ok) {
      const indexJson = await indexRes.json();
      indexSha = indexJson.sha;
      const contentStr = Buffer.from(indexJson.content, 'base64').toString('utf8');
      try { indexData = JSON.parse(contentStr.replace(/^\uFEFF/, '')); } catch (e) { indexData = []; }
    }

    const existingIndexItem = indexData.find(item => item.fileUrl === filePath);

    if (existingIndexItem) {
      existingIndexItem.title = quizData.title || existingIndexItem.title;
      existingIndexItem.version = currentVersion;
    } else {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      indexData.unshift({
        id: existingFileUrl ? existingFileUrl.split('/').pop().replace('.json', '') : filename.replace('.json', ''),
        title: quizData.title || `Bài tập ${subject} mới`,
        date: dateStr,
        fileUrl: filePath,
        author: author || 'Admin',
        version: currentVersion
      });
    }

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
