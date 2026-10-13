# English for Beginner (E4B) 🎓
### *Learn English Step by Step - Easy*

Website học tiếng Anh toàn diện, lộ trình từng bước được thiết kế tối ưu dành riêng cho **người mới bắt đầu hoặc người mất gốc tiếng Anh**. Hệ thống giải quyết triệt để câu hỏi trọng tâm: **"Hôm nay tôi cần học gì?"** bằng gói học thông minh mỗi ngày (*Today's Learning Package*).

---

## 🌟 Tính năng Nổi bật (Key Features)

Dự án được xây dựng bám sát 100% tài liệu định hướng `English_for_Beginner.docx`:

1. **Lộ trình học theo từng bước (Step-by-Step Learning Path):**
   - 5 chủ đề nền tảng đời sống: *Chào hỏi & Làm quen (Greetings)*, *Đại từ & Động từ To Be*, *Gia đình (Family)*, *Số đếm & Xem giờ (Numbers & Time)*, *Đồ ăn, thức uống & Gọi món tại quán cà phê (Food & Cafe)*.
2. **Interactive Lesson Player (Trình học tương tác 7 bước):**
   - 🗂️ **Flashcard 3D lật mặt:** Phiên âm chuẩn IPA, nghe phát âm bản xứ, đánh dấu yêu thích/cần ôn.
   - 🗣️ **Luyện phát âm thông minh (Web Speech API):** Nghe mẫu chuẩn US và thu âm qua microphone để so khớp độ chính xác (%).
   - 📖 **Ngữ pháp nền tảng:** Lý thuyết cô đọng, sơ đồ công thức trực quan và ví dụ song ngữ.
   - 🎧 **Luyện nghe (Listening):** Audio hội thoại thực tế, tùy chọn ẩn/hiện Transcript và câu hỏi kiểm tra khả năng nghe.
   - 💬 **Hội thoại phân vai (Roleplay Conversation):** Đóng vai nhân vật A/B trong các ngữ cảnh đời sống thường nhật.
   - 📝 **Bài tập đa dạng:** Trắc nghiệm, điền khuyết, sắp xếp từ thành câu (*Word Order*), nối từ vựng (*Matching*).
   - 🏆 **Quiz cuối bài:** Đánh giá năng lực, chấm điểm tức thì và giải thích đáp án chi tiết.
3. **Kiểm tra trình độ đầu vào (Placement Test):**
   - Bộ đề 20 câu hỏi tăng dần độ khó từ A1 đến B1 theo khung chuẩn CEFR.
   - Tự động phân loại trình độ và gợi ý bài học phù hợp.
4. **Hệ thống tạo động lực (Gamification):**
   - Chuỗi ngày học liên tục (**Streak 🔥** tăng đều đặn khi luyện tập hàng ngày).
   - Điểm làm bài tích lũy (**Practice Score**).
   - Mục tiêu học hôm nay (**Today's Goal Tracker**).
5. **Tra cứu & Sổ tay Từ vựng:**
   - Sổ tay từ vựng: Bộ lọc từ yêu thích, từ cần ôn tập định kỳ.
   - Tra từ điển tức thì (tích hợp API Từ điển mở quốc tế).
6. **Cổng Quản trị Admin (Admin Portal):**
   - Thống kê toàn hệ thống (Học viên, Bài học, Kho từ vựng, Lượt làm bài).
   - CRUD bài học và từ vựng nhanh chóng.

---

## 🛠️ Ngăn xếp Công nghệ (Tech Stack)

- **Frontend:**
  - React 18 / 19 + Vite (Khởi động và build siêu tốc)
  - Tailwind CSS (Giao diện hiện đại, chuẩn Responsive cho PC & Mobile)
  - React Router DOM v6 (Điều hướng SPA & Protected Routes)
  - Lucide React (Hệ thống icons đồng bộ)
  - Web Speech API (Phát âm TTS & Nhận diện giọng nói STT trực tiếp trên trình duyệt)
- **Backend:**
  - Node.js + Express.js RESTful API
  - Prisma ORM + SQLite (Cơ sở dữ liệu dạng file nội bộ `dev.db`, 0-setup không cần cài server MySQL rời)
  - JWT (JSON Web Token) & bcryptjs (Mã hóa mật khẩu & phân quyền Role: `STUDENT` / `ADMIN`)

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Quick Start)

### 1. Cài đặt thư viện:
Từ thư mục gốc dự án:
```bash
npm run install:all
```

### 2. Khởi tạo Cơ sở dữ liệu & Nạp dữ liệu mẫu (Seed Data):
*(Đã được tạo sẵn, nếu cần nạp lại từ đầu bạn chỉ cần chạy)*:
```bash
npm run db:push
npm run db:seed
```

### 3. Khởi chạy Ứng dụng (Chạy song song cả Frontend, Backend & LibreTranslate):
Chỉ cần chạy **1 câu lệnh duy nhất**:
```bash
npm run dev
```

Lệnh trên sẽ tự động khởi chạy đồng thời cả 3 dịch vụ:
- **Frontend (Web):** Mở trình duyệt tại [http://localhost:5173](http://localhost:5173)
- **Backend API:** Chạy tại [http://localhost:5000/api](http://localhost:5000/api)
- **LibreTranslate (Dịch song ngữ Anh - Việt tự host):** Chạy tại [http://127.0.0.1:5001](http://127.0.0.1:5001)

*(Nếu bạn chỉ muốn chạy riêng Frontend & Backend mà không cần LibreTranslate, có thể chạy `npm run dev:app`)*.

---

## 🔑 Tài khoản Mẫu Trải nghiệm (Demo Accounts)

Hệ thống đã nạp sẵn 2 tài khoản mẫu (có nút bấm điền tự động 1-click tại trang Đăng nhập):

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn & Dữ liệu có sẵn |
|---|---|---|---|
| 👤 **Học viên mẫu (Student)** | `student@e4b.com` | `student123` | Đã có sẵn 4 ngày streak, đang học dở Bài 1 |
| 🛡️ **Quản trị viên (Admin)** | `admin@e4b.com` | `admin123` | Toàn quyền vào trang Quản trị `/admin`, thêm/xóa bài học & từ vựng |

*(Bạn cũng có thể tự do bấm **Đăng ký** tài khoản mới và làm bài kiểm tra đầu vào ngay lập tức!)*

---

## 🧪 Kiểm thử Tự động (Automated Verification)

Chạy bộ kiểm thử tự động toàn diện API backend:
```bash
npm run test:server
```
Kết quả kiểm thử: **13/13 test cases đều đạt chuẩn (100% PASS)** bao gồm:
- Xác thực đăng nhập & đăng ký
- Bảo vệ phân quyền Admin (học viên bị chặn 403, admin truy cập 200)
- Nộp bài kiểm tra đầu vào & chấm điểm cấp độ
- Làm bài quiz, tính tỷ lệ đạt và cộng điểm XP
- Cập nhật chuỗi ngày học Streak
