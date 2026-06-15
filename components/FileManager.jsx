'use client';
import { useState, useEffect } from 'react';

export default function FileManager({ user, onEditFile }) {
  const [grade, setGrade] = useState(user?.role !== 'ADMIN' && user?.grades?.length ? user.grades[0] : 'class1');
  const [subject, setSubject] = useState(user?.role !== 'ADMIN' && user?.subjects?.length ? user.subjects[0] : 'english');
  const [category, setCategory] = useState('assignments'); // 'assignments' or 'learning'
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState({});
  const [users, setUsers] = useState({});
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const subjectsData = {
    english: "Tiếng Anh",
    math: "Toán"
  };

  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/list-files?grade=${grade}&subject=${subject}&category=${category}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải danh sách');
      let fetchedFiles = data.files || [];
      if (user?.role === 'TEACHER') {
        const allowedAuthors = user.viewableAuthors || [];
        fetchedFiles = fetchedFiles.filter(f => {
          const isMine = f.author === user.username;
          const isLegacy = !f.author;
          const isCrossView = allowedAuthors.includes(f.author) || allowedAuthors.includes('ALL');
          return isMine || isLegacy || isCrossView;
        });
      }
      setFiles(fetchedFiles);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/regions').then(res=>res.json()).then(setRegions).catch(console.error);
    fetch('/api/auth/users').then(res=>res.json()).then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    if (!subject || !grade) return;
    fetchFiles();
  }, [grade, subject, category]);

  const handleToggleStatus = async (file) => {
    const newStatus = file.status === 'active' ? 'inactive' : 'active';
    if (!confirm(`Bạn có chắc muốn chuyển bài này sang trạng thái ${newStatus.toUpperCase()}?`)) return;

    try {
      const res = await fetch('/api/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          subject,
          category,
          newStatus,
          fileData: file
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi toggle status');
      
      // Tải lại danh sách
      fetchFiles();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const availableTeachers = Object.entries(users)
    .filter(([key, u]) => u.role === 'TEACHER')
    .filter(([key, u]) => {
       if (user?.role === 'ADMIN') return true;
       return key === user?.username || (user?.viewableAuthors || []).includes(key) || (user?.viewableAuthors || []).includes('ALL');
    });

  const availableRegions = [...new Set(availableTeachers.map(([key, u]) => u.region).filter(Boolean))];

  const filteredTeachersForDropdown = selectedRegion 
    ? availableTeachers.filter(([key, u]) => u.region === selectedRegion)
    : availableTeachers;

  const displayFiles = files.filter(f => {
    if (selectedTeacher) {
      if (selectedTeacher === 'LEGACY') return !f.author;
      return f.author === selectedTeacher;
    }
    if (selectedRegion) {
      const teachersInRegion = filteredTeachersForDropdown.map(([k]) => k);
      return teachersInRegion.includes(f.author) || !f.author;
    }
    return true;
  });

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <header className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(139, 92, 246, 0.1)' }}>
        <h2 style={{ color: '#6D28D9', margin: 0 }}>📁 Quản Lý Bài Tập</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="premium-input" style={{ width: 'auto' }} value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="assignments">Đề Thi (Assignments)</option>
            <option value="learning">Học Tập (Learning)</option>
          </select>
          <select className="premium-input" style={{ width: 'auto' }} value={grade} onChange={e=>setGrade(e.target.value)}>
            {['class1', 'class2', 'class3', 'class4', 'class5'].map(g => {
              if (user?.role !== 'ADMIN' && !user?.grades?.includes(g)) return null;
              return <option key={g} value={g}>Lớp {g.replace('class', '')}</option>;
            })}
          </select>
          <select className="premium-input" style={{ width: 'auto' }} value={subject} onChange={e=>setSubject(e.target.value)}>
            {Object.keys(subjectsData).map(k => {
              if (user?.role !== 'ADMIN' && !user?.subjects?.includes(k)) return null;
              return <option key={k} value={k}>{subjectsData[k]}</option>;
            })}
          </select>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <select className="premium-input" value={selectedRegion} onChange={e => { setSelectedRegion(e.target.value); setSelectedTeacher(''); }} style={{ flex: 1 }}>
            <option value="">🌍 Tất cả Vùng</option>
            {availableRegions.map(reg => (
              <option key={reg} value={reg}>{regions[reg] ? regions[reg].name : reg}</option>
            ))}
          </select>
          <select className="premium-input" value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} style={{ flex: 1 }}>
            <option value="">👨‍🏫 Tất cả Giáo viên</option>
            {filteredTeachersForDropdown.map(([key, u]) => (
              <option key={key} value={key}>{u.displayName || key} ({key})</option>
            ))}
            {!selectedRegion && <option value="LEGACY">📂 Đề chung (Không rõ tác giả)</option>}
          </select>
          <button className="premium-btn" onClick={fetchFiles} disabled={loading} style={{ alignSelf: 'flex-start' }}>
            🔄 Làm mới
          </button>
        </div>

        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải danh sách...</p>}
        {error && <p style={{ color: '#991B1B', background: '#FEE2E2', padding: '1rem', borderRadius: '8px' }}>{error}</p>}
        
        {!loading && !error && displayFiles.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '3rem' }}>Không có bài tập nào trong thư mục này.</p>
        )}

        {!loading && displayFiles.length > 0 && (
          <div style={{ width: '100%', overflowX: 'auto', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '700px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 10 }}>
                <tr style={{ borderBottom: '2px solid #E5E7EB', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', width: '40%' }}>Tên Bài / Tên File</th>
                  <th style={{ padding: '1rem', width: '15%' }}>Ngày Tạo</th>
                  <th style={{ padding: '1rem', width: '15%' }}>Người Tạo</th>
                  <th style={{ padding: '1rem', width: '10%' }}>Trạng Thái</th>
                  <th style={{ padding: '1rem', textAlign: 'right', width: '20%' }}>Hành Động</th>
                </tr>
              </thead>
            <tbody>
              {displayFiles.map((f, i) => {
                const isMine = f.author === user?.username;
                const isAdmin = user?.role === 'ADMIN';
                const canEdit = isAdmin || isMine;

                return (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s', background: 'white' }}>
                  <td style={{ padding: '1rem', overflow: 'hidden' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', wordBreak: 'break-word' }}>
                      {f.title}
                      <span style={{ background: '#E0E7FF', color: '#4338CA', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        v{f.version || 1}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      <a href={f.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {f.fileUrl.split('/').pop()}
                      </a>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{f.date}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {f.author ? (users[f.author]?.displayName || f.author) : 'Tài nguyên chung'} 
                    {f.author && users[f.author] && users[f.author].region ? ` (${regions[users[f.author].region]?.name})` : ''}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {f.status === 'active' ? (
                      <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>Đang dùng</span>
                    ) : (
                      <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>Đã ẩn</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => onEditFile(f.fileUrl, category, subject, grade, f.author)}
                      title="Xem nội dung và đáp án"
                      style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', marginRight: '6px', cursor: 'pointer', fontWeight: '500' }}>
                      👀 Xem
                    </button>
                    {canEdit && (
                      <button 
                        onClick={() => onEditFile(f.fileUrl, category, subject, grade, f.author)}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', marginRight: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        ✏️ Sửa
                      </button>
                    )}
                    {canEdit && (
                      <button 
                        onClick={() => handleToggleStatus(f)}
                        style={{ background: f.status === 'active' ? '#FEE2E2' : '#DBEAFE', color: f.status === 'active' ? '#991B1B' : '#1E40AF', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                        {f.status === 'active' ? 'Ẩn' : 'Hiện'}
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
