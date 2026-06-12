'use client';
import { useState, useEffect } from 'react';

export default function AppConfigManager({ user }) {
  const [config, setConfig] = useState({
    url: '',
    release: 1,
    description: '',
    latestVersionCode: 1,
    latestVersionName: '1.0.0',
    forceUpdate: false
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetch('/api/app-config')
      .then(res => res.json())
      .then(data => {
        setConfig(prev => ({ ...prev, ...data }));
      })
      .catch(err => console.error("Lỗi load config:", err));
  }, []);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn lưu cấu hình và tự động tăng Version cho ứng dụng?")) {
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });
    
    // Auto convert Google Drive links to direct download links
    let finalUrl = config.url.trim();
    const driveRegex = /drive\.google\.com\/file\/d\/([^/]+)/;
    const match = finalUrl.match(driveRegex);
    if (match && match[1]) {
      finalUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    
    try {
      const res = await fetch('/api/app-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: finalUrl,
          release: config.release,
          description: config.description,
          forceUpdate: config.forceUpdate
        })
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Có lỗi xảy ra');
      
      if (resData.data) {
        setConfig(resData.data);
      }
      
      setStatus({ type: 'success', message: 'Lưu cấu hình thành công! Version đã được cập nhật.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
    
    setLoading(false);
  };

  if (user?.role !== 'ADMIN') {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#991B1B' }}>Bạn không có quyền truy cập khu vực này.</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <header className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', background: 'rgba(236, 72, 153, 0.1)' }}>
        <h2 style={{ color: '#BE185D', margin: 0 }}>⚙️ Cài Đặt Ứng Dụng (App Config)</h2>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Cấu Hình Phiên Bản & Tải App</h3>
          <div style={{ background: '#F3F4F6', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Phiên bản hiện tại: <strong style={{ color: 'var(--primary)' }}>v{config.latestVersionName}</strong> (Code: {config.latestVersionCode})
          </div>
        </div>
        
        {status.message && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', background: status.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: status.type === 'success' ? '#065F46' : '#991B1B', fontWeight: '500' }}>
            {status.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Cột Trái: Input Form */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  Release
                </label>
                <input 
                  type="number"
                  min="1"
                  className="premium-input" 
                  value={config.release}
                  onChange={(e) => handleChange('release', e.target.value)}
                  style={{ textAlign: 'center', fontWeight: 'bold' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  Đường dẫn tải App (APK, CH Play...)
                </label>
                <input 
                  type="text"
                  className="premium-input" 
                  placeholder="https://..."
                  value={config.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Chi tiết bản cập nhật (Description)
              </label>
              <textarea 
                className="premium-input" 
                rows="3"
                placeholder="Ví dụ: Vá lỗi giao diện, thêm tính năng làm bài..."
                value={config.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{ resize: 'vertical', marginBottom: '1rem' }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div 
                  onClick={() => handleChange('forceUpdate', !config.forceUpdate)}
                  style={{ 
                    width: '50px', height: '26px', 
                    background: config.forceUpdate ? '#10B981' : '#CBD5E1', 
                    borderRadius: '20px', 
                    position: 'relative', 
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px',
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: config.forceUpdate ? '26px' : '2px',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <div>
                  <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>Bắt buộc cập nhật (Force Update)</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nếu bật, người dùng không thể bỏ qua bản cập nhật này.</span>
                </div>
              </div>
            </div>

            <button 
              className="premium-btn" 
              onClick={handleSave}
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' }}
            >
              {loading ? 'Đang lưu...' : '💾 Lưu Cấu Hình & Tăng Version'}
            </button>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
              * Ghi chú: Cứ mỗi lần bấm lưu, Code (nội bộ) sẽ tự động cộng 1. Version Name (hiển thị) sẽ tự tính toán dựa trên số Release.
            </p>
          </div>

          {/* Cột Phải: Preview QR */}
          <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Mã QR Tải App:</h4>
            <div style={{ 
              width: '220px', height: '220px', 
              background: '#fff', 
              borderRadius: '16px', 
              padding: '10px', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              {(config.url && config.url.trim()) ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(config.url.trim())}`}
                  alt="QR Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>Nhập link tải để tạo QR</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
