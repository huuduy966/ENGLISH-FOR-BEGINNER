# Thiết Kế Chi Tiết: Nâng Cấp Phân Hệ “Hôm Nay Học Gì? (Today's Learning)” & Luyện Tập 60 Câu Hằng Ngày Theo Cấp Độ CEFR

- **Ngày tạo**: 2026-10-09
- **Dự án**: English for Beginner (E4B)
- **Mục tiêu**: Chuyển đổi toàn diện khu vực “Hôm nay học gì?” trên Dashboard thành hệ thống luyện tập 60 câu hỏi hằng ngày chuẩn hóa theo cấp độ CEFR (A1–C2) của người dùng; cấu trúc 5 phần (Từ vựng 20 câu, Luyện nói 10 câu, Tìm & sửa lỗi sai 10 câu, Luyện nghe 10 câu, Luyện đọc 10 câu); cơ chế chọn ngẫu nhiên lưu phiên theo ngày (kèm lịch sử, chống reset giữa chừng); chấm điểm bảo mật trên backend (+4 đúng, -2 sai, chặn điểm âm); phản hồi tức thì và tự động chuyển câu sau 1,5 giây khi đúng; cập nhật thẻ thống kê Dashboard “Điểm làm bài” thay thế cho “Từ vựng đã thuộc”.

---

## 1. Cấu Trúc Dữ Liệu & Ngân Hàng Câu Hỏi Hằng Ngày (60 Câu / Bộ)

### 1.1 Cơ sở dữ liệu SQLite (`server/prisma/schema.prisma`)
1. **Mở rộng Model `User`**:
   - `practiceScore Int @default(0)`: Tổng điểm làm bài tích lũy bền vững của người học (độc lập hoàn toàn với `xp`).
