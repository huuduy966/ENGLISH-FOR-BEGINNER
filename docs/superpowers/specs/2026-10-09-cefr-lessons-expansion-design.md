# Thiết Kế Chi Tiết: Mở Rộng 6 Cấp Độ CEFR (A1–C2) & Nâng Cấp Trang Danh Sách Bài Học (Lessons)

- **Ngày tạo**: 2026-10-09
- **Dự án**: English for Beginner (E4B)
- **Mục tiêu**: Mở rộng toàn diện kho giáo trình lên 6 cấp độ CEFR (A1, A2, B1, B2, C1, C2) với tối thiểu 30 bài học cho mỗi cấp độ (tổng cộng 180 bài học chuẩn), nâng cấp trang Danh sách bài học với bộ lọc cấp độ, tìm kiếm, lọc chủ đề, trạng thái, phân trang 12 bài/trang và cơ chế khóa bài học tuần tự độc lập theo từng cấp độ.

---

## 1. Kiến Trúc & Cấu Trúc Dữ Liệu Giáo Trình

### 1.1 Tổ chức Module Giáo trình Backend (`server/prisma/curriculum/`)
Tách rời dữ liệu tĩnh của bài học thành 6 tệp module chuyên biệt tương ứng 6 cấp độ CEFR nhằm đảm bảo tính sư phạm, chất lượng cao, không trùng lặp và dễ bảo trì:
- `server/prisma/curriculum/a1.js`: 30 bài học cho người mới bắt đầu (Khởi đầu từ số 0, Chào hỏi, Số đếm, Gia đình, Đồ ăn, Đồ uống, Động từ To Be, Đại từ nhân xưng, Thì hiện tại đơn cơ bản, v.v.).
- `server/prisma/curriculum/a2.js`: 30 bài học sơ cấp (Mua sắm, Hỏi đường & Phương tiện, Thời tiết, Sở thích, Sức khỏe, Thì quá khứ đơn, Tương lai gần, So sánh hơn/nhất, Danh từ đếm được/không đếm được, v.v.).
- `server/prisma/curriculum/b1.js`: 30 bài học trung cấp (Nghề nghiệp & Công sở, Công nghệ số, Bảo vệ môi trường, Trải nghiệm du lịch, Thì hiện tại hoàn thành, Câu bị động, Câu điều kiện loại 1 & 2, Cụm động từ Phrasal Verbs, v.v.).
- `server/prisma/curriculum/b2.js`: 30 bài học trung cao cấp (Tranh biện & Đàm phán, Báo chí & Truyền thông, Tiếng Anh thương mại kinh doanh, Khoa học & Xã hội, Thành ngữ Idioms & Collocations, Câu tường thuật phức tạp, Viết luận nghị luận, v.v.).
- `server/prisma/curriculum/c1.js`: 30 bài học cao cấp (Tiếng Anh học thuật Academic English, Thuyết trình chuyên nghiệp, Tư duy phản biện Critical Thinking, Viết báo cáo & Nghiên cứu, Từ vựng sắc thái cao cấp Nuance, Cấu trúc đảo ngữ & Ngữ pháp nâng cao, v.v.).
- `server/prisma/curriculum/c2.js`: 30 bài học thành thạo bản xứ (Ngôn ngữ tu từ & Văn học Rhetoric & Literature, Diễn đạt bản ngữ tự nhiên Native Expressions, Phân biệt sắc thái từ vựng cực kỳ tinh tế, Tranh luận học thuật chuyên sâu, Nghe hiểu ngữ điệu và phát ngôn phức tạp, v.v.).

### 1.2 Cấu trúc mỗi Bài Học (7 Hợp phần hoàn chỉnh)
Mỗi bài học trong 180 bài học gồm đầy đủ các thực thể quan hệ theo `schema.prisma`:
1. **Thông tin bài học (`Lesson`)**: `title`, `description`, `level` (A1..C2), `category` (Chủ đề cụ thể), `orderNumber` (1..30 theo từng level), `durationMinutes` (~15–25 phút).
2. **Từ vựng (`Vocabulary`)**: 10–15 từ vựng/bài. Mỗi từ có: `word`, `pronunciation` (chuẩn IPA), `partOfSpeech` (noun, verb, adj, adv), `meaning` (nghĩa tiếng Việt súc tích), `example` (câu ví dụ tiếng Anh có ngữ cảnh), `exampleMeaning` (dịch nghĩa ví dụ), `category`, `level`.
3. **Ngữ pháp (`GrammarPoint`)**: Tiêu đề cấu trúc, công thức rõ ràng, giải thích cặn kẽ và mảng các ví dụ minh họa (`examples` JSON).
4. **Luyện nghe (`Listening`)**: Tiêu đề bài nghe, kịch bản hội thoại chuẩn giọng đọc (`transcript`), câu hỏi trắc nghiệm kiểm tra độ hiểu audio (`questions` JSON).
5. **Hội thoại (`Conversation`)**: Bối cảnh thực tế đời sống, đoạn hội thoại đóng vai giữa 2 nhân vật (`dialogue` JSON: `speaker`, `text`, `meaning`).
6. **Bài tập tương tác (`Exercise`)**: 3–5 bài tập đa dạng kiểu: trắc nghiệm chọn đáp án (`MULTIPLE_CHOICE`), sắp xếp trật tự từ thành câu (`WORD_ORDER`), điền từ vào chỗ trống (`FILL_BLANK`).
7. **Quiz cuối bài (`QuizQuestion`)**: 3–5 câu hỏi đánh giá tổng hợp kiến thức bài học (4 lựa chọn, đáp án đúng, giải thích). Đạt ≥ 70% để mở khóa bài tiếp theo.

