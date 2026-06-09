# Hướng dẫn Bàn giao cho AI (AI Handover Document)

Tài liệu này được soạn thảo riêng cho các AI Assistant (Antigravity) ở các phiên làm việc khác nhau, nhằm đảm bảo "tâm ý tương thông", nắm bắt ngay lập tức ý tưởng, kiến trúc và quy trình của dự án Web Backend này.

## 1. Tổng quan Dự án (Project Overview)
- **Tên dự án:** Quiz Backend (Công cụ soạn đề thi)
- **Công nghệ:** Next.js 14 (App Router), React 18, Vanilla CSS (Glassmorphism style).
- **Mục tiêu:** Xây dựng một trang quản trị (Admin/Teacher Panel) cho phép soạn câu hỏi trắc nghiệm và đẩy dữ liệu trực tiếp lên kho Github `ldgameplayer002-cmd/quiz-data`.
- **Ưu điểm kiến trúc:** Không cần Server truyền thống, Backend chỉ là các API Routes của Next.js gọi trực tiếp tới Github API, tối ưu để Deploy lên Vercel miễn phí 100%.

## 2. Luồng Xử lý (Workflow & Features)
- **Bảo mật (Login):** Hiện tại đang dùng 1 Master Password (hardcode là `admin123`) trong file `app/page.jsx` để khóa truy cập. Nếu User nhập đúng, chuyển sang màn hình Soạn đề.
- **Chọn môn & lớp:** Giao diện có Dropdown để chọn khối Lớp (class1 -> class5) và Môn (math, english, vietnamese).
- **Soạn Đề (2 Chế độ):**
  1. **Tab Soạn AI (Đã code khung):** Giáo viên copy prompt đưa cho ChatGPT, lấy cục JSON dán vào Textarea. Khi bấm lưu, file sẽ được parse và gửi xuống API.
  2. **Tab Soạn Form Thủ Công (Chưa hoàn thiện):** Dự kiến cho phép người dùng click thêm câu hỏi, nhập Text/Audio, chọn đáp án đúng qua giao diện UI trực quan. (AI tiếp theo cần tập trung hoàn thiện Tab này nếu User yêu cầu).

## 3. Kiến trúc Backend (Github API)
- **API Endpoint:** `app/api/save-quiz/route.js`
- **Logic:**
  1. Nhận JSON Payload từ giao diện.
  2. Lấy biến môi trường `process.env.GITHUB_TOKEN` (Cấu hình qua file `.env.local` ở máy Dev hoặc mục Environment Variables trên Vercel).
  3. Format JSON và chuyển sang chuỗi `Base64` (Bắt buộc theo chuẩn Github REST API).
  4. Bắn request `PUT` vào Github API (`api.github.com/repos/.../contents/...`) để ghi đè hoặc tạo mới file `quiz_xxx.json`.

## 4. Các Lưu Ý Kỹ Thuật (Technical Guidelines)
- **Giao diện (UI/UX):** Mặc định sử dụng Vanilla CSS trong `app/globals.css`. Tuyệt đối ưu tiên phong cách **Glassmorphism** (Hiệu ứng kính mờ, bóng đổ 3D, Gradient tươi sáng) để tạo cảm giác Premium. Không dùng TailwindCSS trừ khi User chủ động yêu cầu.
- **Cấu trúc Next.js:** Đang dùng cơ chế App Router (`app/page.jsx`, `app/layout.jsx`). Khi viết code có chứa State (useState, useEffect), bắt buộc phải có `'use client';` ở đầu file.
- **Xử lý Dữ liệu:** Khi thao tác với JSON, hãy cẩn thận với Encoding UTF-8 (đặc biệt khi có Tiếng Việt hoặc Emoji). Base64 encoding trong Node.js (`Buffer.from(str, 'utf8').toString('base64')`) đã được xử lý chuẩn để không bị lỗi ký tự.

## 5. Nhiệm vụ tiếp theo (Next Steps)
Khi User mở dự án này lên ở cửa sổ chat mới, AI hãy:
1. Đọc lướt qua file này và các file trong thư mục `app/`.
2. Gợi ý User chạy `npm install` và cài đặt `.env.local`.
3. Sẵn sàng nhận lệnh để hoàn thiện Tab "Soạn Form Thủ Công" hoặc tinh chỉnh màu sắc giao diện theo ý muốn của User.
