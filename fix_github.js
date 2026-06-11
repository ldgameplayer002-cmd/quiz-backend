const fs = require('fs');
const path = require('path');

async function fixGithub() {
  const envPath = path.join(__dirname, '.env.local');
  let GITHUB_TOKEN = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GITHUB_TOKEN=(.+)/);
    if (match) GITHUB_TOKEN = match[1].trim();
  }

  if (!GITHUB_TOKEN) {
    console.error("Lỗi: Không tìm thấy GITHUB_TOKEN");
    return;
  }

  const OWNER = 'ldgameplayer002-cmd';
  const REPO = 'quiz-data';
  const BRANCH = 'main';

  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NodeJS-Update'
  };

  async function uploadFile(filePath, jsonObj, message) {
    console.log(`Đang sửa file ${filePath}...`);
    // Lấy sha
    let sha = null;
    const getRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`, { headers });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }

    const contentStr = JSON.stringify(jsonObj, null, 2);
    const contentBase64 = Buffer.from(contentStr, 'utf8').toString('base64');

    const putBody = {
      message,
      content: contentBase64,
      branch: BRANCH
    };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });

    if (putRes.ok) {
      console.log(`Đã sửa xong ${filePath}!`);
    } else {
      console.error(`Lỗi sửa ${filePath}:`, await putRes.text());
    }
  }

  const englishSchema = {
    "AUDIO_CHOICE": {
      "name": "Nghe và Chọn đáp án",
      "description": "App phát âm Tiếng Anh khi ấn loa",
      "fields": {
        "content": { "type": "string", "label": "Câu hỏi" },
        "audioText": { "type": "string", "label": "Văn bản phát âm" },
        "audioLang": { "type": "select", "label": "Ngôn ngữ", "options": ["en", "vi"] },
        "optionA": { "type": "emoji_text", "label": "Đáp án A" },
        "optionB": { "type": "emoji_text", "label": "Đáp án B" },
        "optionC": { "type": "emoji_text", "label": "Đáp án C" },
        "optionD": { "type": "emoji_text", "label": "Đáp án D" },
        "correctAnswer": { "type": "select", "label": "Đáp án đúng", "options": ["A", "B", "C", "D"] }
      },
      "template": {
        "type": "AUDIO_CHOICE",
        "content": "Nghe và chọn từ đúng:",
        "audioText": "Apple",
        "audioLang": "en",
        "optionA": "Quả táo 🍎",
        "optionB": "Quả chuối 🍌",
        "optionC": "Quả cam 🍊",
        "optionD": "Quả dưa 🍉",
        "correctAnswer": "A"
      }
    },
    "MULTIPLE_CHOICE": {
      "name": "Trắc nghiệm 4 đáp án",
      "description": "Câu hỏi trắc nghiệm tiếng Anh cơ bản",
      "fields": {
        "content": { "type": "string", "label": "Câu hỏi" },
        "optionA": { "type": "string", "label": "Đáp án A" },
        "optionB": { "type": "string", "label": "Đáp án B" },
        "optionC": { "type": "string", "label": "Đáp án C" },
        "optionD": { "type": "string", "label": "Đáp án D" },
        "correctAnswer": { "type": "select", "label": "Đáp án đúng", "options": ["A", "B", "C", "D"] }
      },
      "template": {
        "type": "MULTIPLE_CHOICE",
        "content": "What is this?",
        "optionA": "Cat",
        "optionB": "Dog",
        "optionC": "Bird",
        "optionD": "Fish",
        "correctAnswer": "A"
      }
    }
  };

  const indexArray = [
    {
      "id": "2026_06_10_07_03_03_english_class_1_fun_vocabulary_quiz",
      "title": "English Class 1 - Fun Vocabulary Quiz",
      "date": "10/06/2026",
      "fileUrl": "class1/english/assignments/2026_06_10_07_03_03_english_class_1_fun_vocabulary_quiz.json"
    }
  ];

  await uploadFile('masterData/question_types/english.json', englishSchema, 'Fix corrupted english.json');
  await uploadFile('class1/english/assignments/index.json', indexArray, 'Fix corrupted index.json');
}

fixGithub();
