'use client';
import { useState, useEffect } from 'react';

export default function FileManager({ user, onEditFile }) {
  const [grade, setGrade] = useState(user?.role !== 'ADMIN' && user?.grades?.length ? user.grades[0] : 'class1');
  const [subject, setSubject] = useState(user?.role !== 'ADMIN' && user?.subjects?.length ? user.subjects[0] : 'english');
  const [category, setCategory] = useState('assignments'); // 'assignments' or 'learning'
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setFiles(data.files || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
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
        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải danh sách...</p>}
        {error && <p style={{ color: '#991B1B', background: '#FEE2E2', padding: '1rem', borderRadius: '8px' }}>{error}</p>}
        
        {!loading && !error && files.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '3rem' }}>Không có bài tập nào trong thư mục này.</p>
        )}

        {!loading && files.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', width: '35%' }}>Tên Bài / Tên File</th>
                  <th style={{ padding: '1rem', width: '15%' }}>Ngày Tạo</th>
                  <th style={{ padding: '1rem', width: '15%' }}>Người Tạo</th>
                  <th style={{ padding: '1rem', width: '10%' }}>Trạng Thái</th>
                  <th style={{ padding: '1rem', textAlign: 'right', width: '25%' }}>Hành Động</th>
                </tr>
              </thead>
            <tbody>
              {files.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{f.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{f.fileUrl}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{f.date}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{f.author || 'Admin'}</td>
                  <td style={{ padding: '1rem' }}>
                    {f.status === 'active' ? (
                      <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>Active</span>
                    ) : (
                      <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => onEditFile(f.fileUrl, category, subject, grade)}
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', marginRight: '8px', cursor: 'pointer', fontWeight: '500' }}>
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(f)}
                      style={{ background: f.status === 'active' ? '#FEE2E2' : '#DBEAFE', color: f.status === 'active' ? '#991B1B' : '#1E40AF', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                      {f.status === 'active' ? 'Ẩn (Inactive)' : 'Khôi phục (Active)'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
