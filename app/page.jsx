'use client';
import { useState, useEffect } from 'react';
import ManualQuizForm from '../components/ManualQuizForm';
import LearningForm from '../components/LearningForm';
import Sidebar from '../components/Sidebar';
import AccountManager from '../components/AccountManager';
import RegionManager from '../components/RegionManager';
import FileManager from '../components/FileManager';
import IntroLanding from '../components/IntroLanding';
import AppConfigManager from '../components/AppConfigManager';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [skipIntroAnimation, setSkipIntroAnimation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Dashboard states
  const [grade, setGrade] = useState('class1');
  const [subject, setSubject] = useState('english');
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'ai'

  // AI Paste State (Quiz)
  const [aiJson, setAiJson] = useState('');
  const [selectedAiType, setSelectedAiType] = useState('');

  // AI Paste State (Learning)
  const [learningTab, setLearningTab] = useState('form');
  const [learningAiJson, setLearningAiJson] = useState('');

  // Edit Mode State
  const [editData, setEditData] = useState(null);
  const [isReadOnlyGlobal, setIsReadOnlyGlobal] = useState(false); // { url, sha, content }

  // Form Mode State
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Toast / Status
  const [status, setStatus] = useState({ message: '', type: '' });
  
  // Custom Popup & Form Reset
  const [successPopup, setSuccessPopup] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  // 1. Dùng useEffect để lấy Master Data từ Github lúc vừa vào Web
  const [masterSchema, setMasterSchema] = useState({});
  const [subjectsData, setSubjectsData] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    if (masterSchema && masterSchema[subject]) {
      const keys = Object.keys(masterSchema[subject].types || {});
      if (keys.length > 0 && (!selectedAiType || !keys.includes(selectedAiType))) {
        setSelectedAiType(keys[0]);
      }
    }
  }, [masterSchema, subject]);

  // 1. Tải danh sách môn học khi vừa vào web
  useEffect(() => {
    // Thêm timestamp để chống cache của Github
    fetch(`https://raw.githubusercontent.com/ldgameplayer002-cmd/quiz-data/refs/heads/main/masterData/subjects.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setSubjectsData(data);
      })
      .catch(err => {
        console.error('Lỗi tải môn học:', err);
        setStatus({ message: 'Vui lòng chạy lệnh node migrate_schema.js trước để tạo cấu trúc mới!', type: 'error' });
      });
  }, []);

  // 2. Tải cấu trúc (types) của môn học hiện tại (Lazy Load)
  useEffect(() => {
    if (!subject || !subjectsData) return;
    
    // Nếu đã tải rồi thì không tải lại
    if (masterSchema[subject]) return;

    setStatus({ message: `Đang tải cấu trúc môn ${subjectsData[subject]?.name}...`, type: 'info' });
    fetch(`https://raw.githubusercontent.com/ldgameplayer002-cmd/quiz-data/refs/heads/main/masterData/question_types/${subject}.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(types => {
        setMasterSchema(prev => ({
          ...prev,
          [subject]: {
            name: subjectsData[subject]?.name || subject,
            types: types
          }
        }));
        setStatus({ message: '', type: '' });
      })
      .catch(err => {
        console.error(err);
        setStatus({ message: 'Lỗi tải cấu trúc môn ' + subject, type: 'error' });
      });
  }, [subject, subjectsData]);

  useEffect(() => {
    const savedUser = localStorage.getItem('quiz_user');
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setCurrentUser(userObj);
      
      if (userObj.role === 'REVIEWER') {
        setActiveView('manage');
      } else if (userObj.role !== 'ADMIN' && userObj.subjects && userObj.subjects.length > 0) {
        setSubject(userObj.subjects[0]);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Đang đăng nhập...', type: 'info' });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        localStorage.setItem('quiz_user', JSON.stringify(data.user));
        setStatus({ message: 'Đăng nhập thành công!', type: 'success' });
        
        if (data.user.role === 'REVIEWER') {
          setActiveView('manage');
        } else if (data.user.role !== 'ADMIN' && data.user.subjects.length > 0) {
           setSubject(data.user.subjects[0]);
        }
      } else {
        setStatus({ message: data.error || 'Đăng nhập thất bại', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Lỗi mạng', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('quiz_user');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setPassword('');
    setActiveView('dashboard');
  };

  const saveToGithub = async (dataPayload) => {
    setStatus({ message: 'Đang lưu đề thi lên Github...', type: 'info' });
    try {
      const response = await fetch('/api/save-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          subject,
          quizData: dataPayload,
          existingFileUrl: editData?.url,
          existingSha: editData?.sha,
          author: currentUser?.username || 'Admin'
        })
      });
      const result = await response.json();
      if (response.ok) {
        setStatus({ message: 'Đã lưu đề thi thành công lên Github!', type: 'success' });
        setSuccessPopup(true);
      } else {
        setStatus({ message: 'Lỗi: ' + result.error, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Lỗi kết nối: ' + err.message, type: 'error' });
    }
  };

  const saveToLearningGithub = async (dataPayload) => {
    setStatus({ message: 'Đang lưu bài học lên Github...', type: 'info' });
    try {
      // Ép kiểu grade thành số (ví dụ: "class1" -> 1)
      const numericGrade = parseInt(grade.replace('class', '')) || 1;
      const finalPayload = { grade: numericGrade, ...dataPayload };

      const response = await fetch('/api/save-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          subject,
          learningData: finalPayload,
          existingFileUrl: editData?.url,
          existingSha: editData?.sha,
          author: currentUser?.username || 'Admin'
        })
      });
      const result = await response.json();
      if (response.ok) {
        setStatus({ message: 'Đã lưu Bài Học thành công lên Github!', type: 'success' });
        setSuccessPopup(true);
      } else {
        setStatus({ message: 'Lỗi: ' + result.error, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Lỗi kết nối: ' + err.message, type: 'error' });
    }
  };

  // 2. Logic "Màng Lọc AI" siêu chặt chẽ cho nút "Lưu Đề" ở Tab Paste AI
  const handleSaveAI = () => {
    try {
      if (!masterSchema || !masterSchema[subject]) throw new Error("Chưa tải xong Master Schema từ Github!");
      const parsed = JSON.parse(aiJson);
      
      // Cross-check (Kiểm duyệt chéo)
      const subjectTypes = masterSchema[subject].types || {};
      
      parsed.questions.forEach((q, index) => {
        if (!subjectTypes[q.type]) {
          throw new Error(`Câu hỏi ${index + 1} có loại bài '${q.type}' không tồn tại trong hệ thống cho môn này!`);
        }
        
        const requiredFields = Object.keys(subjectTypes[q.type].fields || {});
        for (const field of requiredFields) {
          if (q[field] === undefined || q[field] === '') {
            throw new Error(`Câu hỏi ${index + 1} (${q.type}) bị thiếu trường bắt buộc: "${field}". App Android sẽ bị lỗi nếu thiếu trường này!`);
          }
        }
      });

      saveToGithub(parsed); // Nếu pass màng lọc thì cho qua
    } catch (e) {
      alert('Lỗi Validate: ' + e.message);
      setStatus({ message: 'Lỗi Validate: ' + e.message, type: 'error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Logic Validate cho AI sinh Từ Vựng (Học Tập)
  const handleSaveLearningAI = () => {
    try {
      const parsed = JSON.parse(learningAiJson);
      
      if (!parsed.title || !parsed.words || !Array.isArray(parsed.words)) {
        throw new Error("JSON không hợp lệ! Bắt buộc phải có 'title' và mảng 'words'.");
      }
      
      if (parsed.words.length === 0) {
        throw new Error("Mảng 'words' không được để trống!");
      }

      parsed.words.forEach((w, idx) => {
        if (w.word === undefined || w.word === '') {
          throw new Error(`Từ vựng số ${idx + 1} bị thiếu trường 'word'!`);
        }
        if (w.meaning === undefined || w.meaning === '') {
          throw new Error(`Từ vựng số ${idx + 1} bị thiếu trường 'meaning'!`);
        }
      });

      saveToLearningGithub(parsed);
    } catch (e) {
      alert('Lỗi Validate AI Học Tập: ' + e.message);
      setStatus({ message: 'Lỗi Validate AI Học Tập: ' + e.message, type: 'error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditFile = async (fileUrl, category, sbj, grd, author, isViewOnly = false) => {
    setStatus({ message: 'Đang tải dữ liệu bài cũ...', type: 'info' });
    try {
      const res = await fetch(`/api/get-file?fileUrl=${encodeURIComponent(fileUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditData({ url: fileUrl, sha: data.sha, content: data.content, author });
      setGrade(grd);
      setSubject(sbj);
      setActiveView(category === 'assignments' ? 'dashboard' : 'learning');
      
      setIsReadOnlyGlobal(isViewOnly);
      
      if (category === 'assignments') setActiveTab('form');
      if (category === 'learning') setLearningTab('form');
      
      setStatus({ message: 'Đã nạp dữ liệu cũ để chỉnh sửa!', type: 'success' });
      // Xóa message sau 3s
      setTimeout(() => setStatus({ message: '', type: '' }), 3000);
    } catch (err) {
      setStatus({ message: 'Lỗi tải file: ' + err.message, type: 'error' });
    }
  };

  if (!isMounted) return null;

  if (showLanding) {
    return <IntroLanding onEnter={() => setShowLanding(false)} skipAnimation={skipIntroAnimation} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', margin: '10vh auto', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>QuizApp Admin</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Hệ thống quản trị và soạn đề thi</p>
        
        {status.message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '8px', background: status.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: status.type === 'error' ? '#991B1B' : '#065F46' }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            className="premium-input" 
            placeholder="Tên đăng nhập..." 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="premium-input" 
            placeholder="Mật khẩu..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="premium-btn">Đăng Nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ position: 'relative', display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <Sidebar user={currentUser} onLogout={handleLogout} onSwitchTab={(view) => { setActiveView(view); setIsSidebarOpen(false); }} activeView={activeView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onHome={() => { setSkipIntroAnimation(true); setShowLanding(true); }} />

      {/* Cột Nội Dung Bên Phải */}
      <div className="main-content" style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto', height: '100vh', overflowY: 'auto' }}>
        
        {/* Mobile Header Menu Button */}
        <div className="mobile-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
           <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
           <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--primary)' }}>QuizApp</h2>
        </div>

        {activeView === 'accounts' && currentUser?.role === 'ADMIN' && (
          <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
            <AccountManager subjectsData={subjectsData} />
          </div>
        )}

        {activeView === 'appconfig' && currentUser?.role === 'ADMIN' && (
          <AppConfigManager user={currentUser} />
        )}

        {activeView === 'regions' && currentUser?.role === 'ADMIN' && (
          <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
            <RegionManager />
          </div>
        )}

      {activeView === 'change-password' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto', marginTop: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><span>🔐</span> Đổi Mật Khẩu</h2>
          
          {status.message && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: status.type === 'error' ? '#991B1B' : '#065F46', fontWeight: '500' }}>
              {status.message}
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            const oldPass = e.target.oldPass.value;
            const newPass = e.target.newPass.value;
            const confirmPass = e.target.confirmPass.value;

            if (newPass !== confirmPass) {
              return setStatus({ message: 'Mật khẩu xác nhận không khớp!', type: 'error' });
            }

            setStatus({ message: 'Đang xử lý...', type: 'info' });
            try {
              const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username, oldPassword: oldPass, newPassword: newPass })
              });
              const data = await res.json();
              if (res.ok) {
                setStatus({ message: 'Đổi mật khẩu thành công!', type: 'success' });
                e.target.reset();
              } else {
                setStatus({ message: data.error, type: 'error' });
              }
            } catch (err) {
              setStatus({ message: 'Lỗi kết nối', type: 'error' });
            }
          }}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Mật khẩu hiện tại</label>
              <input type="password" name="oldPass" required className="premium-input" placeholder="Nhập mật khẩu cũ..." />
            </div>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Mật khẩu mới</label>
              <input type="password" name="newPass" required minLength="6" className="premium-input" placeholder="Mật khẩu mới (ít nhất 6 ký tự)..." />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Xác nhận mật khẩu mới</label>
              <input type="password" name="confirmPass" required minLength="6" className="premium-input" placeholder="Nhập lại mật khẩu mới..." />
            </div>
            <button type="submit" className="premium-btn" style={{ width: '100%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>Lưu Mật Khẩu</button>
          </form>
        </div>
      )}

      {activeView === 'learning' && (
        <>
          <header className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(254, 242, 242, 0.9)' }}>
            <h2 style={{ color: 'var(--secondary)' }}>📚 Học Tập</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select className="premium-input" style={{ width: 'auto' }} value={grade} onChange={e=>setGrade(e.target.value)}>
                {['class1', 'class2', 'class3', 'class4', 'class5'].map(g => {
                  if (currentUser?.role !== 'ADMIN' && !currentUser?.grades?.includes(g)) return null;
                  return <option key={g} value={g}>Lớp {g.replace('class', '')}</option>;
                })}
              </select>
              <select className="premium-input" style={{ width: 'auto' }} value={subject} onChange={e=>setSubject(e.target.value)}>
                {subjectsData && Object.keys(subjectsData).map(key => {
                  if (currentUser?.role !== 'ADMIN' && !currentUser?.subjects?.includes(key)) return null;
                  return <option key={key} value={key}>{subjectsData[key].name}</option>;
                })}
              </select>
            </div>
          </header>

          {status.message && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.type === 'error' ? '#FEE2E2' : status.type === 'info' ? '#DBEAFE' : '#D1FAE5', color: status.type === 'error' ? '#991B1B' : status.type === 'info' ? '#1E40AF' : '#065F46', fontWeight: '500' }}>
              {status.message}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '0', transition: 'all 0.4s ease', background: learningTab === 'form' ? 'rgba(254, 242, 242, 0.85)' : 'rgba(255, 241, 242, 0.85)', border: learningTab === 'form' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(225, 29, 72, 0.3)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
              <button 
                onClick={() => setLearningTab('form')}
                style={{ flex: 1, padding: '1rem', border: 'none', background: learningTab === 'form' ? 'rgba(255,255,255,0.8)' : 'transparent', fontWeight: learningTab === 'form' ? 'bold' : 'normal', color: learningTab === 'form' ? 'var(--secondary)' : 'var(--text-muted)', borderTopLeftRadius: '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                ✍️ Nhập Tay (Form)
              </button>
              <button 
                onClick={() => setLearningTab('ai')}
                style={{ flex: 1, padding: '1rem', border: 'none', background: learningTab === 'ai' ? 'rgba(255,255,255,0.8)' : 'transparent', fontWeight: learningTab === 'ai' ? 'bold' : 'normal', color: learningTab === 'ai' ? 'var(--secondary)' : 'var(--text-muted)', borderTopRightRadius: '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                🤖 Dán JSON (AI)
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              {(() => {
                return (
                  <>
                    {learningTab === 'ai' && (
                      <div>
                        <p style={{ marginBottom: '1rem' }}>Hãy copy dòng Prompt này gửi cho ChatGPT / Claude:</p>
                        <pre className="premium-input" style={{ background: '#f8fafc', marginBottom: '1.5rem', whiteSpace: 'pre-wrap', borderLeft: '4px solid var(--secondary)' }}>
                          {`Hãy đóng vai một chuyên gia ngôn ngữ học, tạo cho tôi một bài học gồm 10 từ vựng tiếng Anh chủ đề [BẠN TỰ ĐIỀN] dành cho học sinh lớp ${grade.replace('class','')}, trả về duy nhất MỘT chuỗi JSON.\n\n`}
                          {`[CẤU TRÚC JSON BẮT BUỘC]\n`}
                          {`{\n  "title": "Tên bài học tiếng Việt (vd: Từ vựng Động Vật)",\n  "rewardPoints": 20,\n  "words": [\n    { "word": "Dog", "meaning": "Con chó", "emoji": "🐶" },\n    // ... thêm 9 từ nữa\n  ]\n}`}
                        </pre>
                        
                        <textarea 
                          className="premium-input" 
                          rows="10" 
                          placeholder='Dán đoạn JSON mà AI vừa sinh ra vào đây...'
                          value={learningAiJson}
                          onChange={e => setLearningAiJson(e.target.value)}
                          style={{ resize: 'vertical', marginBottom: '1.5rem' }}
                          disabled={isReadOnlyGlobal}
                        />
                        {!isReadOnlyGlobal && (
                          <button className="premium-btn" style={{ width: '100%', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' }} onClick={handleSaveLearningAI}>
                            Lưu Bài Học Lên Github
                          </button>
                        )}
                      </div>
                    )}

                    {learningTab === 'form' && (
                      <LearningForm key={`learning-${formResetKey}`} subject={subject} onSave={saveToLearningGithub} initialData={editData?.content} readOnly={isReadOnlyGlobal} />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {activeView === 'intro' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <header className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h2 style={{ color: '#059669', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📖</span> Hướng Dẫn Sử Dụng Hệ Thống
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', margin: 0 }}>
              Khám phá cách tận dụng tối đa sức mạnh của Quiz Admin Portal để ra đề thi hiệu quả.
            </p>
          </header>

          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '1rem', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <video 
                controls 
                autoPlay 
                loop 
                muted
                style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
              >
                <source src="/intro-video.mp4" type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span> 1. Soạn Đề Thi / Học Tập
              </h3>
              <p style={{ lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '1rem' }}>
                Tại menu <strong>Soạn Đề Thi</strong> và <strong>Học Tập</strong>, bạn có 2 cách để tạo bài tập mới:
              </p>
              <ul style={{ lineHeight: '1.8', color: 'var(--text-main)', paddingLeft: '1.5rem' }}>
                <li><strong>Cách 1 (Soạn Thủ Công):</strong> Nhập trực tiếp từng câu hỏi vào Form. Hệ thống sẽ tự động vẽ ra các ô nhập liệu tùy theo Dạng câu hỏi (Ví dụ: Trắc nghiệm sẽ có 4 ô đáp án, Toán đố sẽ có ô nhập đề bài...). Bạn có thể tùy chỉnh Điểm thưởng (Reward Points) cho từng bài.</li>
                <li><strong>Cách 2 (Copy/Paste từ AI):</strong> Đây là tính năng mạnh mẽ nhất. Hệ thống đã chuẩn bị sẵn một <strong>Prompt</strong> cực chuẩn. Bạn chỉ việc copy nó, gửi cho ChatGPT/Claude, sau đó copy nguyên văn kết quả JSON trả về dán vào ô nhập liệu. Quá trình tạo 10 câu hỏi chỉ mất chưa tới 10 giây!</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📁</span> 2. Quản Lý Dữ Liệu & Sửa Đề
              </h3>
              <p style={{ lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '1rem' }}>
                Toàn bộ dữ liệu bạn tạo ra đều được lưu an toàn trên Github. Tại màn hình <strong>Quản Lý Dữ Liệu</strong>:
              </p>
              <ul style={{ lineHeight: '1.8', color: 'var(--text-main)', paddingLeft: '1.5rem' }}>
                <li><strong>Trạng thái:</strong> Bạn có thể dễ dàng nhìn thấy file nào đang "Active" (đang hiển thị cho học sinh) và "Inactive" (đã bị xóa mềm).</li>
                <li><strong>Xóa bài (Soft Delete):</strong> Khi bấm biểu tượng 🗑️ Xóa, file không bị xóa vĩnh viễn khỏi hệ thống mà chỉ bị chuyển trạng thái thành Inactive để ẩn khỏi học sinh. Bạn luôn có thể khôi phục lại khi cần.</li>
                <li><strong>Chỉnh sửa (Edit):</strong> Nếu phát hiện đề sai, bấm biểu tượng ✏️ Sửa. Hệ thống sẽ mở lại bài tập đó lên màn hình Soạn đề, điền sẵn thông tin cũ để bạn sửa đổi.</li>
              </ul>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ color: '#F59E0B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span> 3. Phân Quyền (Dành cho Quản trị)
              </h3>
              <p style={{ lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '1rem' }}>
                Tại menu <strong>Quản Lý User</strong> (chỉ ADMIN mới thấy), Quản trị viên có thể:
              </p>
              <ul style={{ lineHeight: '1.8', color: 'var(--text-main)', paddingLeft: '1.5rem' }}>
                <li>Tạo tài khoản mới cho giáo viên.</li>
                <li>Giới hạn quyền truy cập: Một giáo viên có thể chỉ được cấp quyền biên soạn nội dung cho môn Toán, môn Tiếng Anh, v.v.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeView === 'manage' && (
        <FileManager user={currentUser} onEditFile={handleEditFile} />
      )}

      {activeView === 'dashboard' && (
        <>
          <header className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>📝 Soạn Đề Mới</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select className="premium-input" style={{ width: 'auto' }} value={grade} onChange={e=>setGrade(e.target.value)}>
                {['class1', 'class2', 'class3', 'class4', 'class5'].map(g => {
                  if (currentUser?.role !== 'ADMIN' && !currentUser?.grades?.includes(g)) return null;
                  return <option key={g} value={g}>Lớp {g.replace('class', '')}</option>;
                })}
              </select>
              <select className="premium-input" style={{ width: 'auto' }} value={subject} onChange={e=>setSubject(e.target.value)}>
                {subjectsData && Object.keys(subjectsData).map(key => {
                  if (currentUser?.role !== 'ADMIN' && !currentUser?.subjects?.includes(key)) return null;
                  return <option key={key} value={key}>{subjectsData[key].name}</option>;
                })}
              </select>
            </div>
          </header>

          {status.message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.type === 'error' ? '#FEE2E2' : status.type === 'info' ? '#DBEAFE' : '#D1FAE5', color: status.type === 'error' ? '#991B1B' : status.type === 'info' ? '#1E40AF' : '#065F46', fontWeight: '500' }}>
          {status.message}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0', transition: 'all 0.4s ease', background: activeTab === 'form' ? 'rgba(236, 253, 245, 0.85)' : 'rgba(245, 243, 255, 0.85)', border: activeTab === 'form' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setActiveTab('form')}
            style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'form' ? 'rgba(255,255,255,0.8)' : 'transparent', fontWeight: activeTab === 'form' ? 'bold' : 'normal', borderTopLeftRadius: '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
            ✍️ Soạn Thủ Công (Form)
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'ai' ? 'rgba(255,255,255,0.8)' : 'transparent', fontWeight: activeTab === 'ai' ? 'bold' : 'normal', borderTopRightRadius: '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
            🤖 Copy/Paste từ AI
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {activeTab === 'ai' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold' }}>Chọn loại câu hỏi AI cần sinh:</label>
                <select className="premium-input" style={{ width: 'auto' }} value={selectedAiType} onChange={e=>setSelectedAiType(e.target.value)}>
                  {masterSchema && masterSchema[subject] && Object.entries(masterSchema[subject].types || {}).map(([key, value]) => (
                    <option key={key} value={key}>{value.name} ({key})</option>
                  ))}
                </select>
              </div>
              <p style={{ marginBottom: '1rem' }}>Sử dụng prompt sau để AI sinh đề (Copy & Paste vào ChatGPT):</p>
              <pre className="premium-input" style={{ background: '#f8fafc', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                {`Hãy đóng vai giáo viên, tạo 5 câu hỏi môn ${subject} ${grade} trả về MỘT chuỗi JSON hợp lệ.\n\n`}
                {`[CẤU TRÚC JSON BẮT BUỘC]\n`}
                {`{\n  "title": "Tiêu đề bài tập (Bạn tự nghĩ)",\n  "description": "Mô tả bài tập (Bạn tự nghĩ)",\n  "rewardPoints": 20,\n  "questions": [\n    // Danh sách 5 câu hỏi tuân thủ theo template dưới đây:\n  ]\n}\n\n`}
                {`[BỐI CẢNH DỮ LIỆU CỦA TỪNG CÂU HỎI]\n`}
                {`Ý nghĩa các trường dữ liệu AI cần sinh ra trong mỗi câu hỏi:\n`}
                {masterSchema?.[subject]?.types?.[selectedAiType]?.fields 
                  ? Object.entries(masterSchema[subject].types[selectedAiType].fields).map(([key, f]) => `- ${key}: ${f.label}`).join('\n')
                  : 'Đang tải bối cảnh hoặc môn này chưa có câu hỏi nào...'}
                
                {`\n\nMỗi object trong mảng \`questions\` phải tuân thủ chính xác template sau:\n`}
                {masterSchema?.[subject]?.types?.[selectedAiType]?.template 
                  ? JSON.stringify(masterSchema[subject].types[selectedAiType].template, null, 2)
                  : 'Đang tải template...'}
              </pre>
              <textarea 
                className="premium-input" 
                rows="10" 
                placeholder='Dán chuỗi JSON của AI (vd: {"questions": [...]}) vào đây...'
                value={aiJson}
                onChange={e => setAiJson(e.target.value)}
                style={{ resize: 'vertical', marginBottom: '1.5rem' }}
                disabled={isReadOnlyGlobal}
              />
              {!isReadOnlyGlobal && (
                <button className="premium-btn" style={{ width: '100%' }} onClick={handleSaveAI}>
                  Lưu Đề Lên Github
                </button>
              )}
            </div>
          )}

          {activeTab === 'form' && (
            <ManualQuizForm key={`quiz-${formResetKey}`} masterSchema={masterSchema} subject={subject} onSave={saveToGithub} initialData={editData?.content} readOnly={isReadOnlyGlobal} />
          )}
        </div>
      </div>
        </>
      )}
      {/* SUCCESS MODAL POPUP */}
      {successPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.3s' }}>
          <div className="glass-panel" style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ width: '80px', height: '80px', background: '#D1FAE5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 1.5rem auto' }}>
              ✓
            </div>
            <h2 style={{ color: '#065F46', marginBottom: '1rem', fontSize: '1.5rem' }}>Lưu Thành Công!</h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Dữ liệu của bạn đã được đẩy lên Github và sẵn sàng cho App Android!
            </p>
            <button 
              className="premium-btn" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#10B981', borderRadius: '12px' }}
              onClick={() => {
                setSuccessPopup(false);
                setFormResetKey(prev => prev + 1);
                setAiJson('');
                setLearningAiJson('');
                setEditData(null);
                setIsReadOnlyGlobal(false);
                setFormResetKey(Date.now());
                setStatus({ message: '', type: '' });
              }}
            >
              OK, Tuyệt Vời!
            </button>
          </div>
        </div>
      )}
      
      </div> {/* Đóng thẻ Cột Nội Dung Bên Phải */}
    </div>
  );
}
