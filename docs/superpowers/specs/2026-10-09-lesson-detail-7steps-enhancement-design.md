# Đặc tả Thiết kế Kỹ thuật (Technical Design Spec)
## Nâng cấp Trang Chi Tiết Bài Học: Lộ trình 7 Bước, Đọc Hiểu, Ngữ Pháp Chuyên Sâu, Luyện Nghe Trọng Tâm & Nối Từ SVG

- **Ngày tạo:** 2026-10-09
- **Tài liệu tham chiếu:** `docs/superpowers/plans/English_for_Beginner.docx`, yêu cầu người dùng
- **Phiên bản:** 2.0.0
- **Trạng thái:** Chờ phê duyệt (Pending Review)

---

### 1. Tổng quan & Mục tiêu

Nâng cấp toàn diện trang chi tiết bài học (`LessonDetailPage.jsx`) và hệ thống dữ liệu bài học thuộc dự án **English for Beginner (E4B)**, bao gồm:
1. **Lộ trình học chuẩn hóa 7 bước tuần tự:**
   - Bước 1: Từ vựng (`vocab`)
   - Bước 2: Phát âm (`pronounce`)
   - Bước 3: Ngữ pháp (`grammar`)
   - Bước 4: Luyện nghe (`listen`)
   - Bước 5: Đọc hiểu (`reading`) - **[MỚI]**
   - Bước 6: Bài tập (`exercise`)
   - Bước 7: Quiz cuối bài (`quiz`)
   - Xóa bỏ hoàn toàn mục Hội thoại khỏi trang chi tiết bài học nếu còn sót lại.
2. **Cải tiến bước Ngữ pháp:**
   - Cung cấp nhiều điểm ngữ pháp thực tế theo chủ đề và từ vựng của bài (thay vì 1 quy tắc duy nhất).
   - Mỗi điểm có: Tên cấu trúc, Công thức/mẫu câu, Giải thích tiếng Việt, Ví dụ ứng dụng song ngữ có âm thanh phát âm và Lưu ý tránh lỗi nhầm lẫn.
   - Bỏ hoàn toàn các câu hỏi vận dụng / trắc nghiệm trong bước Ngữ pháp.
   - Trình bày dạng Accordion (mở rộng / thu gọn). Đánh dấu hoàn thành khi người học đã xem hết các điểm lý thuyết.
3. **Cải tiến bước Luyện nghe:**
   - Nội dung audio bám sát ngữ cảnh và trình độ CEFR.
   - Bộ 5 câu hỏi trắc nghiệm kiểm tra thông tin chi tiết có thật trong đoạn nghe (tên người, tuổi tác, địa điểm, nghề nghiệp, sự việc cụ thể).
   - Cơ chế trả lời đúng tự động chuyển câu sau 1.5 giây; sai giữ nguyên cho phép làm lại.
4. **Nâng cấp bước Bài tập – Hiệu ứng Nối từ (Matching):**
   - Hiển thị 2 cột: Cột trái (Từ tiếng Anh), Cột phải (Nghĩa tiếng Việt xáo trộn ngẫu nhiên).
   - Tương tác trực quan: Nhấp chọn ô trái rồi ô phải $\rightarrow$ vẽ đường nối SVG mượt mà giữa 2 ô.
   - Cặp đúng: Giữ nguyên đường nối màu xanh ngọc (emerald), thông báo tích cực, ghi nhận điểm.
   - Cặp sai: Hiệu ứng rung (shake animation) + viền đỏ cảnh báo, tự hủy kết nối để người học chọn lại.
   - Tối ưu thao tác trên thiết bị di động (responsive mobile).
5. **Bổ sung bước Đọc hiểu (Reading Comprehension):**
   - Thêm model `Reading` vào database (Prisma ORM SQLite).
   - Mỗi bài học có đoạn văn tiếng Anh hoàn chỉnh kèm bản dịch tiếng Việt (có nút ẩn/hiện bản dịch).
   - 5 câu hỏi trắc nghiệm kiểm tra ý chính, thông tin chi tiết, từ vựng ngữ cảnh, suy luận.
   - Giao diện 2 cột trên desktop (văn bản bên trái, câu hỏi bên phải).
   - Người học phải trả lời đúng toàn bộ 5 câu mới hoàn thành bước Đọc hiểu để mở khóa bước Bài tập.
