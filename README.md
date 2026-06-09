# 🚀 Web Backend Soạn Đề (Next.js)

Dự án này là hệ thống Web Frontend kiêm Backend API (được xây dựng bằng Next.js) giúp giáo viên/phụ huynh soạn đề thi và đẩy dữ liệu trực tiếp lên kho Github `quiz-data`.

## ✨ Các tính năng chính
- **Giao diện hiện đại:** Thiết kế Glassmorphism trong suốt, siêu mượt.
- **Bảo mật:** Màn hình đăng nhập yêu cầu Master Password.
- **Chế độ soạn AI:** Cho phép sinh đề bằng ChatGPT/Gemini, copy chuỗi JSON và dán trực tiếp để hệ thống tự xử lý.
- **Tự động đẩy Github:** Sử dụng Github REST API để tự động tạo file, commit thay đổi mà không cần tải file về máy.

## 🛠 Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Cài đặt Node.js
Nếu máy bạn chưa có Node.js, vui lòng tải và cài đặt bản LTS mới nhất tại trang chủ: [https://nodejs.org](https://nodejs.org). 
Sau khi cài đặt, hãy khởi động lại trình duyệt / phần mềm code (VS Code) để nhận diện lệnh.

### Bước 2: Cấu hình Github Token
Để ứng dụng có quyền ghi đè dữ liệu lên Github Repo của bạn, bạn cần cấp một Token bảo mật.
1. Tạo một file tên là `.env.local` nằm ở cùng thư mục với file `package.json` này.
2. Mở file đó lên và dán nội dung sau vào:
```env
GITHUB_TOKEN=ghp_day_la_ma_token_cua_ban_123456
```
*(Thay thế bằng Personal Access Token thực tế trên Github của bạn).*

### Bước 3: Khởi chạy dự án
Mở Terminal tại thư mục `quiz-backend` này và gõ lần lượt 2 lệnh sau:
```bash
# Cài đặt các thư viện cần thiết
npm install

# Chạy máy chủ môi trường dev
npm run dev
```

Sau khi Terminal báo thành công, mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**.
*(Mật khẩu mặc định để đăng nhập là `admin123`)*.

---

## 🌐 Mẹo: Hosting miễn phí vĩnh viễn trên Vercel
Dự án Next.js này được tối ưu hoàn hảo cho hệ sinh thái **Vercel**. Bạn không cần thuê Server chạy Spring Boot hay Java:
1. Đẩy nguyên thư mục dự án này lên một kho Github riêng của bạn.
2. Đăng nhập [Vercel.com](https://vercel.com), bấm nút **Add New Project**, trỏ vào kho Github vừa tạo.
3. Ở bước cấu hình (Environment Variables), hãy thêm biến `GITHUB_TOKEN` với giá trị token của bạn.
4. Bấm **Deploy**. Vercel sẽ tự động cấp một domain HTTPS miễn phí để bạn dùng ở bất kỳ đâu trên thế giới!
