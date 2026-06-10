# 🚀 Quiz Admin Portal

> Hệ thống quản trị nội dung bài tập thông minh, đóng vai trò là "Cổng trung chuyển" kết nối giữa Giáo viên và Ứng dụng Android của Học sinh thông qua Github.

---

## 🌟 Giới thiệu tổng quan

**Quiz Admin Portal** là một ứng dụng Web tĩnh (Static Web App) được phát triển bằng Next.js. Nhiệm vụ chính của ứng dụng là cung cấp một giao diện thân thiện để giáo viên có thể soạn thảo bài tập mới, tích hợp trí tuệ nhân tạo (AI) để sinh đề, và quản lý các dữ liệu học tập.

Điểm đặc biệt của hệ thống này là **không sử dụng Database truyền thống**. Thay vào đó, toàn bộ dữ liệu bài tập (JSON) sẽ được Web quản trị kết nối qua API của Github để đẩy trực tiếp vào một kho lưu trữ (Repository) Public. Từ đó, Ứng dụng Android dưới máy học sinh có thể lập tức tải về và hiển thị.

## ✨ Tính năng nổi bật

- **🎨 Thiết kế Glassmorphism:** Giao diện tối giản, hiện đại và sang trọng.
- **✍️ Soạn đề thủ công:** Cung cấp Form điền trực quan cho nhiều dạng câu hỏi khác nhau (Trắc nghiệm, Toán đố, Kéo thả...).
- **🤖 Sinh đề tự động bằng AI:** Hệ thống tự động sinh Prompt (chỉ thị) cực chuẩn theo đúng cấu trúc schema yêu cầu, giáo viên chỉ cần dán JSON AI trả về là xong.
- **📁 Quản lý tập trung:** Hiển thị danh sách các bài tập đã tạo. Hỗ trợ tính năng Xóa Mềm (Soft-delete) bằng cách ẩn khỏi file chỉ mục `index.json`.
- **⚡ Tự động hóa hoàn toàn:** Cấu trúc form nhập liệu, dữ liệu môn học, lớp học được tự động render linh hoạt dựa trên `masterSchema` định nghĩa sẵn trên Github.

## 🏗️ Kiến trúc Hệ Sinh Thái

Hệ thống hoạt động mượt mà nhờ sự kết hợp của 3 nhân tố:

1. **Vercel (Web App - Nơi bạn đang đứng):** Cung cấp giao diện Web cho giáo viên tạo JSON bài tập.
2. **Github (`quiz-data` Repo):** Đóng vai trò làm "Máy chủ CSDL tĩnh", tự động lưu trữ và phân phối file JSON đi khắp nơi miễn phí và cực nhanh.
3. **Android App (Dưới máy học sinh):** Lắng nghe dữ liệu từ `quiz-data` trên Github và hiển thị thành Game/App tương tác.

## 🚀 Hướng dẫn Cài đặt & Chạy cục bộ

### 1. Yêu cầu hệ thống
- Node.js bản 18+ trở lên.
- Git cài đặt trên máy.
- Một Personal Access Token (PAT) của Github với quyền `repo`.

### 2. Khởi tạo dự án
```bash
# Clone source code về máy
git clone https://github.com/ldgameplayer002-cmd/quiz-backend.git
cd quiz-backend

# Cài đặt thư viện
npm install
```

### 3. Cấu hình Biến môi trường
Tạo một file `.env.local` ở thư mục gốc của dự án và điền thông tin sau:
```env
# Chìa khóa để Web có thể đẩy file tự động lên Github
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### 4. Chạy ứng dụng
```bash
npm run dev
```
Mở trình duyệt truy cập vào `http://localhost:3000` và bắt đầu soạn đề!

---

## 👨‍💻 Thông tin Tác giả
- **Tác giả:** thuongtv
- **Email Liên hệ:** thuongtran04@gmail.com

*Xây dựng với ❤️ dành cho Giáo dục!*
