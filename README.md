# 📝 MAKE YOUR PLAN (YourPlan) — Ứng dụng Lập Kế Hoạch & Sơ Đồ Tư Duy Thông Minh

Make Your Plan (YourPlan) là một ứng dụng web hiện đại, trực quan giúp bạn quản lý mục tiêu, viết lách, lập kế hoạch chi tiết và trực quan hóa ý tưởng dưới dạng sơ đồ tư duy (Mindmap) tương tác cao, kết hợp cùng trợ lý trí tuệ nhân tạo AI thông minh.

---

## ✨ Tính năng nổi bật

### 1. 🗂️ Lập Kế Hoạch & Soạn Thảo Phân Cấp (Plans & Writing)
* Quản lý chủ đề: Gom nhóm các kế hoạch theo từng Chủ đề (Topics) với màu sắc sinh động, dễ quản lý.
* Cấu trúc cây tài liệu: Sắp xếp các Kế hoạch/Tài liệu theo dạng cha - con nhiều cấp (Sub-plans) rõ ràng.
* Trình soạn thảo Markdown chuyên nghiệp: Hỗ trợ viết lách định dạng Markdown đầy đủ, ghim tài liệu quan trọng lên đầu (Pin note), tự động lưu trữ dữ liệu.
* Xuất/Nhập dữ liệu: Dễ dàng sao lưu toàn bộ cấu trúc dự án ra tệp tin JSON hoặc nhập lại bất cứ lúc nào.

### 2. 🧠 Sơ Đồ Tư Duy Tương Tác Cao (Smart Mindmap & Tree Canvas)
* Đồng bộ thời gian thực: Cấu trúc danh sách kế hoạch của bạn tự động chuyển hóa thành sơ đồ cây trực quan trên Canvas.
* Tự động cân đối (Auto-Layout):
  * Cân đối 1 bên: Dàn các nhánh gốc ở mép trái và trải rộng các con cháu sang bên phải.
  * Cân đối 2 bên: Đặt nhánh gốc ở giữa, tự động chia đều các nhánh chính sang 2 bên Trái - Phải đối xứng, tạo bố cục cân bằng hoàn mỹ.
* Kéo thả & Di chuyển Canvas (Drag & Drop, Pan & Zoom):
  * Kéo thả tự do để sắp xếp vị trí các nhánh trên không gian Canvas.
  * Cuộn chuột để phóng to/thu nhỏ (Zoom) linh hoạt từ 30% đến 200% không làm ảnh hưởng đến zoom của trình duyệt.
  * Di chuyển Canvas (Panning) mượt mà bằng chuột/trackpad.
  * Thanh công cụ Zoom Toolbar tiện dụng ở góc dưới bên phải, click vào phần trạng thái để Reset nhanh về trạng thái gốc (0, 0) tỉ lệ 100%.
* Liên kết đa phụ mẫu (Multi-Parent Shared Nodes): Cho phép nối một nhánh con dùng chung với nhiều nhánh cha khác nhau (ví dụ: một kỹ năng/nhiệm vụ cần dùng cho nhiều dự án con). Vẽ đường nét đứt màu tím có mũi tên chỉ hướng rõ ràng cùng panel quản lý gỡ liên kết trực quan.
* Bộ đánh chỉ số thông minh (Smart Outline Editor):
  * Tự động nhận diện chỉ số thứ tự theo cấp: Cấp 1 hiển thị số La Mã (I, II...), Cấp 2 hiển thị chữ cái (A, B...), các cấp tiếp theo hiển thị chuỗi số phân tách dạng (1.1, 1.1.1...).
  * Ẩn đánh số đối với các cấp gạch đầu dòng (-, ●) từ cấp 6 trở đi.
  * Cho phép người dùng nhập trực tiếp chữ La Mã/chữ cái vào ô Thứ tự trong Popover, hệ thống sẽ tự động chuyển đổi sang số nguyên chuẩn xác.
* Co giãn chiều cao tự động: Các nhánh có chiều rộng cố định (Root: 180px, Sub: 200px) để thẳng hàng tuyệt đối, chiều cao tự động tính toán theo độ dài văn bản, đảm bảo các nhánh không bao giờ bị chồng đè, dính chữ hay tràn viền.

### 3. 🤖 Trợ Lý AI Thông Minh (Gemini AI Assistant)
* Lên kế hoạch tự động: Chat trực tiếp với AI để nhờ lên dàn ý, ý tưởng, kế hoạch chi tiết.
* Áp dụng một chạm (Apply to Plan): Chỉ với 1 nút bấm, nội dung kế hoạch do AI đề xuất sẽ được tự động áp dụng trực tiếp vào tài liệu bạn đang chọn.
* Đính kèm tài liệu nâng cao: Cho phép đính kèm các tệp tin văn bản thuần như .txt, .md, .json, .csv, .html, .css hoặc các file mã nguồn vào khung chat làm ngữ cảnh để AI phân tích.

---

## 🛠️ Công nghệ sử dụng
* Frontend: React, TypeScript, Vite, Tailwind CSS, Motion (Framer Motion) cho hiệu ứng chuyển động.
* Icons: Lucide-React.
* AI Integration: Google GenAI SDK (Gemini API).
* Styling: Vanilla CSS kết hợp Tailwind CSS để tối ưu hóa hiệu năng render Canvas qua GPU.

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng

### Yêu cầu hệ thống
* Đã cài đặt Node.js phiên bản 18 trở lên.

### Các bước khởi chạy thiết lập

1. Tải mã nguồn và cài đặt thư viện:
   ```bash
   npm install
   ```

2. Cấu hình biến môi trường:
   * Tạo tệp tin .env.local ở thư mục gốc của dự án (nếu chưa có).
   * Thêm khóa API Gemini của bạn vào tệp:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```
     (Bạn có thể lấy khóa API miễn phí từ Google AI Studio)

3. Chạy ứng dụng ở chế độ phát triển (Development):
   ```bash
   npm run dev
   ```
   * Mở trình duyệt và truy cập: http://localhost:5173 để trải nghiệm ứng dụng.

4. Đóng gói sản phẩm (Build Production):
   ```bash
   npm run build
   ```

---

## 📂 Cấu trúc thư mục dự án
* src/App.tsx: Chứa toàn bộ giao diện chính, logic quản lý trạng thái, tính toán Auto-Layout, xử lý sự kiện Pan & Zoom và tích hợp chatbot AI.
* src/types.ts: Khai báo các Interface dữ liệu cốt lõi như Topic, Note (Plan), MindmapNode.
* src/index.css: Cấu hình Tailwind CSS, theme sáng/tối và các CSS custom cho nét đứt SVG, layout canvas.
* server.ts: Mock server hoặc server bổ trợ (nếu có).

---
*Chúc bạn lập kế hoạch hiệu quả cùng Make Your Plan!* 🚀