2. **Tạo mới Model `DailyPractice`**:
   - `id Int @id @default(autoincrement())`
   - `userId Int`: Khóa ngoại trỏ đến `User.id` (`onDelete: Cascade`)
   - `user User @relation(...)`
   - `date String`: Chuỗi ngày định dạng `YYYY-MM-DD` theo múi giờ địa phương của người dùng
   - `level String`: Cấp độ CEFR của người dùng tại thời điểm tạo bộ đề (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`)
   - `score Int @default(0)`: Điểm số đạt được trong ngày hôm đó
   - `completed Boolean @default(false)`: Trạng thái hoàn thành toàn bộ 60 câu hỏi
   - `currentPart Int @default(1)`: Phần học hiện tại (1..5)
   - `currentQuestionIndex Int @default(0)`: Vị trí câu hỏi hiện tại trong phần học
   - `sessionData String`: Lưu toàn bộ danh sách 60 câu hỏi, các lựa chọn, đáp án, trạng thái hoàn thành từng câu, số lần trả lời sai dưới dạng JSON string.
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`
   - Ràng buộc duy nhất: `@@unique([userId, date])`

### 1.2 Cấu trúc 5 Phần của Bộ Đề 60 Câu Mỗi Ngày
Mỗi bộ luyện tập hằng ngày bao gồm chính xác 60 câu hỏi được phân bổ theo 5 phần:
1. **Phần 1 – Từ vựng (20 câu)**:
   - Trắc nghiệm nghĩa tiếng Việt của từ tiếng Anh.
   - Chọn từ thích hợp với ngữ cảnh câu.
   - Hoàn thành câu với từ vựng chuẩn xác.
2. **Phần 2 – Luyện nói (10 câu)**:
   - Tình huống giao tiếp thực tế (chào hỏi, yêu cầu, cảm ơn, từ chối lịch sự, đàm thoại).
   - Chọn câu phản hồi tự nhiên và chuẩn mực nhất (trắc nghiệm, không bắt buộc ghi âm).
3. **Phần 3 – Tìm và sửa lỗi sai (2 bài $\times$ 5 câu = 10 câu)**:
   - Mỗi bài gồm 5 câu chứa lỗi ngữ pháp, chia thì hoặc cách dùng từ.
   - Người học chọn phương án sửa lỗi chính xác.
4. **Phần 4 – Luyện nghe (2 bài $\times$ 5 câu = 10 câu)**:
   - Mỗi bài gồm 1 đoạn audio (phát âm bản xứ qua Web Speech API / TTS).
   - 5 câu hỏi nghe hiểu bám sát nội dung audio cho mỗi bài.
5. **Phần 5 – Luyện đọc (2 bài $\times$ 5 câu = 10 câu)**:
   - Mỗi bài gồm 1 đoạn văn đọc hiểu hoàn chỉnh phù hợp cấp độ.
   - 5 câu hỏi kiểm tra ý chính, chi tiết và từ vựng trong văn cảnh cho mỗi bài.
   - Đoạn văn luôn hiển thị đồng hành để người học có thể đối chiếu văn bản khi làm bài.

### 1.3 Quy Tắc Phân Cấp Trình Độ CEFR Tuyệt Đối
- Người học ở trình độ nào (ví dụ: `A2`), hệ thống **chỉ lấy câu hỏi từ ngân hàng cấp độ đó**. Tuyệt đối không trộn lẫn câu hỏi từ A1 hoặc B1.
- Ngân hàng câu hỏi được chia theo 6 cấp độ CEFR (`A1` đến `C2`) với độ khó tăng dần rõ rệt về từ vựng, độ dài câu, cấu trúc cú pháp và tính trừu tượng.

---

## 2. Cơ Chế Chọn Câu Hỏi Ngẫu Nhiên Hằng Ngày & Quản Lý Phiên (Session)

1. **Sinh bộ đề theo ngày**:
   - Khi người học truy cập Dashboard, hệ thống kiểm tra bản ghi `DailyPractice` theo `userId` và `date` (`YYYY-MM-DD`).
   - Nếu chưa có: Hệ thống chọn ngẫu nhiên bộ câu hỏi từ ngân hàng câu hỏi của `user.level` và tạo mới bản ghi `DailyPractice`.
   - Nếu đã có: Tải lại nguyên vẹn phiên đang làm (bộ câu hỏi, thứ tự, các câu đã đúng, điểm số và câu đang làm dở).
2. **Tính kiên định (Idempotence & Persistence)**:
   - Tải lại trang (F5), đăng nhập lại hoặc chuyển đổi trang không làm đổi câu hỏi hoặc reset tiến độ.
   - Sang ngày mới: Tự động khởi tạo phiên mới của ngày mới; phiên của các ngày cũ vẫn được lưu lại trong DB làm lịch sử.

---

## 3. Quy Tắc Tính Điểm & Chấm Điểm Backend (Chống Gian Lận)

1. **Quy tắc điểm số**:
   - Trả lời đúng: **+4 điểm**. Mỗi câu chỉ được cộng 4 điểm một lần duy nhất.
   - Trả lời sai: **-2 điểm** cho mỗi lần chọn sai.
   - Chặn điểm âm: Điểm số sau khi trừ không bao giờ thấp hơn $0$ (nếu điểm $< 0 \rightarrow$ đặt về $0$).
2. **Xác thực tại máy chủ (Server-side validation)**:
   - Endpoint `POST /api/dashboard/today-practice/answer`:
     - Nhận: `{ partIndex, questionIndex, selectedOption }`.
     - Backend đối chiếu trực tiếp với đáp án chuẩn trong `sessionData`.
     - Nếu đúng: Đánh dấu câu hoàn thành, cộng điểm vào session và tăng `user.practiceScore`.
     - Nếu sai: Ghi nhận số lần sai, trừ 2 điểm (chặn $\ge 0$).
     - Trả về: `{ isCorrect, pointsDelta, newScore, userPracticeScore, explanation }`.
   - Frontend không gửi điểm tùy tiện; mọi biến động điểm được tính toán và lưu vết tại server.

---

## 4. Thiết Kế Giao Diện Người Dùng (UI/UX)

### 4.1 Khu vực “Hôm nay học gì?” trên Dashboard (`TodaysLearningCard.jsx`)
- **Phần thông tin tổng quan**:
  - Tiêu đề “Hôm nay học gì? (Today's Learning)”.
  - Huy hiệu ngày học: `Hôm nay, DD/MM/YYYY`.
  - Cấp độ hiện tại: `A1..C2`.
  - Chỉ số: Tổng `60 câu hỏi`, Đã hoàn thành `X / 60`, Còn lại `Y câu`.
  - Điểm làm bài hôm nay: `Z điểm`.
  - Thanh tiến độ phần trăm trực quan.
- **5 Thẻ nhiệm vụ theo phần**:
  1. 📘 **Từ vựng**: 20 câu (Hiển thị tiến độ X/20, trạng thái).
  2. 💬 **Luyện nói**: 10 câu (Hiển thị tiến độ X/10, trạng thái).
  3. 🔍 **Tìm & sửa lỗi sai**: 2 bài (10 câu).
  4. 🎧 **Luyện nghe**: 2 bài (10 câu).
  5. 📑 **Luyện đọc**: 2 bài (10 câu).
- **Nút "Bắt đầu ngay" / "Tiếp tục làm bài"**: Mở trực tiếp vào giao diện làm bài tập trung tại đúng câu đang làm dở.

### 4.2 Giao diện làm bài tập trung (`DailyPracticeModal` / Runner)
- **Bố cục làm bài**:
  - Thanh tiêu đề: Tên phần học, Cấp độ, Câu hỏi `X / Y`, Điểm số hiện tại, Nút thoát ra ngoài (lưu tiến độ).
  - Thanh tiến độ câu hỏi mượt mà.
  - Vùng nội dung: Câu hỏi, bài nghe audio (nếu là Luyện nghe) hoặc đoạn văn bản (nếu là Luyện đọc).
  - 4 Phương án lựa chọn A, B, C, D to, rõ ràng, phản hồi hover.
  - **Tuyệt đối KHÔNG có nút "Kiểm tra đáp án"**: Bấm vào phương án là hệ thống kiểm tra ngay lập tức.
- **Quy tắc chuyển câu tự động sau 1,5 giây**:
  - Chọn ĐÚNG:
    - Phương án chuyển màu xanh lá (`bg-emerald-50 border-emerald-500 text-emerald-900`) kèm icon `CheckCircle2`.
    - Thông báo: *"Chính xác! +4 điểm. Đang chuyển câu sau 1,5 giây..."*.
    - Khóa các nút để tránh click trùng.
    - Sau đúng 1.500ms: Tự động chuyển sang câu tiếp theo (hoặc tổng kết phần nếu là câu cuối).
  - Chọn SAI:
    - Phương án chọn chuyển màu đỏ (`bg-rose-50 border-rose-400 text-rose-900`) kèm icon `XCircle`.
    - Thông báo: *"Chưa chính xác! -2 điểm. Hãy thử lại."*.
    - Giữ nguyên câu hỏi, không tự chuyển, cho phép chọn lại cho đến khi đúng.
- **Màn hình tổng kết ngày học**: Khi hoàn thành đủ 60 câu, hiển thị bảng điểm tổng kết (Tổng điểm đạt được, số câu sai, tỷ lệ chính xác) và nút quay về Dashboard.

### 4.3 Cập nhật Hàng Thống Kê Dashboard (`StatsRow.jsx`)
- Thay thế thẻ **“Từ vựng đã thuộc”** bằng **“Điểm làm bài”** (hiển thị `user.practiceScore`).
- Giữ nguyên thẻ Chuỗi ngày (Streak) và Thẻ XP.

---

## 5. Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu
- [ ] Schema Prisma cập nhật `practiceScore` và `DailyPractice`, chạy `db push` thành công.
- [ ] Bộ đề 60 câu tạo đủ 5 phần (20 + 10 + 10 + 10 + 10) cho cả 6 cấp độ A1..C2.
- [ ] API backend tính đúng điểm: +4 đúng, -2 sai, chặn $\ge 0$.
- [ ] Khôi phục đúng phiên khi tải lại trang hoặc đăng nhập lại.
- [ ] Tự động chuyển câu sau 1,5s khi đúng, giữ nguyên khi sai.
- [ ] Không có nút "Kiểm tra đáp án".
- [ ] Thẻ "Điểm làm bài" trên Dashboard cập nhật chính xác từ dữ liệu thật.
- [ ] Chạy `npm run test:server` và `npm run build:client` thành công 100%.
