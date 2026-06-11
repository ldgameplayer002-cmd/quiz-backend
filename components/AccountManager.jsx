'use client';
import { useState, useEffect } from 'react';

export default function AccountManager({ subjectsData }) {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'

  // Picker States for Cross-viewing
  const [pickerRegions, setPickerRegions] = useState([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerTeachers, setPickerTeachers] = useState([]);
  const [grantedTeachers, setGrantedTeachers] = useState([]);


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

  const fetchRegions = async () => {
    try {
      const res = await fetch('/api/regions');
      const data = await res.json();
      if (res.ok) setRegions(data || {});
    } catch(e) {}
  };

  useEffect(() => {
    fetchUsers();
    fetchRegions();
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

  const handleToggleAuthor = (author) => {
    if (selectedAuthors.includes(author)) {
      setSelectedAuthors(selectedAuthors.filter(a => a !== author));
    } else {
      setSelectedAuthors([...selectedAuthors, author]);
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
    if (!username.trim()) {
      return setStatus({ message: 'Vui lòng nhập Tên đăng nhập', type: 'error' });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return setStatus({ message: 'Tên đăng nhập không được chứa khoảng trắng hoặc tiếng Việt có dấu. (Chỉ dùng a-z, 0-9, gạch ngang, gạch dưới)', type: 'error' });
    }
    
    if (!displayName.trim()) {
      return setStatus({ message: 'Vui lòng nhập Họ và Tên', type: 'error' });
    }

    if (viewMode === 'add' && users[username]) {
      return setStatus({ message: 'Username này đã tồn tại', type: 'error' });
    }

    setStatus({ message: 'Đang lưu lên Github...', type: 'info' });
    
    const updatedUsers = { ...users };
    updatedUsers[username] = {
      role,
      displayName,
      status: users[username]?.status || 'active',
      subjects: role === 'ADMIN' ? ['ALL'] : selectedSubjects,
      grades: role === 'ADMIN' ? ['ALL'] : selectedGrades,
      viewableAuthors: role === 'ADMIN' ? ['ALL'] : selectedAuthors,
      region: role === 'ADMIN' ? 'ALL' : selectedRegion,
    };
    
    let finalPassword = password;
    if (viewMode === 'add' && !finalPassword) {
      finalPassword = '1234';
    }

    if (finalPassword) {
      updatedUsers[username].password = finalPassword;
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
        setViewMode('list');
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
        setViewMode('list');
        fetchUsers();
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>Quản Lý Tài Khoản (Phân Quyền)</h2>
        {viewMode === 'list' && (
          <button 
            className="premium-btn" 
            onClick={() => {
              setUsername('');
              setPassword('');
              setDisplayName('');
              setRole('TEACHER');
              setSelectedSubjects([]);
              setSelectedGrades([]);
              setSelectedAuthors([]);
              setSelectedRegion('');
              setPickerRegions([]);
              setPickerSearch('');
              setPickerTeachers([]);
              setGrantedTeachers([]);
              setViewMode('add');
              setStatus({ message: '', type: '' });
            }}
          >
            + Thêm Giáo Viên Mới
          </button>
        )}
      </div>
      
      {status.message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.type === 'error' ? '#FEE2E2' : status.type === 'info' ? '#DBEAFE' : '#D1FAE5', color: status.type === 'error' ? '#991B1B' : status.type === 'info' ? '#1E40AF' : '#065F46' }}>
          {status.message}
        </div>
      )}

      {viewMode === 'list' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {loading ? <p>Đang tải từ Github...</p> : (
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--primary)', color: 'white' }}>
                  <th style={{ padding: '10px', borderRadius: '8px 0 0 0' }}>Tài khoản (ID) / Họ Tên</th>
                  <th style={{ padding: '10px' }}>Chức vụ</th>
                  <th style={{ padding: '10px' }}>Trạng thái</th>
                  <th style={{ padding: '10px' }}>Môn & Lớp</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(users).map(([key, u]) => (
                  <tr key={key} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <td style={{ padding: '10px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{u.displayName || key}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {key}</div>
                    </td>
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
                          <div><strong>Vùng:</strong> {u.region && regions[u.region] ? regions[u.region].name : 'Chưa xếp vùng'}</div>
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
                        setSelectedAuthors(u.viewableAuthors || []);
                        setSelectedRegion(u.region || '');
                        setPassword('');
                        setDisplayName(u.displayName || '');
                        setPickerRegions([]);
                        setPickerSearch('');
                        setPickerTeachers([]);
                        setGrantedTeachers([]);
                        setViewMode('edit');
                        setStatus({ message: '', type: '' });
                      }} className="premium-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                        Xem chi tiết / Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {(viewMode === 'add' || viewMode === 'edit') && (
        <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.7)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
            <button onClick={() => setViewMode('list')} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>←</button>
            <h3 style={{ margin: 0 }}>{viewMode === 'add' ? 'Thêm Tài Khoản Mới' : `Chỉnh Sửa Tài Khoản: ${username}`}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Tên đăng nhập (Username)</label>
              <input className="premium-input" disabled={viewMode === 'edit'} placeholder="Nhập username..." value={username} onChange={e=>setUsername(e.target.value)} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Mật khẩu {viewMode === 'edit' && '(Chỉ nhập khi muốn đổi)'}</label>
              <input type="password" className="premium-input" placeholder={viewMode === 'add' ? "Mặc định hệ thống tạo là: 1234" : "Hệ thống tự tạo hash"} value={password} onChange={e=>setPassword(e.target.value)} />
              {viewMode === 'edit' && <small style={{ color: 'var(--text-muted)' }}>Để trống nếu không muốn đổi pass</small>}
            </div>
            
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Họ và Tên (Tên hiển thị)</label>
              <input className="premium-input" placeholder="VD: Nguyễn Văn A" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Vai trò (Role)</label>
              <select className="premium-input" value={role} onChange={e=>setRole(e.target.value)}>
                <option value="TEACHER">Giáo Viên (TEACHER)</option>
                <option value="ADMIN">Quản Trị (ADMIN)</option>
              </select>
            </div>

            {role === 'TEACHER' && (
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>Vùng hoạt động:</label>
                  <select className="premium-input" value={selectedRegion} onChange={e=>setSelectedRegion(e.target.value)}>
                    <option value="">-- Chọn Vùng --</option>
                    {Object.entries(regions).map(([key, r]) => (
                      <option key={key} value={key}>{r.name}</option>
                    ))}
                  </select>
                </div>
                
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Quyền truy cập Môn học:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  {Object.keys(subjectsData || {}).map(subj => (
                    <label key={subj} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedSubjects.includes(subj)}
                        onChange={() => handleToggleSubject(subj)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      {subjectsData[subj].name}
                    </label>
                  ))}
                </div>

                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Quyền truy cập Lớp học:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['class1', 'class2', 'class3', 'class4', 'class5'].map(grade => (
                    <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedGrades.includes(grade)}
                        onChange={() => handleToggleGrade(grade)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Lớp {grade.replace('class', '')}
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#10B981' }}>Quyền xem chéo bài của giáo viên khác:</p>
                  
                  {/* DUAL PICKER UI */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                    {/* LEFT COLUMN: CÔNG CỤ CHỌN (PICKER) */}
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--primary)', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>1. Bộ Lọc Giáo Viên</h4>
                      
                      {/* Vùng Picker */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Vùng hoạt động:</label>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #F3F4F6', borderRadius: '4px', padding: '0.5rem', background: '#F9FAFB' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '4px', fontWeight: 'bold' }}>
                            <input 
                              type="checkbox" 
                              checked={Object.keys(regions).length > 0 && pickerRegions.length === Object.keys(regions).length}
                              onChange={(e) => setPickerRegions(e.target.checked ? Object.keys(regions) : [])}
                            />
                            [Chọn tất cả vùng]
                          </label>
                          {Object.entries(regions).map(([key, r]) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '4px' }}>
                              <input 
                                type="checkbox" 
                                checked={pickerRegions.includes(key)}
                                onChange={(e) => setPickerRegions(prev => e.target.checked ? [...prev, key] : prev.filter(k => k !== key))}
                              />
                              {r.name}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Giáo viên Picker */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Giáo viên tìm được:</label>
                          <input 
                            type="text" 
                            placeholder="Tìm tên/ID..." 
                            value={pickerSearch} 
                            onChange={e=>setPickerSearch(e.target.value)} 
                            style={{ padding: '2px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #D1D5DB', width: '120px' }} 
                          />
                        </div>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #F3F4F6', borderRadius: '4px', padding: '0.5rem', background: '#F9FAFB' }}>
                          {(() => {
                            const availableForPick = Object.entries(users)
                              .filter(([key, u]) => u.role === 'TEACHER' && key !== username)
                              .filter(([key, u]) => pickerRegions.length === 0 || pickerRegions.includes(u.region))
                              .filter(([key, u]) => !selectedAuthors.includes(key))
                              .filter(([key, u]) => {
                                if (!pickerSearch) return true;
                                const searchLower = pickerSearch.toLowerCase();
                                return key.toLowerCase().includes(searchLower) || (u.displayName || '').toLowerCase().includes(searchLower);
                              });

                            return (
                              <>
                                {availableForPick.length > 0 && (
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '4px', fontWeight: 'bold', color: '#1E40AF' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={pickerTeachers.length > 0 && pickerTeachers.length === availableForPick.length}
                                      onChange={(e) => setPickerTeachers(e.target.checked ? availableForPick.map(([k]) => k) : [])}
                                    />
                                    [Chọn tất cả giáo viên ở dưới]
                                  </label>
                                )}
                                {availableForPick.map(([key, u]) => (
                                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '4px' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={pickerTeachers.includes(key)}
                                      onChange={(e) => setPickerTeachers(prev => e.target.checked ? [...prev, key] : prev.filter(k => k !== key))}
                                    />
                                    {u.displayName || key} ({key})
                                  </label>
                                ))}
                                {availableForPick.length === 0 && <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Không có kết quả.</span>}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <button 
                        className="premium-btn" 
                        disabled={pickerTeachers.length === 0}
                        onClick={() => {
                          setSelectedAuthors(prev => [...new Set([...prev, ...pickerTeachers])]);
                          setPickerTeachers([]);
                        }}
                        style={{ padding: '8px', background: pickerTeachers.length > 0 ? '#10B981' : '#D1D5DB', width: '100%' }}>
                        + Thêm vào danh sách Cấp Quyền
                      </button>
                    </div>

                    {/* RIGHT COLUMN: DANH SÁCH ĐÃ CẤP */}
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ margin: 0, color: '#059669', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>2. Giáo viên ĐƯỢC PHÉP xem</h4>
                      
                      <div style={{ flex: 1, maxHeight: '315px', overflowY: 'auto', border: '1px solid #D1FAE5', borderRadius: '4px', padding: '0.5rem', background: '#F0FDF4' }}>
                        {selectedAuthors.length > 0 ? (
                          <>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px', fontWeight: 'bold', color: '#B45309' }}>
                              <input 
                                type="checkbox" 
                                checked={grantedTeachers.length > 0 && grantedTeachers.length === selectedAuthors.length}
                                onChange={(e) => setGrantedTeachers(e.target.checked ? [...selectedAuthors] : [])}
                              />
                              [Chọn tất cả]
                            </label>
                            {selectedAuthors.map(key => {
                              const u = users[key];
                              if (!u) return null;
                              return (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '4px' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={grantedTeachers.includes(key)}
                                    onChange={(e) => setGrantedTeachers(prev => e.target.checked ? [...prev, key] : prev.filter(k => k !== key))}
                                  />
                                  <span style={{ color: '#065F46', fontWeight: '500' }}>{u.displayName || key}</span>
                                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>({key}) {u.region && regions[u.region] ? `- ${regions[u.region].name}` : ''}</span>
                                </label>
                              );
                            })}
                          </>
                        ) : (
                          <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '2rem', fontSize: '0.9rem' }}>Chưa cấp quyền cho giáo viên nào.</div>
                        )}
                      </div>

                      <button 
                        className="premium-btn" 
                        disabled={grantedTeachers.length === 0}
                        onClick={() => {
                          setSelectedAuthors(prev => prev.filter(k => !grantedTeachers.includes(k)));
                          setGrantedTeachers([]);
                        }}
                        style={{ padding: '8px', background: grantedTeachers.length > 0 ? '#EF4444' : '#D1D5DB', width: '100%' }}>
                        - Xóa quyền (Gỡ khỏi danh sách)
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}
            
            <button className="premium-btn" onClick={handleSaveUser} style={{ padding: '1rem', marginTop: '1rem' }}>
              {viewMode === 'add' ? 'Tạo Tài Khoản' : 'Lưu Cập Nhật'}
            </button>

            {viewMode === 'edit' && username !== 'admin' && (
              <button 
                onClick={() => handleDelete(username)} 
                style={{ marginTop: '1rem', padding: '1rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Xóa Tài Khoản Này
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