6. **Đồng bộ cơ chế trả lời trắc nghiệm & Tính điểm:**
   - Đúng $\rightarrow$ phản hồi đúng $\rightarrow$ tự động chuyển câu sau 1.5 giây.
   - Sai $\rightarrow$ phản hồi sai $\rightarrow$ giữ nguyên câu hiện tại để làm lại.
   - Không bắt buộc bấm nút "Kiểm tra đáp án". Chặn bấm liên tục gây tính điểm nhiều lần.

---

### 2. Kiến trúc & CSDL (Database Schema & API)

#### 2.1. Cập nhật Prisma Schema (`server/prisma/schema.prisma`)

Thêm model `Reading` và liên kết với `Lesson`:

```prisma
model Lesson {
  id              Int             @id @default(autoincrement())
  title           String
  description     String
  level           String          @default("A1")
  category        String
  orderNumber     Int             @default(1)
  durationMinutes Int             @default(15)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  vocabularies    Vocabulary[]
  grammarPoints   GrammarPoint[]
  listenings      Listening[]
  readings        Reading[]       // Mới bổ sung
  conversations   Conversation[]
  exercises       Exercise[]
  quizzes         QuizQuestion[]
  userProgress    UserProgress[]
}

model Reading {
  id          Int      @id @default(autoincrement())
  lessonId    Int
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  title       String
  passage     String   // Đoạn văn tiếng Anh
  translation String?  // Bản dịch tiếng Việt
  questions   String   // JSON string của mảng 5 câu hỏi trắc nghiệm
  createdAt   DateTime @default(now())
}
```

#### 2.2. Cập nhật Controller Backend (`server/src/controllers/lessonController.js`)

Trong hàm `getLessonById`:
- Include `readings: true` khi truy vấn Prisma.
- Parse JSON mảng `questions` của `readings` để trả về cho Frontend:
```javascript
const formattedReadings = (lesson.readings || []).map((r) => ({
  ...r,
  questions: r.questions ? (typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions) : [],
}));
```
- Loại bỏ mảng `practiceQuestions` khỏi `formattedGrammar` (vì bước Ngữ pháp thuần túy lý thuyết).

#### 2.3. Cập nhật Generator Dữ liệu Curriculum (`server/prisma/curriculum/generators/`)

- Cập nhật `helper.js`:
  - `grammarPoints`: Sinh 2-3 điểm ngữ pháp chi tiết theo chủ đề cho từng bài học, mỗi điểm có `title`, `formula`, `explanation`, `examples` (array song ngữ) và `notes` (lưu ý tránh nhầm lẫn). Loại bỏ hoàn toàn mảng câu hỏi kiểm tra trong ngữ pháp.
  - `listenings`: Tạo transcript hội thoại/đoạn văn thực tế và 5 câu hỏi cụ thể dựa trực tiếp vào nội dung nghe (ví dụ: nhân vật tên gì, ở đâu, làm nghề gì...).
  - `readings`: Tạo đoạn văn hoàn chỉnh theo cấp độ CEFR, bản dịch tiếng Việt và 5 câu hỏi trắc nghiệm đọc hiểu (đáp án xác định rõ từ văn bản).
- Chạy lại `generateAll.js` và cập nhật seed database để tất cả các bài học có dữ liệu chuẩn.

---

### 3. Thiết kế Giao diện & Trải nghiệm Người dùng (Frontend UI/UX)

#### 3.1. Trang Chi Tiết Bài Học (`LessonDetailPage.jsx`)

1. **Cấu hình 7 Bước:**
   ```javascript
   const tabs = [
     { id: 'vocab', stepNum: 1, title: 'Từ vựng', label: '1. Từ vựng', icon: BookOpen },
     { id: 'pronounce', stepNum: 2, title: 'Phát âm', label: '2. Phát âm', icon: Mic },
     { id: 'grammar', stepNum: 3, title: 'Ngữ pháp', label: '3. Ngữ pháp', icon: Sparkles },
     { id: 'listen', stepNum: 4, title: 'Luyện nghe', label: '4. Luyện nghe', icon: Headphones },
     { id: 'reading', stepNum: 5, title: 'Đọc hiểu', label: '5. Đọc hiểu', icon: BookMarked },
     { id: 'exercise', stepNum: 6, title: 'Bài tập', label: '6. Bài tập', icon: CheckSquare },
     { id: 'quiz', stepNum: 7, title: 'Quiz cuối bài', label: '7. Quiz cuối bài', icon: Award },
   ];
   ```
