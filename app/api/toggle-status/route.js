import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { grade, subject, category, fileData, newStatus } = body;
    // fileData có { id, fileUrl, title, date }

    if (!grade || !subject || !category || !fileData || !newStatus) {
      return NextResponse.json({ error: 'Thiếu tham số' }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = 'ldgameplayer002-cmd';
    const REPO = 'quiz-data';
    const BRANCH = 'main';

    const dirPath = `${grade}/${subject}/${category}`;
    const indexPath = `${dirPath}/index.json`;

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'QuizApp-Admin',
      'Content-Type': 'application/json'
    };

    // 1. Fetch index.json
    let activeFiles = [];
    let indexSha = null;
    const indexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${indexPath}?ref=${BRANCH}`, { headers });
    
    if (indexRes.ok) {
      const indexData = await indexRes.json();
      indexSha = indexData.sha;
      const content = Buffer.from(indexData.content, 'base64').toString('utf8');
      activeFiles = JSON.parse(content);
    } else if (indexRes.status !== 404) {
      throw new Error('Lỗi khi đọc index.json');
    }

    // 2. Cập nhật mảng activeFiles
    if (newStatus === 'inactive') {
      // XÓA MỀM: Bỏ ra khỏi index.json
      activeFiles = activeFiles.filter(f => f.fileUrl !== fileData.fileUrl);
    } else {
      // KHÔI PHỤC: Đưa lại vào index.json
      // Tránh trùng lặp
      if (!activeFiles.find(f => f.fileUrl === fileData.fileUrl)) {
        // Cần fetch nội dung file thật để lấy title xịn (vì Inactive ở list view chỉ có tên file)
        const fileRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${fileData.fileUrl}?ref=${BRANCH}`, { headers });
        let realTitle = fileData.title; // Fallback
        if (fileRes.ok) {
          const fData = await fileRes.json();
          const fContent = JSON.parse(Buffer.from(fData.content, 'base64').toString('utf8'));
          if (fContent.title) realTitle = fContent.title;
        }

        const today = new Date();
        const dateStr = today.toLocaleDateString('en-GB');

        activeFiles.push({
          id: fileData.id,
          title: realTitle,
          date: fileData.date !== 'N/A' ? fileData.date : dateStr,
          fileUrl: fileData.fileUrl
        });
      }
    }

    // 3. Đẩy file index.json mới lên Github
    const updatedContent = JSON.stringify(activeFiles, null, 2);
    const updatedContentBase64 = Buffer.from(updatedContent, 'utf-8').toString('base64');

    const putBody = {
      message: `Admin Toggle Status: ${fileData.id} to ${newStatus}`,
      content: updatedContentBase64,
      branch: BRANCH
    };
    if (indexSha) putBody.sha = indexSha;

    const putRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${indexPath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      throw new Error(`Github PUT failed: ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
