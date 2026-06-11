'use client';
import { useState, useEffect } from 'react';

export default function AccountManager({ subjectsData }) {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);

  const subjectsList = masterSchema ? Object.keys(masterSchema) : [];

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setStatus({ message: data.error, type: 'error' });
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleToggleGrade = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const handleToggleUserStatus = async (userKey) => {
    const updatedUsers = { ...users };
    const currentStatus = updatedUsers[userKey].status || 'active';
    updatedUsers[userKey].status = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      setStatus({ message: 'Đang cập nhật trạng thái...', type: 'info' });
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: updatedUsers })
      });
      if (res.ok) {
        setStatus({ message: 'Cập nhật trạng thái thành công!', type: 'success' });
        fetchUsers();
      } else {
        const data = await res.json();
        setStatus({ message: data.error, type: 'error' });
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
  };

  const handleSaveUser = async () => {
    if (!username) return setStatus({ message: 'Vui lòng nhập username', type: 'error' });
    
    if (!users[username] && !password) {
      return setStatus({ message: 'Vui lòng nhập password cho tài khoản mới', type: 'error' });
    }

    setStatus({ message: 'Đang lưu lên Github...', type: 'info' });
    
    const updatedUsers = { ...users };
    updatedUsers[username] = {
      role,
      status: users[username]?.status || 'active',
      subjects: role === 'ADMIN' ? ['ALL'] : selectedSubjects,
      grades: role === 'ADMIN' ? ['ALL'] : selectedGrades,
    };
    if (password) {
      updatedUsers[username].password = password;
    }

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: updatedUsers })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ message: 'Lưu thành công!', type: 'success' });
        setPassword('');
        fetchUsers();
      } else {
        setStatus({ message: data.error, type: 'error' });
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
  };

  const handleDelete = async (userKey) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${userKey}?`)) return;
    
    const updatedUsers = { ...users };
    delete updatedUsers[userKey];

    try {
      setStatus({ message: 'Đang xóa...', type: 'info' });
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: updatedUsers })
      });
      if (res.ok) {
        setStatus({ message: 'Xóa thành công!', type: 'success' });
        fetchUsers();
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Quản Lý Tài Khoản (Phân Quyền)</h2>
      
      {status.message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.type === 'error' ? '#FEE2E2' : status.type === 'info' ? '#DBEAFE' : '#D1FAE5', color: status.type === 'error' ? '#991B1B' : status.type === 'info' ? '#1E40AF' : '#065F46' }}>
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '16px' }}>
          <h3>Thêm / Sửa Tài Khoản</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input className="premium-input" placeholder="Tên đăng nhập (Username)..." value={username} onChange={e=>setUsername(e.target.value)} />
            <input type="password" className="premium-input" placeholder="Mật khẩu (Để trống nếu ko đổi)..." value={password} onChange={e=>setPassword(e.target.value)} />
            
            <select className="premium-input" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="TEACHER">Giáo Viên (TEACHER)</option>
              <option value="ADMIN">Quản Trị (ADMIN)</option>
            </select>

            {role === 'TEACHER' && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Được quyền xem/giao bài Môn:</p>
                {subjectsData ? Object.keys(subjectsData).map(subjectKey => (
                  <label key={subjectKey} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedSubjects.includes(subjectKey)}
                      onChange={() => handleToggleSubject(subjectKey)}
                    />
                    {subjectsData[subjectKey].name || subjectKey}
                  </label>
                )) : <span>Đang tải danh sách môn học...</span>}

                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1rem' }}>Được quyền xem/giao bài Lớp:</p>
                {['class1', 'class2', 'class3', 'class4', 'class5'].map(gradeKey => (
                  <label key={gradeKey} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedGrades.includes(gradeKey)}
                      onChange={() => handleToggleGrade(gradeKey)}
                    />
                    Lớp {gradeKey.replace('class', '')}
                  </label>
                ))}
              </div>
            )}
            
            <button className="premium-btn" onClick={handleSaveUser}>Lưu Cập Nhật</button>
          </div>
        </div>

        <div>
          <h3>Danh sách người dùng</h3>
          {loading ? <p>Đang tải từ Github...</p> : (
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--primary)', color: 'white' }}>
                  <th style={{ padding: '10px' }}>Username</th>
                  <th style={{ padding: '10px' }}>Vai trò</th>
                  <th style={{ padding: '10px' }}>Trạng thái</th>
                  <th style={{ padding: '10px' }}>Môn & Lớp</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(users).map(([key, u]) => (
                  <tr key={key} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{key}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '4px 8px', background: u.role === 'ADMIN' ? '#FEE2E2' : '#DBEAFE', color: u.role === 'ADMIN' ? '#991B1B' : '#1E40AF', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleToggleUserStatus(key)} style={{ padding: '4px 8px', background: u.status === 'inactive' ? '#FEE2E2' : '#D1FAE5', color: u.status === 'inactive' ? '#991B1B' : '#065F46', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {u.status === 'inactive' ? 'Inactive' : 'Active'}
                      </button>
                    </td>
                    <td style={{ padding: '10px', fontSize: '0.9rem' }}>
                      {u.role === 'ADMIN' ? 'Tất cả (ALL)' : (
                        <div>
                          <div><strong>Môn:</strong> {(u.subjects || []).join(', ')}</div>
                          <div><strong>Lớp:</strong> {(u.grades || []).join(', ')}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button onClick={() => {
                        setUsername(key);
                        setRole(u.role);
                        setSelectedSubjects(u.subjects || []);
                        setSelectedGrades(u.grades || []);
                        setPassword('');
                      }} style={{ marginRight: '10px', cursor: 'pointer', background: 'transparent', border: 'none', color: '#1E40AF', fontWeight: 'bold' }}>Sửa</button>
                      <button onClick={() => handleDelete(key)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#991B1B', fontWeight: 'bold' }}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
