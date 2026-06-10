'use client';
import { useState, useEffect } from 'react';

export default function IntroLanding({ onEnter }) {
  const [bookState, setBookState] = useState(0); 
  // 0: closed (0-2s) - Tối mờ
  // 1: cover_open (2-4s) - Mở bìa, sáng nhẹ
  // 2: page_turned (4-6s) - Lật trang, sáng mạnh
  // 3: library_lit (6-8s) - Thắp sáng toàn bộ thư viện
  // 4: content_flying (8s+) - Bay chữ ra

  useEffect(() => {
    const t1 = setTimeout(() => setBookState(1), 2000);
    const t2 = setTimeout(() => setBookState(2), 4500);
    const t3 = setTimeout(() => setBookState(3), 7000);
    const t4 = setTimeout(() => setBookState(4), 9500);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleSkip = () => {
    onEnter(); // Bấm Skip là nhảy thẳng vào Hệ thống luôn (Bắt đầu ngay)
  };

  const showContent = bookState >= 4;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100vh',
      background: showContent ? 'linear-gradient(135deg, #EEF2FF 0%, #FDF2F8 100%)' : '#050505',
      transition: 'background 2s ease-in-out',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      padding: '2rem'
    }}>
      
      {/* Ảnh nền Thư viện */}
      {!showContent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'url(/library_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
          animation: 'fadeIn 1s ease-in-out'
        }}></div>
      )}

      {/* Lớp phủ tối mờ cho Thư viện */}
      {!showContent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          opacity: bookState >= 3 ? 0 : 1, // Giây thứ 6 sẽ làm sáng cả thư viện (opacity = 0)
          transition: 'opacity 2s ease-in-out',
          zIndex: 2
        }}></div>
      )}

      {/* 3D Book Animation Container */}
      {!showContent && (
        <div className="book-container">
          {/* Sách (Phần đế / Trang bên phải) */}
          <div style={{
            width: '280px',
            height: '400px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
            // Nằm chéo trên bàn gỗ trong thư viện
            transform: bookState >= 1 
              ? 'rotateX(55deg) rotateZ(-20deg) translateX(140px) translateY(-50px)' 
              : 'rotateX(55deg) rotateZ(-20deg) translateX(0px) translateY(0px)',
            boxShadow: '20px 20px 40px rgba(0,0,0,0.9)'
          }}>
            
            {/* Aura phát sáng nằm dưới gầm sách để tạo hào quang mà không đè lên mặt giấy */}
            <div style={{
              position: 'absolute', width: bookState >= 1 ? '560px' : '280px', height: '100%', 
              left: bookState >= 1 ? '-280px' : '0', top: 0,
              transform: 'translateZ(-45px)', // Nằm hoàn toàn dưới đáy sách (độ dày sách là 40px)
              boxShadow: bookState >= 2 
                ? '0 0 150px 100px rgba(79, 70, 229, 0.9), 0 0 350px 150px rgba(236, 72, 153, 0.8)' // Tăng kịch trần độ rực rỡ của quầng sáng
                : (bookState >= 1 ? '0 0 80px 40px rgba(79, 70, 229, 0.6)' : 'none'),
              transition: 'all 2.5s ease',
              borderRadius: '8px',
              pointerEvents: 'none'
            }}></div>
            
            {/* Cạnh sách (Độ dày 40px) */}
            <div style={{
              position: 'absolute', width: '40px', height: '100%', right: '-40px', top: 0,
              background: '#cbd5e1', transformOrigin: 'left', transform: 'rotateY(90deg)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
              backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
            }}></div>
            <div style={{
              position: 'absolute', width: '100%', height: '40px', bottom: '-40px', left: 0,
              background: '#94a3b8', transformOrigin: 'top', transform: 'rotateX(-90deg)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
              backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
            }}></div>

            {/* Gáy sách ngoài (Outer Spine) */}
            <div style={{
              position: 'absolute', width: '40px', height: '100%', left: '-40px', top: 0,
              backgroundImage: 'url(/book_cover.png)', backgroundSize: 'cover', backgroundPosition: 'left center',
              transformOrigin: 'right', transform: 'rotateY(-90deg)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)',
              zIndex: 2
            }}></div>

            {/* Trang bên phải (Mặt trong bìa sau) */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%', left: 0, top: 0,
              backgroundImage: 'url(/book_pages.png)',
              backgroundSize: '200% 100%',
              backgroundPosition: 'right top', 
              borderRadius: '0 8px 8px 0',
              // Chỉ giữ lại inset shadow, bỏ outer shadow vì đã chuyển qua thẻ Aura
              boxShadow: bookState >= 2 
                ? 'inset 0 0 150px rgba(255,255,255,0.9)' 
                : (bookState >= 1 ? 'inset 0 0 80px rgba(255,255,255,0.7)' : 'inset 0 0 50px rgba(0,0,0,0.8)'),
              transition: 'box-shadow 2.5s ease',
              zIndex: 1
            }}>
              {/* Chỉ giữ lại nếp gấp gáy sách */}
              <div style={{
                position: 'absolute', left: 0, top: 0, width: '40px', height: '100%',
                background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                pointerEvents: 'none', zIndex: 5
              }}></div>
            </div>

            {/* Tờ giấy Lật (Page Turn Layer) */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%', left: 0, top: 0,
              transformOrigin: 'left',
              transformStyle: 'preserve-3d',
              // Xoay -188deg để mép giấy hạ xuống áp sát vào bìa trước đang nằm nghiêng
              transform: bookState >= 2 ? 'rotateY(-188deg) translateZ(1px)' : 'rotateY(0deg) translateZ(1px)', // Nằm trên Base, dưới Bìa
              transition: 'transform 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 3
            }}>
              {/* Mặt phải của tờ giấy (trước khi lật) */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                backgroundImage: 'url(/book_pages.png)', backgroundSize: '200% 100%', backgroundPosition: 'right top',
                boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, width: '40px', height: '100%',
                  background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%)', pointerEvents: 'none'
                }}></div>
              </div>
              {/* Mặt trái của tờ giấy (sau khi lật) */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                backgroundImage: 'url(/book_pages.png)', backgroundSize: '200% 100%', backgroundPosition: 'left top',
                boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  position: 'absolute', right: 0, top: 0, width: '40px', height: '100%',
                  background: 'linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 100%)', pointerEvents: 'none'
                }}></div>
              </div>
            </div>

            {/* Bìa trước */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%', left: 0, top: 0,
              transformOrigin: 'left',
              transformStyle: 'preserve-3d',
              // Xoay -188.5deg để mép ngoài của bìa hạ thấp xuống 41px, chạm chính xác mặt bàn (vì gáy sách cao 40px)
              transform: bookState >= 1 ? 'rotateY(-188.5deg) translateZ(2px)' : 'rotateY(0deg) translateZ(2px)', // Luôn nằm trên cùng khi đóng
              transition: 'transform 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 5
            }}>
              {/* Mặt ngoài bìa trước */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                backgroundImage: 'url(/book_cover.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '0 12px 12px 0',
                boxShadow: 'inset 2px 0 10px rgba(255,255,255,0.2), 5px 5px 15px rgba(0,0,0,0.6)'
              }}></div>
              
              {/* Mặt trong bìa trước */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                backgroundImage: 'url(/book_pages.png)',
                backgroundSize: '200% 100%',
                backgroundPosition: 'left top',
                borderRadius: '12px 0 0 12px',
                boxShadow: bookState >= 2 ? 'inset 0 0 80px rgba(79, 70, 229, 0.5)' : 'inset 0 0 50px rgba(0,0,0,0.8)',
                transition: 'box-shadow 2.5s ease'
              }}>
                <div style={{
                  position: 'absolute', right: 0, top: 0, width: '40px', height: '100%',
                  background: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)', pointerEvents: 'none'
                }}></div>
              </div>
            </div>

            {/* HIỆU ỨNG ÁNH SÁNG TỔNG THỂ (Nằm trên cùng) */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%', left: 0, top: 0,
              pointerEvents: 'none',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(10px)', // Bốc ánh sáng lên cao nhất, phủ cả hai mặt sách
              zIndex: 10
            }}>
              {/* Overlay sáng rực tím hồng trên CẢ 2 MẶT SÁCH */}
              <div style={{
                position: 'absolute', width: '200%', height: '100%', left: '-100%', top: 0,
                background: 'radial-gradient(ellipse at center, rgba(236,72,153,0.2) 0%, rgba(79,70,229,0.1) 60%, transparent 80%)', // Siêu mờ để thấy rõ chữ trên trang sách
                opacity: bookState >= 2 ? 1 : (bookState >= 1 ? 0.6 : 0),
                transition: 'opacity 2.5s ease',
                mixBlendMode: 'screen'
              }}></div>

              {/* Lõi sáng 3D và Hạt ma thuật (Đã xóa vệt sáng vòm dạng mặt phẳng) */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '0%', 
                width: 0, height: 0, // Đóng gói container để định vị chuẩn xác từ tâm
                transformStyle: 'preserve-3d',
                transform: 'translate(-50%, -50%) rotateX(-90deg)', 
                opacity: bookState >= 2 ? 1 : (bookState >= 1 ? 0.6 : 0),
                transition: 'opacity 2.5s ease-in-out'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)', // Lõi sáng nằm chính giữa gáy sách
                  width: '600px', height: '200px',
                  background: 'radial-gradient(ellipse, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(236,72,153,1) 70%, transparent 85%)',
                  filter: 'blur(20px) brightness(1.8)',
                  transition: 'opacity 2.5s ease'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%', transform: 'translate(-50%, -100%)', // Chỉnh hạt sáng bay nhẹ lên trên
                  color: '#fff', fontSize: '6rem', 
                  filter: 'drop-shadow(0 0 25px #fff) drop-shadow(0 0 50px rgba(255,255,255,0.8))', // Gấp đôi viền sáng của hạt bụi
                  animation: bookState >= 1 ? 'fadeInUpBig 1.5s ease infinite alternate' : 'none'
                }}>✨</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nút Bỏ qua (Skip) */}
      {!showContent && (
        <button 
          onClick={handleSkip}
          className="premium-btn btn-pulse" 
          style={{
            position: 'absolute', bottom: '30px', right: '30px',
            background: 'linear-gradient(135deg, #EC4899, #BE185D)', 
            border: 'none',
            color: 'white', padding: '12px 30px', borderRadius: '100px',
            cursor: 'pointer', zIndex: 99,
            fontSize: '1.2rem', fontWeight: 'bold',
            boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4)'
          }}
        >
          Bắt đầu ngay 🚀
        </button>
      )}

      {/* Nội dung chính bay ra từ trung tâm */}
      {showContent && (
        <div style={{
          maxWidth: '850px',
          width: '100%',
          animation: 'flyOutFromCenter 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          margin: 'auto',
          position: 'relative',
          zIndex: 10
        }}>
          <div className="glass-panel" style={{ padding: '3.5rem', background: 'rgba(255, 255, 255, 0.92)' }}>
            <h1 style={{ color: 'var(--primary)', fontSize: '2.8rem', marginBottom: '0.8rem', textAlign: 'center', fontWeight: '800' }}>Quiz Admin Portal</h1>
            <h2 style={{ color: 'var(--text-muted)', fontSize: '1.3rem', fontWeight: '500', marginBottom: '2.5rem', textAlign: 'center' }}>Cổng quản lý và phân phối bài tập thông minh</h2>
            
            <p style={{ lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.15rem' }}>
              <strong>Quiz Admin Portal</strong> là giải pháp hỗ trợ giáo viên tạo, quản lý và gửi bài tập đến học sinh một cách nhanh chóng, đơn giản và hiệu quả. Hệ thống được xây dựng với mong muốn giảm bớt các công việc nhập liệu lặp lại, giúp giáo viên có thêm thời gian tập trung vào việc giảng dạy.
            </p>

            <h3 style={{ color: 'var(--secondary)', marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}><span>🚀</span> Sứ mệnh</h3>
            <p style={{ lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              Trong thời đại công nghệ số, việc chuẩn bị bài tập và tài liệu học tập không nên là gánh nặng. Quiz Admin Portal ra đời nhằm đơn giản hóa quá trình tạo đề, quản lý nội dung và phân phối bài học, giúp việc học tập trở nên linh hoạt và thuận tiện hơn cho cả giáo viên và học sinh.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginTop: '3rem', marginBottom: '3rem' }}>
              <div>
                <h3 style={{ color: '#8B5CF6', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem' }}><span>⚙️</span> Cách thức hoạt động</h3>
                <ul style={{ lineHeight: '1.8', paddingLeft: '1.5rem', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  <li style={{ marginBottom: '8px' }}><strong>Tạo bài tập:</strong> Giáo viên dễ dàng soạn hoặc nhập nội dung bài tập chỉ trong vài phút.</li>
                  <li style={{ marginBottom: '8px' }}><strong>Lưu trữ tập trung:</strong> Tất cả bài tập được quản lý tại một nơi, thuận tiện cho chỉnh sửa.</li>
                  <li style={{ marginBottom: '8px' }}><strong>Phân phối:</strong> Học sinh tiếp cận bài học qua ứng dụng dễ dàng.</li>
                  <li><strong>Quản lý an toàn:</strong> Cập nhật, ẩn nội dung không ảnh hưởng dữ liệu cũ.</li>
                </ul>
              </div>
              
              <div>
                <h3 style={{ color: '#10B981', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem' }}><span>💎</span> Giá trị mang lại</h3>
                <ul style={{ lineHeight: '1.8', listStyleType: 'none', paddingLeft: 0, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  <li style={{ marginBottom: '8px' }}>✨ Tiết kiệm thời gian soạn và quản lý bài tập.</li>
                  <li style={{ marginBottom: '8px' }}>📚 Tổ chức nội dung học tập khoa học, dễ theo dõi.</li>
                  <li style={{ marginBottom: '8px' }}>🤖 Hỗ trợ tạo nội dung bằng trí tuệ nhân tạo.</li>
                  <li style={{ marginBottom: '8px' }}>👨‍🏫 Giảm bớt công việc hành chính cho giáo viên.</li>
                  <li>🎓 Mang đến nguồn bài tập phong phú cho học sinh.</li>
                </ul>
              </div>
            </div>

            <div style={{ padding: '2rem', background: 'var(--bg-gradient-start)', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.1)', marginBottom: '2.5rem' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.8rem', fontSize: '1.3rem' }}>Hướng tới giáo dục hiện đại</h3>
              <p style={{ lineHeight: '1.8', margin: 0, fontSize: '1.1rem' }}>
                Quiz Admin Portal không chỉ là một công cụ quản lý mà còn là cầu nối giữa giáo viên và học sinh. Mục tiêu của sản phẩm là giúp việc tạo và chia sẻ tri thức trở nên đơn giản hơn, để công nghệ thực sự phục vụ cho giáo dục.
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '2.5rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>ThuongTV</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '350px', marginBottom: '0.8rem', lineHeight: '1.6' }}>
                  Được phát triển với niềm đam mê giáo dục và mong muốn tạo ra những công cụ học tập hữu ích.
                </p>
                <a href="mailto:thuongtran04@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>📧 thuongtran04@gmail.com</a>
              </div>
              
              <button 
                onClick={onEnter}
                className="premium-btn btn-pulse" 
                style={{ 
                  fontSize: '1.3rem', 
                  padding: '1.2rem 3.5rem', 
                  borderRadius: '100px',
                  background: 'linear-gradient(135deg, #EC4899, #BE185D)',
                  boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4)'
                }}
              >
                Bắt đầu ngay 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
