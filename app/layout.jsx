import './globals.css';

export const metadata = {
  title: 'Hệ thống Soạn Đề QuizApp',
  description: 'Công cụ soạn đề tự động và quản lý kho dữ liệu câu hỏi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
