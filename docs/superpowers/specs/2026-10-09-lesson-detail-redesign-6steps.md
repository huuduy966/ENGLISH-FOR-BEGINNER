# Thiết Kế Chi Tiết: Tái Cấu Trúc Toàn Bộ Trang Chi Tiết Bài Học & Lộ Trình 6 Bước Chuẩn Hóa

- **Ngày tạo**: 2026-10-09
- **Dự án**: English for Beginner (E4B)
- **Mục tiêu**: Thiết kế lại toàn bộ giao diện và chức năng của trang chi tiết bài học (`LessonDetailPage.jsx`), loại bỏ hoàn toàn phần Hội thoại để rút gọn lộ trình thành 6 bước chuẩn mực, áp dụng cơ chế học tuần tự nghiêm ngặt (cả trong bài học và giữa các bài học), tích hợp cơ chế tự động chuyển câu hỏi sau 1,5 giây khi trả lời đúng, và nâng ngưỡng đạt Quiz cuối bài lên 80%.

---

## 1. Bố Cục Tổng Thể & Giao Diện Mới Của Trang Chi Tiết Bài Học

Giao diện giữ nguyên Sidebar và Header hiện có; toàn bộ khu vực nội dung bài học bên phải được thiết kế lại theo tiêu chuẩn của các nền tảng học ngoại ngữ hiện đại:

### 1.1 Thanh thông tin bài học (Header Info Bar)
- Nút quay lại: `[ ← Danh sách bài học ]`.
- Tiêu đề bài học nổi bật, huy hiệu số thứ tự bài học, huy hiệu cấp độ CEFR (`A1..C2`) và chủ đề bài học.
- Thanh chỉ báo bước học: Hiển thị rõ **"Bước X / 6 – [Tên bước]"**.
- Thanh tiến độ % thời gian thực: Tính toán chính xác theo 6 bước học ($0\% \rightarrow 100\%$). Tuyệt đối không hiển thị $100\%$ khi người học chưa vượt qua Quiz cuối bài.

### 1.2 Thanh lộ trình 6 bước học tập (Step Roadmap Bar)
- **Loại bỏ hoàn toàn bước Hội thoại** khỏi UI, state và luồng học.
- Chuỗi 6 bước tuần tự cố định:
  1. **Bước 1: Từ vựng (Vocabulary)**
  2. **Bước 2: Phát âm (Pronunciation)**
  3. **Bước 3: Ngữ pháp (Grammar)**
  4. **Bước 4: Luyện nghe (Listening)**
  5. **Bước 5: Bài tập (Exercises)**
  6. **Bước 6: Quiz cuối bài (Final Quiz)**
- Trạng thái 3 cấp độ rõ rệt:
  - `Đã hoàn thành` (Completed): Nền xanh ngọc nhạt, icon tích xanh `CheckCircle2`.
  - `Đang học` (Active): Nền xanh dương sáng, viền xanh `border-blue-500`, hiệu ứng phát sáng nhẹ.
  - `Chưa mở khóa` (Locked): Nền xám mờ `opacity-60`, icon ổ khóa `Lock`, thuộc tính `disabled`, không thể bấm nhảy cóc.
- **Quy tắc bảo vệ tuần tự**: Người học chỉ có thể truy cập các bước $\le \text{unlockedStepIndex}$. Không thể đổi URL hoặc tải lại trang để truy cập bước tương lai.

### 1.3 Khu vực học chính (Main Stage Area)
- Chiếm trọn không gian trung tâm, căn chỉnh cân đối, loại bỏ khoảng trắng dư thừa.
- Chỉ hiển thị nội dung của bước đang học.
- Thẻ học bo góc tròn `rounded-3xl`, viền mờ `border-slate-200/90`, bóng mờ tinh tế `shadow-sm`.
- Hoàn toàn responsive trên Mobile (375px+), Tablet và Desktop.

