'use client';

export default function Sidebar({ user, onLogout, onSwitchTab, activeView, isOpen, setIsOpen }) {
  if (!user) return null;

  return (
    <div className={`glass-panel sidebar-container ${isOpen ? 'open' : ''}`} style={{ width: '260px', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', background: 'rgba(255, 255, 255, 0.95)', borderRight: '1px solid rgba(0,0,0,0.05)', borderRadius: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem', textAlign: 'center', letterSpacing: '1px' }}>✨ QuizApp</h2>
        {/* Nút đóng chỉ hiện trên Mobile */}
        <button className="mobile-header mobile-menu-btn" style={{ width: '32px', height: '32px', border: 'none', background: '#FEE2E2', color: '#EF4444' }} onClick={() => setIsOpen(false)}>✕</button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        {user.role !== 'REVIEWER' && (
          <button 
            onClick={() => onSwitchTab('dashboard')} 
            style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'dashboard' ? 'var(--primary)' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'dashboard' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📝 Soạn Đề Thi
          </button>
        )}
        
        {user.role !== 'REVIEWER' && (
          <button 
            onClick={() => onSwitchTab('learning')} 
            style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'learning' ? 'var(--secondary)' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'learning' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📚 Học Tập
          </button>
        )}

        <button 
          onClick={() => onSwitchTab('manage')} 
          style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'manage' ? '#8B5CF6' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'manage' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📁 Quản Lý Dữ Liệu
        </button>

        <button 
          onClick={() => onSwitchTab('intro')} 
          style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'intro' ? '#F59E0B' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'intro' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📖 Hướng Dẫn Sử Dụng
        </button>

        {user.role === 'ADMIN' && (
          <button 
            onClick={() => onSwitchTab('regions')} 
            style={{ textAlign: 'left', padding: '1rem 1.2rem', borderRadius: '12px', background: activeView === 'regions' ? '#10B981' : 'transparent', border: 'none', fontWeight: 'bold', color: activeView === 'regions' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🌍 Quản Lý Vùng
          </button>
        )}

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
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Xin chào, {user.displayName || user.username} 👋
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Vai trò: {user.role === 'ADMIN' ? 'Quản Trị Viên' : (user.role === 'REVIEWER' ? 'Người Duyệt' : 'Giáo Viên')}
          </p>
        </div>
        <button 
          className="premium-btn" 
          style={{ padding: '0.75rem', width: '100%', borderRadius: '12px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }} 
          onClick={() => { onSwitchTab('change-password'); setIsOpen(false); }}>
          Đổi Mật Khẩu
        </button>
        <button className="premium-btn secondary" style={{ padding: '0.75rem', width: '100%', borderRadius: '12px' }} onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