### 1.3 Quy trình Seed Database
- Tệp `server/prisma/seed.js` tổng hợp dữ liệu từ 6 module `a1.js` ... `c2.js`.
- Chạy qua các bài học, sử dụng `orderNumber` và `level` để upsert/tạo mới an toàn mà không xóa hay làm mất lịch sử học tập (`UserProgress`, `QuizAttempt`, `UserVocabulary`) của học viên hiện có.

---

## 2. Thiết Kế Backend API & Cơ Chế Khóa Bài Học Tuần Tự

### 2.1 Cập nhật `GET /api/lessons`
- **Query Parameters**:
  - `level`: `All | A1 | A2 | B1 | B2 | C1 | C2` (mặc định: lấy theo `req.user.level` nếu có, nếu không thì `A1`).
  - `category`: Lọc theo chủ đề bài học.
  - `search`: Chuỗi tìm kiếm theo tiêu đề hoặc mô tả bài học.
  - `status`: `all | completed | learning | not_started`.
  - `page`: Trang hiện tại (số nguyên dương, mặc định `1`).
  - `limit`: Số bài trên mỗi trang (mặc định `12`).
- **Phân trang & Thống kê**:
  - Backend truy vấn cơ sở dữ liệu có phân trang (`skip`, `take`), trả về kèm thông tin:
    - `lessons`: Danh sách 12 bài học đã được tính toán trạng thái khóa/mở.
    - `pagination`: `{ page, limit, total, totalPages }`.
    - `stats`: `{ totalInLevel, completedInLevel, learningInLevel }`.
    - `categories`: Danh sách các chủ đề duy nhất trong cấp độ đã chọn để hiển thị dropdown filter.

### 2.2 Cơ Chế Khóa Bài Học Tuần Tự (Sequential Progression theo Cấp độ)
- **Tự do lựa chọn cấp độ**: Học viên có quyền chuyển đổi giữa các cấp độ A1, A2, B1, B2, C1, C2 bất cứ lúc nào (hoặc vào cấp độ do Placement Test đề xuất).
- **Tuần tự trong phạm vi cấp độ**:
  - Bài có `orderNumber = 1` của mỗi cấp độ luôn luôn được mở sẵn (`isLocked: false`).
  - Bài có `orderNumber = N` ($N > 1$) trong cấp độ đó chỉ mở khóa khi Bài $N - 1$ *trong cùng cấp độ* đã có `UserProgress.completed = true`.
  - Tài khoản Quản trị viên (`role === 'ADMIN'`) được mở khóa toàn bộ tất cả bài học ở mọi cấp độ.
- **Bảo vệ chi tiết bài học (`GET /api/lessons/:id`)**:
  - Nếu học viên chưa hoàn thành bài $N - 1$ cùng cấp độ, API trả về `403 Forbidden` kèm dữ liệu:
    - `isLocked: true`
    - `requiredLessonId`: ID bài học cần hoàn thành
    - `requiredLessonTitle`: Tiêu đề bài học cần hoàn thành
    - `requiredOrderNumber`: Số thứ tự của bài cần hoàn thành

---

## 3. Thiết Kế Giao Diện Frontend Trang Bài Học (`LessonsListPage.jsx`)

### 3.1 Bố cục & Trải nghiệm người dùng (UI/UX)
Giữ trọn vẹn phong cách giao diện hiện đại: nền `bg-slate-50`, các khối bo cong mềm mại `rounded-3xl`, viền mờ `border-slate-200/80`, font chữ đậm hiện đại và hệ thống icon nhất quán từ `lucide-react`.

