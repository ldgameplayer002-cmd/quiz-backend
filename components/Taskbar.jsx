'use client';

export default function Taskbar({ user, onLogout, onSwitchTab, activeView }) {
  if (!user) return null;

  return (
    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 2rem', background: 'rgba(255, 255, 255, 0.9)' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.2rem' }}>QuizApp System</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => onSwitchTab('dashboard')} 
            style={{ background: 'none', border: 'none', fontWeight: activeView === 'dashboard' ? 'bold' : 'normal', color: activeView === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
            Soạn Đề Thi
          </button>
          
          <button 
            onClick={() => onSwitchTab('learning')} 
            style={{ background: 'none', border: 'none', fontWeight: activeView === 'learning' ? 'bold' : 'normal', color: activeView === 'learning' ? 'var(--secondary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
            Học Từ Vựng
          </button>

          
          {user.role === 'ADMIN' && (
            <button 
              onClick={() => onSwitchTab('accounts')} 
              style={{ background: 'none', border: 'none', fontWeight: activeView === 'accounts' ? 'bold' : 'normal', color: activeView === 'accounts' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
              Quản Lý Tài Khoản
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontWeight: '500' }}>Xin chào, {user.username} ({user.role})</span>
        <button className="premium-btn secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