2. **Khóa mở tuần tự & Lưu tiến độ:**
   - `unlockedStepIndex`: 0 đến 6 (hoặc 7 khi đã pass quiz).
   - `progressPercent`: Tính toán dựa trên `((unlockedStepIndex) / 7) * 100`.
   - Hiển thị badge: `Bước X/7: [Tên bước]`.
   - Học viên chỉ có thể mở các bước $\le$ `unlockedStepIndex`. Nhấp vào bước lớn hơn sẽ kích hoạt cảnh báo nhắc hoàn thành bước trước đó.
3. **Thanh điều hướng dưới (Sticky Bottom Bar):**
   - Nút "Bước trước" $\leftrightarrow$ Nút "Sang [Tên bước tiếp theo]".
   - Chỉ kích hoạt nút "Sang tiếp theo" khi bước hiện tại đã hoàn thành.

#### 3.2. Bước Ngữ Pháp (`GrammarSection.jsx`)

1. **Không câu hỏi trắc nghiệm:** Xóa toàn bộ phần câu hỏi vận dụng.
2. **Thiết kế Accordion:**
   - Cho phép mở rộng / thu gọn từng thẻ điểm ngữ pháp. Có nút "Mở tất cả" / "Thu gọn tất cả".
   - Thẻ hiển thị:
     - Header: Tiêu đề điểm ngữ pháp + Badge thứ tự (Điểm 1, Điểm 2...).
     - Công thức: Box nổi bật, font mono.
     - Diễn giải tiếng Việt chi tiết.
     - Ví dụ minh họa: Câu tiếng Anh in đậm từ khóa quan trọng + dịch nghĩa tiếng Việt + nút loa phát âm (Web Speech API).
     - Hộp lưu ý: Màu hổ phách (amber) chỉ ra lỗi thường gặp hoặc cách phân biệt.
3. **Hoàn thành bước:**
   - Nút xác nhận: "Tôi đã hiểu các điểm ngữ pháp này" kích hoạt `onStepComplete(true)`.

#### 3.3. Bước Luyện Nghe (`ListeningSection.jsx`)

1. **Audio Player:** Nút Play / Pause / Replay với trạng thái visual sóng âm mượt mà. Nút ẩn/hiện Transcript.
2. **5 câu hỏi kiểm tra thông tin thực tế:**
   - Câu hỏi hiển thị từng câu một.
   - Chọn đúng: Viền xanh, tick icon, tự động chuyển câu tiếp theo sau 1.5s.
   - Chọn sai: Viền đỏ, cảnh báo sai, giữ nguyên câu hiện tại cho phép chọn lại.
   - Hoàn thành đủ 5 câu $\rightarrow$ hiển thị màn hình chúc mừng và kích hoạt `onStepComplete(true)`.

#### 3.4. Bước Đọc Hiểu (`ReadingSection.jsx` - Component Mới)

1. **Bố cục:**
   - Desktop: 2 cột (Cột trái: Văn bản bài đọc; Cột phải: Câu hỏi trắc nghiệm).
   - Mobile: 1 cột xếp dọc (Văn bản thu gọn hoặc cuộn độc lập phía trên câu hỏi).
2. **Văn bản bài đọc:**
   - Tiêu đề bài đọc, văn bản chia đoạn rõ ràng.
   - Nút "Xem bản dịch tiếng Việt" (mặc định đóng) giúp người học tra cứu khi cần mà không mất tính chủ động luyện đọc.
3. **5 Câu hỏi đọc hiểu:**
   - Khai thác ý chính, chi tiết, từ vựng theo ngữ cảnh.
   - Cơ chế chọn đáp án đồng bộ: Đúng chuyển sau 1.5s, sai cho làm lại.
   - Trả lời đúng toàn bộ 5 câu mới hoàn thành bước Đọc hiểu.

