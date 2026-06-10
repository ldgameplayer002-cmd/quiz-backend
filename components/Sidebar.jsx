'use client';

export default function Sidebar({ user, onLogout, onSwitchTab, activeView }) {
  if (!user) return null;

  return (
    <div className="glass-panel" style={{ width: '260px', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', background: 'rgba(255, 255, 255, 0.95)', borderRight: '1px solid rgba(0,0,0,0.05)', borderRadius: 0, zIndex: 10 }}>
      <h2 style={{ color: 'var(--primary)', margin: '0 0 2.5rem 0', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '1px' }}>✨ QuizApp</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        <button 
          onClick={() => onSwitchTab('dashboard')} 
          style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'dashboard' ? 'var(--primary)' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'dashboard' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📝 Soạn Đề Thi
        </button>
        
        <button 
          onClick={() => onSwitchTab('learning')} 
          style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'learning' ? 'var(--secondary)' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'learning' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📚 Học Tập
        </button>

        <button 
          onClick={() => onSwitchTab('manage')} 
          style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'manage' ? '#8B5CF6' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'manage' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📁 Quản Lý Dữ Liệu
        </button>

        <button 
          onClick={() => onSwitchTab('intro')} 
          style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'intro' ? '#F59E0B' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'intro' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
          💡 Giới Thiệu & Hướng Dẫn
        </button>

        {user.role === 'ADMIN' && (
          <button 
            onClick={() => onSwitchTab('accounts')} 
            style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'accounts' ? '#4B5563' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'accounts' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚙️ Quản Lý User
          </button>
        )}
      </div>

      <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>{user.username}</span>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{user.role}</div>
        </div>
        <button className="premium-btn secondary" style={{ padding: '0.75rem', width: '100%', borderRadius: '12px' }} onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
