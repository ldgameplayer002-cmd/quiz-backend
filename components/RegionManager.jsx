'use client';
import { useState, useEffect } from 'react';

export default function RegionManager() {
  const [regions, setRegions] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });

  const [regionId, setRegionId] = useState('');
  const [regionName, setRegionName] = useState('');

  const fetchRegions = async () => {
    try {
      const res = await fetch('/api/regions');
      const data = await res.json();
      if (res.ok) {
        setRegions(data);
      } else {
        setStatus({ message: data.error, type: 'error' });
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleSaveRegion = async () => {
    if (!regionId.trim() || !regionName.trim()) {
      return setStatus({ message: 'Vui lòng nhập Mã Vùng và Tên Vùng', type: 'error' });
    }

    // validate regionId (alphanumeric, no space)
    if (!/^[a-zA-Z0-9_-]+$/.test(regionId)) {
      return setStatus({ message: 'Mã Vùng chỉ được chứa chữ cái không dấu, số, gạch ngang, không khoảng trắng', type: 'error' });
    }

    setStatus({ message: 'Đang lưu lên Github...', type: 'info' });
    
    const updatedRegions = { ...regions };
    updatedRegions[regionId] = {
      name: regionName
    };

    try {
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions: updatedRegions })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ message: 'Lưu thành công!', type: 'success' });
        setRegionId('');
        setRegionName('');
        fetchRegions();
      } else {
        setStatus({ message: data.error, type: 'error' });
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
  };

  const handleDelete = async (key) => {
    if (!confirm(`Bạn có chắc muốn xóa vùng ${key}?`)) return;
    
    const updatedRegions = { ...regions };
    delete updatedRegions[key];

    try {
      setStatus({ message: 'Đang xóa...', type: 'info' });
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions: updatedRegions })
      });
      if (res.ok) {
        setStatus({ message: 'Xóa thành công!', type: 'success' });
        fetchRegions();
      }
    } catch (e) {
      setStatus({ message: e.message, type: 'error' });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>🌍 Quản Lý Vùng (Regions)</h2>
      
      {status.message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.type === 'error' ? '#FEE2E2' : status.type === 'info' ? '#DBEAFE' : '#D1FAE5', color: status.type === 'error' ? '#991B1B' : status.type === 'info' ? '#1E40AF' : '#065F46' }}>
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '16px' }}>
          <h3>Thêm / Sửa Vùng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Mã Vùng (ID)</label>
              <input className="premium-input" placeholder="VD: mien_bac" value={regionId} onChange={e=>setRegionId(e.target.value)} disabled={regions[regionId] !== undefined} />
              <small style={{ color: 'var(--text-muted)' }}>Chữ không dấu, viết liền (không được sửa sau khi tạo)</small>
            </div>
            
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Tên Vùng hiển thị</label>
              <input className="premium-input" placeholder="VD: Miền Bắc" value={regionName} onChange={e=>setRegionName(e.target.value)} />
            </div>
            
            <button className="premium-btn" onClick={handleSaveRegion}>Lưu Cập Nhật</button>
            {regions[regionId] !== undefined && (
              <button 
                onClick={() => { setRegionId(''); setRegionName(''); }} 
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                Hủy / Tạo mới
              </button>
            )}
          </div>
        </div>

        <div>
          <h3>Danh sách các Vùng</h3>
          {loading ? <p>Đang tải từ Github...</p> : (
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--primary)', color: 'white' }}>
                  <th style={{ padding: '10px', borderRadius: '8px 0 0 0' }}>Mã Vùng (ID)</th>
                  <th style={{ padding: '10px' }}>Tên hiển thị</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(regions).map(([key, r]) => (
                  <tr key={key} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{key}</td>
                    <td style={{ padding: '10px' }}>{r.name}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button onClick={() => {
                        setRegionId(key);
                        setRegionName(r.name);
                      }} style={{ marginRight: '10px', cursor: 'pointer', background: 'transparent', border: 'none', color: '#1E40AF', fontWeight: 'bold' }}>Sửa</button>
                      <button onClick={() => handleDelete(key)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#991B1B', fontWeight: 'bold' }}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {Object.keys(regions).length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có Vùng nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