#### 3.5. Bước Bài Tập – Nối Từ SVG (`ExerciseSection.jsx`)

1. **Cấu trúc 2 cột:**
   - Cột trái: Từ vựng tiếng Anh.
   - Cột phải: Nghĩa tiếng Việt (đã xáo trộn thứ tự).
2. **Tương tác kết nối & Vẽ đường SVG:**
   - Khi chọn ô trái $\rightarrow$ kích hoạt `selectedLeft` với viền xanh dương nổi bật.
   - Khi chọn ô phải $\rightarrow$ kích hoạt `selectedRight`.
   - Một thẻ `<svg className="absolute inset-0 pointer-events-none">` tính toán tọa độ tâm mép phải của ô trái và tâm mép trái của ô phải bằng `getBoundingClientRect()`, sau đó vẽ đường cong cubic bezier mượt mà:
     `M x1,y1 C x1+offset,y1 x2-offset,y2 x2,y2`
3. **Xử lý Đúng / Sai:**
   - Nếu đúng: Đổi màu đường SVG sang màu xanh lá (`stroke="#10B981"`), giữ cố định đường nối, đánh dấu ô đã nối.
   - Nếu sai: Đường nối đổi màu đỏ (`stroke="#EF4444"`), kích hoạt CSS animation rung lắc (`animate-shake`), sau 700ms tự động gỡ kết nối để học viên thử lại.
4. **Đồng bộ các dạng bài tập khác trong bước Bài tập:**
   - Sắp xếp từ (`WORD_ORDER`), Điền từ (`FILL_BLANK`), Nghe chọn từ (`LISTEN_CHOOSE`), Sửa lỗi sai (`ERROR_CORRECTION`):
   - Đều chuyển sang cơ chế: Đúng $\rightarrow$ tự động chuyển câu sau 1.5s; Sai $\rightarrow$ báo lỗi và cho chọn/sắp xếp lại. Không bắt buộc bấm nút "Kiểm tra đáp án".

---

### 4. Kế hoạch Kiểm thử & Tiêu chuẩn Nghiệm thu

1. **Kiểm thử Điều hướng & Tiến độ:**
   - Thanh tiến độ hiển thị đúng `X/7 bước` và tính đúng tỷ lệ phần trăm (14%, 28%, ..., 100%).
   - Học viên không thể nhấp vào các bước chưa mở khóa (ví dụ: đang ở bước 1 không thể nhấp sang bước 5).
   - Sau khi hoàn thành một bước, bước tiếp theo được mở khóa ngay lập tức và lưu vào `localStorage`.
2. **Kiểm thử Bước Ngữ pháp:**
   - Không còn bất kỳ câu hỏi trắc nghiệm nào trong bước này.
   - Hiển thị đầy đủ các điểm ngữ pháp với công thức, ví dụ có âm thanh và lưu ý.
3. **Kiểm thử Bước Luyện nghe:**
   - Các câu hỏi kiểm tra thông tin thực tế xuất hiện trong audio.
   - Trả lời đúng tự động chuyển câu sau 1.5s; trả lời sai cho phép thử lại.
4. **Kiểm thử Bước Đọc hiểu:**
   - Đoạn văn tiếng Anh hiển thị chuẩn, nút bật/tắt bản dịch hoạt động trơn tru.
   - 5 câu hỏi bám sát văn bản, chuyển câu mượt mà.
5. **Kiểm thử Bước Bài tập – Nối từ SVG:**
   - Đường nối SVG xuất hiện chính xác nối giữa 2 ô được chọn trên cả màn hình desktop và di động.
   - Nối sai rung cảnh báo và cho nối lại; nối đúng giữ kết nối.
6. **Kiểm thử Build:**
   - `npm run build` trên cả client và server thành công không có lỗi cú pháp hoặc cảnh báo nghiêm trọng.

---

### 5. Cam kết tương thích ngược

- Hệ thống phân cấp A1-C2 tiếp tục hoạt động ổn định.
- Tiến độ bài học cũ đã lưu của người dùng không bị lỗi crash.
- Giữ nguyên các API xác thực, XP, streak, dashboard và daily practice.
