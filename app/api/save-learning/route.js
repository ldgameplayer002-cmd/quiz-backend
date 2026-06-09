import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { grade, subject, learningData, existingFileUrl, existingSha } = body;

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

    const timestamp = Date.now();
    const filename = `${grade}_${subject}_${timestamp}.json`;
    const folderPath = `${grade}/${subject}/learning`;
    
    // Nếu là Edit, dùng file cũ
    const filePath = existingFileUrl ? existingFileUrl : `${folderPath}/${filename}`;
    const indexPath = `${folderPath}/index.json`;
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`;

    // Chuyển JSON thành Base64 để Github hiểu
    const contentString = JSON.stringify(learningData, null, 2);
    const contentBase64 = Buffer.from(contentString, 'utf-8').toString('base64');

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    const putBody = {
      message: existingFileUrl ? `Chỉnh sửa bài học ${subject}` : `Tạo mới bài học ${subject}`,
      content: contentBase64,
      branch: BRANCH
    };
    if (existingSha) putBody.sha = existingSha;

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody)
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Lỗi từ Github API' }, { status: res.status });
    }

    // --- BƯỚC 2: CẬP NHẬT INDEX.JSON ---
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
        indexData = []; 
      }
    }

    // 4. Nếu là Edit, cập nhật title hoặc push mới
    let isExistingInIndex = false;
    for (let i = 0; i < indexData.length; i++) {
      if (indexData[i].fileUrl === filePath) {
        indexData[i].title = learningData.title || indexData[i].title;
        isExistingInIndex = true;
        break;
      }
    }

    if (!isExistingInIndex) {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      
      indexData.unshift({
        id: existingFileUrl ? existingFileUrl.split('/').pop().replace('.json', '') : `${grade}_${subject}_${timestamp}`,
        title: learningData.title || `Bài học ${subject} mới`,
        date: dateStr,
        fileUrl: filePath
      });
    }

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
