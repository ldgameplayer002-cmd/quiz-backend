# Quy Tắc Bắt Buộc Dành Cho AI (AI Rules)

> File này chứa các quy tắc và giới hạn quyền hạn bắt buộc mà AI phải tuân thủ tuyệt đối trong suốt quá trình làm việc với dự án này. AI phải luôn tham chiếu file này trước khi thực hiện hành động để không vượt quá quyền hạn.

## 1. Quy Trình Cập Nhật Code và Triển Khai (Deployment)
- **Kiểm thử Local trước:** Sau khi viết code hoặc sửa tính năng, AI phải dừng lại và yêu cầu người dùng (Admin) kiểm tra (test) trên môi trường local trước (thông qua `npm run dev` hoặc tương đương).
- **Tuyệt đối KHÔNG TỰ Ý PUSH:** AI KHÔNG ĐƯỢC PHÉP tự ý chạy lệnh `git push` để đẩy code lên Github nếu chưa có sự đồng ý hoặc yêu cầu rõ ràng từ người dùng.
- **Xác nhận trước khi deploy:** Việc đẩy code lên Github (đồng nghĩa với việc Vercel sẽ tự động deploy lên production) là quyền quyết định cuối cùng của người dùng. AI phải luôn hỏi ý kiến: *"Sếp test xong chưa, có muốn em push code lên Github không?"*

## 2. Phạm Vi Chỉnh Sửa
- Chỉ thực hiện những thay đổi và thêm tính năng đúng theo yêu cầu cụ thể của người dùng.
- Không tự ý thêm thắt các tính năng ngoài lề hoặc thay đổi cấu trúc dự án nếu không nằm trong kế hoạch đã được duyệt.
- Nếu có đề xuất tối ưu, AI phải trình bày ý tưởng và chờ người dùng duyệt trước khi viết code.