### 1.4 Thanh điều hướng & Thao tác dưới cùng (Bottom Action Bar)
- Nút quay lại bước trước (cho phép ôn tập các bước đã mở khóa).
- Nút **"Hoàn thành bước & Tiếp tục →"**: Chỉ sáng lên và cho phép bấm khi người học đã thỏa mãn 100% điều kiện của bước hiện tại:
  - Bước 1: Phải xem qua toàn bộ $N/N$ từ vựng trong bài.
  - Bước 2: Phải hoàn thành tất cả các câu nhận diện/phát âm.
  - Bước 3: Phải trả lời xong các câu hỏi thực hành ngữ pháp.
  - Bước 4: Phải trả lời xong các câu hỏi nghe hiểu.
  - Bước 5: Phải hoàn thành tất cả các bài tập.
  - Bước 6: Phải nộp bài Quiz và đạt kết quả $\ge 80\%$.

---

## 2. Thiết Kế Chi Tiết Từng Bước Học

### Bước 1 – Từ vựng (`FlashcardSection.jsx`)
- Thẻ từ vựng cân đối, kích thước vừa vặn (chiều cao ~380-420px), không chiếm toàn bộ màn hình một cách trống trải.
- **Mặt trước**:
  - Huy hiệu loại từ (`noun`, `verb`, `adj`...) và danh mục chủ đề.
  - Số thứ tự từ: `Từ X / Y` (ví dụ `1 / 12`).
  - Nút tra từ điển (📖), nút yêu thích (❤️), nút cần ôn tập (🔖).
  - Từ tiếng Anh nổi bật + Phiên âm quốc tế IPA font monospace.
  - Nút **"Nghe phát âm"** lớn kèm hiệu ứng âm thanh.
  - Nghĩa tiếng Việt gợi mở và câu ví dụ tiếng Anh ngắn kèm bản dịch.
  - Gợi ý chạm lật thẻ.
- **Mặt sau**:
  - Định nghĩa tiếng Việt sâu sắc.
  - Khối ví dụ thực tế có nút nghe phát âm cả câu.
  - Ghi chú về chủ đề và cấp độ CEFR.
- **Điều kiện mở khóa bước tiếp theo**: Người học phải duyệt qua hết $100\%$ số từ (theo dõi qua `viewedWordIndices`), khi đó nút "Hoàn thành bước Từ vựng" ở thanh thao tác mới sáng lên.

### Bước 2 – Phát âm (`PronunciationSection.jsx`)
- Hiển thị từ vựng cần luyện phát âm, ký hiệu phiên âm IPA chuẩn.
- Hướng dẫn khẩu hình/âm khó bằng tiếng Việt.
- Nút nghe phát âm mẫu giọng bản xứ chuẩn US qua Web Speech API.
- Bài tập nhận diện cách phát âm: Chọn từ có phát âm đúng với IPA hoặc phân biệt âm.
- Áp dụng cơ chế tự động chuyển câu sau 1,5 giây khi chọn đúng.

### Bước 3 – Ngữ pháp (`GrammarSection.jsx`)
- Phần lý thuyết ngắn gọn, không nhồi nhét văn bản:
  - Tên chủ điểm ngữ pháp.
  - Bảng công thức trọng tâm.
  - Cách dùng và quy tắc then chốt.
  - Các ví dụ song ngữ có nút nghe câu.
  - Khối lưu ý: "Các lỗi thường gặp (Common Mistakes)".
- Phần câu hỏi vận dụng ngay bên dưới lý thuyết:
  - Học viên phải làm lần lượt các câu hỏi vận dụng.
  - Khi trả lời đúng: Tự động chuyển câu sau 1,5 giây.
  - Khi hoàn thành tất cả câu hỏi vận dụng: Đánh dấu hoàn thành Bước 3.

### Bước 4 – Luyện nghe (`ListeningSection.jsx`)
- Trình phát audio nổi bật với Play, Pause, Replay giọng bản xứ.
- Ẩn transcript ban đầu để học viên tập trung nghe hiểu; có nút mở transcript sau khi đã nghe.
- Bộ câu hỏi trắc nghiệm nghe hiểu: Trả lời đúng tự động chuyển câu sau 1,5 giây.
- Hoàn thành đủ câu hỏi mới được xác nhận qua Bước 5.