### 3.2 Các thành phần giao diện chi tiết:
1. **Thanh chọn 6 Cấp độ CEFR (Level Filter Bar)**:
   - Các nút Tab: `Tất cả`, `A1 - Beginner`, `A2 - Elementary`, `B1 - Intermediate`, `B2 - Upper Intermediate`, `C1 - Advanced`, `C2 - Proficiency`.
   - Mỗi cấp độ có mã màu Badge đặc trưng:
     - A1: Blue (`bg-blue-50 text-blue-700 border-blue-200`)
     - A2: Cyan (`bg-cyan-50 text-cyan-700 border-cyan-200`)
     - B1: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)
     - B2: Amber (`bg-amber-50 text-amber-700 border-amber-200`)
     - C1: Purple (`bg-purple-50 text-purple-700 border-purple-200`)
     - C2: Rose (`bg-rose-50 text-rose-700 border-rose-200`)
   - Hiển thị dấu chỉ báo tinh tế cạnh cấp độ hiện tại của học viên: *"Trình độ của bạn"*.

2. **Thanh Thống Kê Nhanh (Level Overview KPI)**:
   - 3 thẻ mini hiển thị:
     - 📘 **Tổng số bài**: `30 bài`
     - ✅ **Đã hoàn thành**: `X bài` (kèm thanh tiến độ % của cấp độ)
     - ⏳ **Đang học dở**: `Y bài`

3. **Thanh Công Cụ Tìm Kiếm & Bộ Lọc (Toolbar)**:
   - **Thanh tìm kiếm**: Nhập từ khóa, có nút xóa nhanh (Clear).
   - **Dropdown Chủ đề (Category)**: Lọc theo danh mục thực tế của cấp độ đó.
   - **Dropdown Trạng thái**: *Tất cả*, *Đã hoàn thành*, *Đang học*, *Chưa học*.

4. **Lưới Thẻ Bài Học (Lesson Cards - Lưới 3 cột responsive, 12 bài/trang)**:
   - Thể hiện rõ 4 trạng thái:
     - *Đã hoàn thành*: Viền xanh ngọc, huy hiệu "Đã hoàn thành", nút "Học lại".
     - *Đang học*: Viền xanh dương sáng, thanh tiến độ %, nút "Tiếp tục học".
     - *Bài mở khóa chưa học*: Viền xám sạch, nút "Bắt đầu học".
     - *Bị khóa*: Mờ `opacity-75`, icon khóa 🔒, báo "Cần hoàn thành Bài X trước", nút bấm vô hiệu hóa.
   - Chi tiết trên thẻ: Thứ tự bài trong level, badge CEFR, chủ đề, tên bài, mô tả ngắn, số lượng từ vựng, điểm ngữ pháp chính, thời lượng ước tính (~15–20 phút).

5. **Bộ Điều Hướng Phân Trang (Pagination Controls)**:
   - Đặt phía dưới lưới bài học:
     - Nút `← Trước` (disabled khi ở trang 1).
     - Danh sách các nút số trang: `1`, `2`, `3`...
     - Nút `Sau →` (disabled khi ở trang cuối).
     - Dòng chữ hỗ trợ: *"Hiển thị bài X - Y trong tổng số Z bài của cấp độ [Level]"*.
   - Tự động cuộn trang êm ái (scroll to top) khi chuyển trang.

6. **Các Trạng Thái Phụ (Loading, Empty, Error)**:
   - *Loading*: Skeleton cards lung linh.
   - *Empty*: Khi tìm kiếm không ra kết quả, hiển thị thông báo thân thiện và nút "Xóa bộ lọc".
   - *Error*: Nút "Thử lại" khi gặp sự cố mạng.

---

## 4. Tích Hợp WordNet & Datamuse
- Hệ thống backend tiếp tục sử dụng module `vocabController.js` với In-memory Cache để tra cứu mở rộng từ vựng, gợi ý từ liên quan, quan hệ ngữ nghĩa (WordNet) và gợi ý sửa lỗi chính tả (Datamuse).
- Toàn bộ nội dung bài học được lưu trữ bền vững trong cơ sở dữ liệu SQLite, không phụ thuộc vào việc phải gọi API ngoài khi duyệt danh sách bài học, đảm bảo tốc độ phản hồi tính bằng mili-giây.

---

## 5. Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu
- [ ] Chạy test backend `npm test` thành công 100%.
- [ ] Kiểm tra API `GET /api/lessons` với các bộ lọc `level`, `category`, `search`, `page`, `limit`.
- [ ] Kiểm tra cơ chế khóa bài học tuần tự: Bài 1 mở sẵn, Bài 2 chỉ mở khi Bài 1 đạt điểm qua môn.
- [ ] Kiểm tra frontend chuyển đổi giữa 6 cấp độ A1–C2, tìm kiếm, lọc theo chủ đề và chuyển trang hoạt động mượt mà.
- [ ] Chạy `npm run build:client` đảm bảo Vite build thành công không có cảnh báo hay lỗi cú pháp.
