import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get('grade');
  const subject = searchParams.get('subject');
  const category = searchParams.get('category'); // 'assignments' or 'learning'

  if (!grade || !subject || !category) {
    return NextResponse.json({ error: 'Thiếu tham số (grade, subject, category)' }, { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: 'Chưa cấu hình GITHUB_TOKEN' }, { status: 500 });
  }

  const OWNER = 'ldgameplayer002-cmd';
  const REPO = 'quiz-data';
  const BRANCH = 'main';

  const dirPath = `${grade}/${subject}/${category}`;
  const indexPath = `${dirPath}/index.json`;

  try {
    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'QuizApp-Admin'
    };

    // 1. Fetch index.json
    let activeFiles = [];
    let indexSha = null;
    const indexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${indexPath}?ref=${BRANCH}`, { headers });
    if (!indexRes.ok) {
      const errText = await indexRes.text();
      throw new Error(`Lỗi tải index.json từ Github: ${indexRes.status} - ${errText}`);
    }
    
    if (indexRes.ok) {
      const indexData = await indexRes.json();
      indexSha = indexData.sha;
      const content = Buffer.from(indexData.content, 'base64').toString('utf8');
      try {
        activeFiles = JSON.parse(content);
      } catch (e) {
        console.error('Lỗi parse index.json', e);
      }
    }

    // 2. Fetch Directory Contents
    const dirRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${dirPath}?ref=${BRANCH}`, { headers });
    let allFiles = [];
    if (!dirRes.ok && dirRes.status !== 404) {
      const errText = await dirRes.text();
      throw new Error(`Lỗi tải thư mục từ Github: ${dirRes.status} - ${errText}`);
    }
    
    if (dirRes.ok) {
      allFiles = await dirRes.json();
    }

    // 3. Xây dựng danh sách tổng hợp
    const resultList = [];
    const activeMap = {}; // Lưu map URL -> object để check cho nhanh

    activeFiles.forEach(file => {
      activeMap[file.fileUrl] = file;
      resultList.push({
        ...file,
        status: 'active'
      });
    });

    // Quét file thư mục để tìm file Inactive
    if (Array.isArray(allFiles)) {
      allFiles.forEach(file => {
        if (file.name.endsWith('.json') && file.name !== 'index.json') {
          if (!activeMap[file.path]) {
            // Đây là file Inactive (có trên Github nhưng không có trong index)
            resultList.push({
              id: file.name.replace('.json', ''),
              title: file.name, // Lấy tạm tên file làm tiêu đề
              date: 'N/A',
              fileUrl: file.path,
              status: 'inactive'
            });
          }
        }
      });
    }

    // Sắp xếp: Active lên trên, Inactive xuống dưới
    resultList.sort((a, b) => {
      if (a.status === 'active' && b.status === 'inactive') return -1;
      if (a.status === 'inactive' && b.status === 'active') return 1;
      return 0;
    });

    return NextResponse.json({ files: resultList, indexSha });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