### Bước 5 – Bài tập (`ExerciseSection.jsx`)
- Hỗ trợ đa dạng bài tập tương tác:
  - Chọn đáp án đúng (Multiple Choice).
  - Chọn từ điền khuyết (Fill Blank).
  - Nối từ với nghĩa (Interactive Matching Pairs).
  - Sắp xếp từ thành câu (Word Order).
  - Tìm và sửa lỗi sai (Error Correction).
  - Dịch câu ngắn (Translation).
- Trả lời đúng $\rightarrow$ tự động chuyển câu sau 1,5 giây.
- Trả lời sai $\rightarrow$ dừng lại, hiển thị giải thích, cho phép chọn lại hoặc thử lại.

### Bước 6 – Quiz cuối bài (`QuizSection.jsx`)
- Bài kiểm tra tổng hợp kiến thức của bài học (10 câu đối với A1, tăng dần theo CEFR).
- Thanh tiến độ câu hỏi: `Câu X / Y`.
- Trả lời đúng $\rightarrow$ tự động chuyển câu sau 1,5 giây.
- Trả lời sai $\rightarrow$ dừng lại, hiển thị cảnh báo đỏ và cho phép thử lại.
- **Ngưỡng đạt tiêu chuẩn: $\ge 80\%$**.
- Màn hình kết quả:
  - Điểm số phần trăm, số câu đúng/sai, thưởng XP.
  - Nếu đạt $\ge 80\%$: Kích hoạt hoàn thành bài học, lưu tiến độ vào backend và tự động mở khóa bài học tiếp theo trên hệ thống.
  - Nếu chưa đạt $80\%$: Nút "Làm lại bài Quiz" và bộ lọc "Xem lại các câu làm sai" có giải thích chi tiết.

---

## 3. Cơ Chế Tự Động Chuyển Câu Sau 1,5 Giây (1.5s Auto-Advance)

Quy tắc áp dụng cho mọi câu hỏi trắc nghiệm / tương tác ở các bước 2, 3, 4, 5, 6:
- **Khi trả lời ĐÚNG**:
  1. Lập tức hiển thị trạng thái xanh lá (`bg-emerald-50 border-emerald-500 text-emerald-900`) kèm icon `CheckCircle2` và giải thích ngắn.
  2. Khóa lập tức các nút lựa chọn để người dùng không bấm thêm (`disabled`).
  3. Hiển thị thông báo: *"Chính xác! Đang chuyển câu tiếp theo..."*.
  4. Đặt bộ đếm chính xác **1.500ms** (`setTimeout`).
  5. Khi hết 1.500ms: Tự động chuyển `currentIndex` sang câu tiếp theo.
  6. Nếu là câu cuối cùng của phần: Chuyển sang trạng thái hoàn thành phần đó.
- **Khi trả lời SAI**:
  1. Hiển thị màu đỏ cảnh báo (`bg-rose-50 border-rose-400 text-rose-900`) kèm icon `XCircle`.
  2. Không đặt bất kỳ bộ đếm thời gian nào, giữ nguyên câu hỏi.
  3. Cho phép người học chọn lại hoặc làm lại.
- **Quản lý bộ đếm an toàn**:
  - Dùng `useRef` lưu ID của `setTimeout`.
  - Luôn gọi `clearTimeout` khi người dùng chuyển câu thủ công, đổi tab hoặc component unmount.

---

## 4. Quy Tắc Học Tuần Tự (Sequential Progression)

- **Trong bài học**:
  - Khởi đầu ở Bước 1 (Từ vựng). Bước 2 chỉ mở khi xem hết từ vựng. Bước $N$ chỉ mở khi hoàn thành Bước $N-1$.
  - Lưu tiến độ bước học vào `localStorage` (`e4b_lesson_${id}_unlocked_step`).
  - Nếu bài học đã có `userProgress.completed = true` trên server: Tự động mở khóa toàn bộ 6 bước cho phép học viên tự do ôn tập.
- **Giữa các bài học**:
  - Bài $N$ cùng cấp độ chỉ mở khóa khi Bài $N-1$ đã có `completed = true` (đạt Quiz $\ge 80\%$) trên cơ sở dữ liệu SQLite.
  - Khi tải lại trang hoặc đăng nhập lại, tiến độ và trạng thái khóa/mở được khôi phục 100% từ cơ sở dữ liệu.
