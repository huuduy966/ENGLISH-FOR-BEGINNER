# Lesson Detail 7-Step Roadmap & Interactive Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp toàn diện trang chi tiết bài học (`LessonDetailPage.jsx`) thành lộ trình 7 bước chuẩn mực, bổ sung bước Đọc hiểu (Reading), tái cấu trúc Ngữ pháp chuyên sâu (không câu hỏi vận dụng), Luyện nghe chi tiết bám sát audio, Nối từ SVG tương tác trực quan và đồng bộ cơ chế chuyển câu 1.5s.

**Architecture:** Mở rộng backend Prisma SQLite thêm model `Reading`, cập nhật generator curriculum tạo nội dung chuẩn CEFR A1–C2 cho 180 bài học; phía frontend React nâng cấp `LessonDetailPage` sang 7 bước tuần tự và xây dựng/cải tiến các component `GrammarSection`, `ListeningSection`, `ReadingSection` (mới) và `ExerciseSection` (SVG matching).

**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide React, Web Speech API, Node.js, Express, Prisma ORM, SQLite, Jest/Supertest.

**Spec:** `docs/superpowers/specs/2026-10-09-lesson-detail-7steps-enhancement-design.md`

## Global Constraints

- Lộ trình 7 bước chính xác theo thứ tự: 1. Từ vựng $\rightarrow$ 2. Phát âm $\rightarrow$ 3. Ngữ pháp $\rightarrow$ 4. Luyện nghe $\rightarrow$ 5. Đọc hiểu $\rightarrow$ 6. Bài tập $\rightarrow$ 7. Quiz cuối bài.
- Xóa hoàn toàn mục Hội thoại (Conversation) nếu còn xuất hiện trong trang chi tiết bài học.
- Thanh tiến độ hiển thị đúng 7 bước, tính toán phần trăm theo tỷ lệ `(unlockedStepIndex / 7) * 100%`.
- Khóa chặt bước chưa học: người học không thể nhảy cóc sang bước chưa mở khóa qua nhấp chuột hoặc thay đổi state.
- Ngữ pháp: Bỏ toàn bộ câu hỏi trắc nghiệm/vận dụng; chỉ trình bày lý thuyết dạng Accordion với nhiều điểm ngữ pháp chi tiết.
- Luyện nghe: 5 câu hỏi kiểm tra thông tin thực tế trong audio.
- Đọc hiểu: Đoạn văn tiếng Anh + 5 câu hỏi trắc nghiệm + nút bật/tắt bản dịch tiếng Việt.
- Nối từ (Matching): Hiển thị 2 cột, vẽ đường nối SVG mượt mà giữa 2 ô chọn; đúng cố định đường xanh, sai rung đỏ và cho nối lại.
- Đồng bộ chuyển câu: Trắc nghiệm đúng tự động chuyển câu sau 1.5 giây; sai giữ nguyên câu hiện tại cho làm lại.

## Review Focus

1. Người học chuyển qua lại giữa các bước đã mở khóa: Trạng thái các câu đã trả lời và đường nối SVG không bị vỡ giao diện hoặc lỗi tọa độ.
2. Thiết bị di động màn hình nhỏ (375px - 414px): Cột đoạn văn và câu hỏi trong Đọc hiểu, 2 cột Nối từ trong Bài tập hiển thị ngay ngắn, dễ chạm, không bị tràn màn hình ngang.
3. Người dùng làm mới trang (F5): Vị trí bước đã mở khóa (`e4b_lesson_${id}_unlocked_step`) được khôi phục chính xác từ `localStorage`.
4. Bài học đã hoàn thành (`userProgress.completed = true`): Cả 7 bước đều được mở khóa để học viên tự do ôn tập lại.
5. Học viên bấm chọn đáp án nhiều lần liên tiếp khi đang đếm ngược 1.5s: Bị chặn (debounced/guarded), không bị nhảy cóc câu hoặc tính điểm lặp lại.

---

### Task 1: Mở rộng Database Schema & Backend Controller cho bước Đọc hiểu (Reading)

**Files:**
- Modify: `server/prisma/schema.prisma:41-50`
- Modify: `server/src/controllers/lessonController.js:185-285`
- Test: `server/tests/readingApi.test.js`

**Interfaces:**
- Consumes: Prisma Schema & SQLite database
- Produces: `lesson.readings` mảng chứa các bài đọc hiểu với 5 câu hỏi được parse từ JSON; `lesson.grammarPoints` không còn mảng `practiceQuestions`.

- [ ] **Step 1: Viết test kiểm tra API trả về trường `readings` và `grammarPoints` chuẩn**

Tạo file `server/tests/readingApi.test.js`:
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/lessons/:id - 7 Steps Data Structure', () => {
  it('should return readings array and clean grammar points without practice questions', async () => {
    const res = await request(app).get('/api/lessons/1');
    expect(res.status).toBe(200);
    expect(res.body.lesson).toBeDefined();
    expect(Array.isArray(res.body.lesson.readings)).toBe(true);
    expect(Array.isArray(res.body.lesson.grammarPoints)).toBe(true);
    if (res.body.lesson.grammarPoints.length > 0) {
      expect(res.body.lesson.grammarPoints[0].practiceQuestions).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npm test -- server/tests/readingApi.test.js`
Expected: FAIL (vì schema chưa có Reading hoặc endpoint chưa include readings)

- [ ] **Step 3: Cập nhật `server/prisma/schema.prisma`**

Thêm `model Reading` và liên kết với `Lesson`:
```prisma
model Lesson {
  ...
  vocabularies    Vocabulary[]
  grammarPoints   GrammarPoint[]
  listenings      Listening[]
  readings        Reading[]
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
  passage     String
  translation String?
  questions   String
  createdAt   DateTime @default(now())
}
```
Run: `cd server && npx prisma db push`

- [ ] **Step 4: Cập nhật `server/src/controllers/lessonController.js`**

Trong `getLessonById`:
- Include `readings: true` trong `prisma.lesson.findUnique`.
- Format `readings`:
```javascript
const formattedReadings = (lesson.readings || []).map((r) => ({
  ...r,
  questions: r.questions ? (typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions) : [],
}));
```
- Format `grammarPoints`:
```javascript
const formattedGrammar = lesson.grammarPoints.map((g) => {
  let parsedExamples = [];
  if (g.examples) {
    try {
      const parsed = typeof g.examples === 'string' ? JSON.parse(g.examples) : g.examples;
      if (Array.isArray(parsed)) parsedExamples = parsed;
      else if (parsed && typeof parsed === 'object') parsedExamples = parsed.list || [];
    } catch {
      parsedExamples = [];
    }
  }
  return {
    ...g,
    examples: parsedExamples,
    practiceQuestions: [], // Bỏ hoàn toàn câu hỏi vận dụng
  };
});
```
- Trả về `readings: formattedReadings` trong `res.json({ lesson: { ... } })`.

- [ ] **Step 5: Chạy lại test xác nhận pass**

Run: `npm test -- server/tests/readingApi.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/prisma/schema.prisma server/src/controllers/lessonController.js server/tests/readingApi.test.js
git commit -m "feat(api): add Reading model to schema and include in lesson detail endpoint"
```

---

### Task 2: Nâng cấp Dữ liệu Curriculum: Ngữ pháp Đa điểm, Bài nghe Chi tiết, Bài đọc Hiểu & Seed

**Files:**
- Modify: `server/prisma/curriculum/generators/helper.js`
- Modify: `server/prisma/curriculum/generateAll.js`
- Modify: `server/prisma/seed.js`

**Interfaces:**
- Consumes: Cấu trúc các cấp độ CEFR từ A1 đến C2
- Produces: 180 bài học chứa đầy đủ `grammarPoints` đa điểm chuyên sâu, `listenings` bám sát audio thực tế, `readings` kèm 5 câu hỏi đọc hiểu.

- [ ] **Step 1: Cập nhật `server/prisma/curriculum/generators/helper.js`**

Trong `createLesson`:
1. Sinh 2-3 điểm ngữ pháp chi tiết liên quan trực tiếp đến bài học (Tên, Công thức, Giải thích tiếng Việt, Ví dụ song ngữ, Hộp lưu ý tránh lỗi). Xóa bỏ mảng `practiceQuestions`.
2. Tạo đoạn hội thoại/audio bài nghe cụ thể với 5 câu hỏi trắc nghiệm kiểm tra thông tin thực tế xuất hiện trong transcript (nhân vật, tuổi, nơi chốn, chi tiết).
3. Tạo bài Đọc hiểu (`reading`): Đoạn văn hoàn chỉnh phù hợp cấp độ CEFR, bản dịch tiếng Việt, và 5 câu hỏi trắc nghiệm đọc hiểu (ý chính, chi tiết cụ thể, suy luận).

- [ ] **Step 2: Chạy `generateAll.js` để tái tạo toàn bộ file curriculum A1–C2**

Run: `node server/prisma/curriculum/generateAll.js`
Expected: Output `Successfully generated all 6 CEFR curriculum files!`

- [ ] **Step 3: Cập nhật `server/prisma/seed.js` để seed model `Reading`**

Trong `server/prisma/seed.js`:
- Thêm `await prisma.reading.deleteMany();` vào phần dọn dẹp.
- Thêm vòng lặp tạo `prisma.reading.create` cho các bài học có `readings`:
```javascript
if (readings && readings.length > 0) {
  for (const r of readings) {
    await prisma.reading.create({
      data: {
        ...r,
        lessonId: createdLesson.id,
      },
    });
  }
}
```

- [ ] **Step 4: Chạy seed database**

Run: `node server/prisma/seed.js`
Expected: Seed thành công 180 bài học với đầy đủ readings, listenings và grammarPoints.

- [ ] **Step 5: Chạy lại test kiểm tra dữ liệu thật**

Run: `npm test -- server/tests/readingApi.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/prisma/curriculum/generators/helper.js server/prisma/curriculum/generateAll.js server/prisma/curriculum/a1.js server/prisma/curriculum/a2.js server/prisma/curriculum/b1.js server/prisma/curriculum/b2.js server/prisma/curriculum/c1.js server/prisma/curriculum/c2.js server/prisma/curriculum/index.js server/prisma/seed.js
git commit -m "feat(curriculum): generate multi-point grammar, specific listening questions and reading comprehension data"
```

---

### Task 3: Tái cấu trúc Bước Ngữ Pháp (`GrammarSection.jsx`)

**Files:**
- Modify: `client/src/components/lesson/GrammarSection.jsx`

**Interfaces:**
- Consumes: `grammarPoints` array từ props
- Produces: Giao diện Accordion nhiều điểm ngữ pháp, hiển thị công thức, ví dụ phát âm, lưu ý; nút xác nhận hoàn thành kích hoạt `onStepComplete(true)`. Không còn câu hỏi vận dụng.

- [ ] **Step 1: Xóa bỏ toàn bộ phần câu hỏi vận dụng và state làm bài trong `GrammarSection.jsx`**
- [ ] **Step 2: Thiết kế giao diện Accordion hỗ trợ nhiều điểm ngữ pháp**
  - Quản lý state mở/đóng từng thẻ: `expandedIndices = new Set([0])` (mặc định mở thẻ đầu tiên).
  - Nút "Mở tất cả" / "Thu gọn tất cả".
  - Mỗi thẻ gồm:
    - Tiêu đề điểm ngữ pháp + huy hiệu thứ tự.
    - Cấu trúc/Công thức nổi bật (font mono, nền emerald).
    - Giải thích tiếng Việt chi tiết.
    - Danh sách ví dụ thực tế: Câu tiếng Anh (có nút nghe audio phát âm) + dịch nghĩa tiếng Việt.
    - Box Lưu ý tránh nhầm lẫn / lỗi thường gặp (Alert box màu amber).
- [ ] **Step 3: Thêm nút xác nhận hoàn thành bước ở cuối**
  - Nút "Tôi đã hiểu các điểm ngữ pháp này" $\rightarrow$ kích hoạt `onStepComplete(true)`.
  - Hiển thị thông báo trạng thái "Đã ghi nhận hoàn thành phần lý thuyết Ngữ pháp".
- [ ] **Step 4: Kiểm tra trực quan và verify code syntax**
- [ ] **Step 5: Commit**

```bash
git add client/src/components/lesson/GrammarSection.jsx
git commit -m "feat(lesson): redesign GrammarSection with multi-point accordion and remove practice questions"
```

---

### Task 4: Nâng cấp Bước Luyện Nghe (`ListeningSection.jsx`)

**Files:**
- Modify: `client/src/components/lesson/ListeningSection.jsx`

**Interfaces:**
- Consumes: `listenings` array từ props
- Produces: Trình phát audio + 5 câu hỏi thông tin cụ thể; trả lời đúng tự động chuyển câu sau 1.5s; trả lời sai cho phép thử lại; hoàn thành đủ 5 câu gọi `onStepComplete(true)`.

- [ ] **Step 1: Đảm bảo audio player hỗ trợ Phát / Tạm dừng / Nghe lại và nút xem Transcript**
- [ ] **Step 2: Cập nhật cơ chế chọn đáp án câu hỏi trắc nghiệm**
  - Khi chọn đáp án:
    - Nếu đúng: Hiển thị badge xanh `isCorrect: true`, khóa các lựa chọn khác, kích hoạt đếm ngược 1.5s tự động chuyển câu tiếp theo.
    - Nếu câu hiện tại là câu cuối: Đánh dấu hoàn thành toàn bộ bài nghe và gọi `onStepComplete(true)`.
    - Nếu sai: Hiển thị badge đỏ `isCorrect: false`, KHÔNG chuyển câu, cho phép người học chọn lại đáp án khác.
- [ ] **Step 3: Chặn click liên tục (Debounce guard)**
  - Nếu `isAdvancing === true` hoặc câu hiện tại đã chọn đúng, chặn không cho click thêm để tránh tính điểm lặp lại hoặc lỗi nhảy câu.
- [ ] **Step 4: Fallback khi không có audio hoặc tải lỗi**
  - Hiển thị thông báo thân thiện và cho phép thử lại hoặc nghe qua Web Speech API.
- [ ] **Step 5: Commit**

```bash
git add client/src/components/lesson/ListeningSection.jsx
git commit -m "feat(lesson): enhance ListeningSection with specific detail questions and 1.5s auto-advance"
```

---

### Task 5: Xây dựng Component Đọc Hiểu Mới (`ReadingSection.jsx`)

**Files:**
- Create: `client/src/components/lesson/ReadingSection.jsx`

**Interfaces:**
- Consumes: `readings` array từ props (`readings[0].passage`, `readings[0].translation`, `readings[0].questions`)
- Produces: Giao diện 2 cột trên desktop (Đoạn văn bên trái, 5 câu hỏi bên phải); nút ẩn/hiện bản dịch tiếng Việt; cơ chế tự động chuyển câu 1.5s khi đúng; hoàn thành cả 5 câu gọi `onStepComplete(true)`.

- [ ] **Step 1: Tạo `client/src/components/lesson/ReadingSection.jsx`**
  - Xử lý trường hợp không có bài đọc: hiển thị thông báo nhẹ nhàng.
  - State quản lý:
    - `currentQuestionIndex`: Index câu hỏi hiện tại (0 đến 4).
    - `showTranslation`: Toggle xem bản dịch tiếng Việt (mặc định `false`).
    - `answers`: Map đáp án đã chọn.
    - `showFeedback`: Feedback đúng/sai từng câu.
    - `isAdvancing`: Cờ chặn thao tác trong thời gian chờ 1.5s.
    - `isCompleted`: Cờ hoàn thành bài đọc.
- [ ] **Step 2: Thiết kế giao diện 2 cột Responsive**
  - Cột trái: Văn bản tiếng Anh định dạng thanh lịch, khoảng cách dòng thoáng (leading-relaxed), nút bật/tắt bản dịch tiếng Việt.
  - Cột phải: Câu hỏi trắc nghiệm số `currentQuestionIndex + 1`/5, 4 lựa chọn có radio visual, badge giải thích chi tiết khi chọn.
  - Mobile: Xếp dọc 1 cột, đoạn văn có thể cuộn hoặc thu gọn tiện theo dõi trong khi trả lời.
- [ ] **Step 3: Tích hợp logic trả lời và tự động chuyển câu sau 1.5s**
  - Đúng: tick icon, xanh, `setTimeout` 1.5s sang câu kế tiếp. Nếu câu 5 đúng $\rightarrow$ hiển thị màn hình chúc mừng + gọi `onStepComplete(true)`.
  - Sai: rung nhẹ, cảnh báo đỏ, giữ nguyên câu hiện tại cho phép học viên thử lại.
- [ ] **Step 4: Commit**

```bash
git add client/src/components/lesson/ReadingSection.jsx
git commit -m "feat(lesson): create ReadingSection component with bilingual passage and interactive MCQs"
```

---

### Task 6: Nâng cấp Bước Bài Tập: Nối từ SVG Tương tác Trực quan (`ExerciseSection.jsx`)

**Files:**
- Modify: `client/src/components/lesson/ExerciseSection.jsx`

**Interfaces:**
- Consumes: `exercises` array từ props
- Produces: Dạng bài MATCHING với 2 cột và đường nối SVG bezier curve động; kiểm tra đúng/sai trực quan; đồng bộ 1.5s auto-advance cho các dạng bài tập khác.

- [ ] **Step 1: Xây dựng cơ chế tính toán tọa độ đường nối SVG cho dạng MATCHING**
  - Đặt `containerRef` bao bọc vùng 2 cột nối từ.
  - Sử dụng `itemRefs` gắn vào từng nút ở cột trái và cột phải.
  - Hàm `calculateLine(leftKey, rightKey)`:
    - Lấy `rectLeft` và `rectRight` so với `containerRef.getBoundingClientRect()`.
    - Tính điểm xuất phát `(x1, y1)` tại mép phải của ô trái.
    - Tính điểm kết thúc `(x2, y2)` tại mép trái của ô phải.
    - Tạo đường cong cubic bezier `d="M x1,y1 C x1+offset,y1 x2-offset,y2 x2,y2"` cho đường nối mềm mại.
- [ ] **Step 2: Xử lý tương tác nối cặp**
  - Click ô trái: Highlight viền xanh dương, lưu `selectedLeft`.
  - Click ô phải: Lưu `selectedRight`.
  - Nếu đã chọn cả trái và phải:
    - Nếu đúng cặp: Đường SVG chuyển màu xanh lục `#10B981`, lưu vào `confirmedPairs`, cộng điểm (+4). Nếu nối hết toàn bộ cặp $\rightarrow$ tự động chuyển sau 1.5s.
    - Nếu sai cặp: Đường SVG tạm thời vẽ màu đỏ `#EF4444`, kích hoạt hiệu ứng rung (`animate-shake`), trừ 2 điểm, sau 700ms tự động xóa kết nối để học viên nối lại.
  - Cho phép click lại để hủy lựa chọn ô trước khi nối.
- [ ] **Step 3: Tối ưu trên màn hình di động**
  - Điều chỉnh khoảng cách giữa 2 cột; trên màn hình nhỏ hỗ trợ chọn tuần tự với phản hồi màu sắc rõ ràng.
- [ ] **Step 4: Đồng bộ 1.5s tự động chuyển câu cho các dạng bài tập khác**
  - `WORD_ORDER`, `FILL_BLANK`, `LISTEN_CHOOSE`, `ERROR_CORRECTION`: Đúng tự động chuyển câu sau 1.5s; sai báo lỗi và cho làm lại; bỏ nút "Kiểm tra đáp án" thừa.
- [ ] **Step 5: Commit**

```bash
git add client/src/components/lesson/ExerciseSection.jsx
git commit -m "feat(lesson): upgrade ExerciseSection with dynamic SVG matching lines and unified auto-advance"
```

---

### Task 7: Cập nhật Lộ trình 7 Bước tại `LessonDetailPage.jsx`

**Files:**
- Modify: `client/src/pages/LessonDetailPage.jsx`

**Interfaces:**
- Consumes: `lesson` data từ API bao gồm `vocabularies`, `grammarPoints`, `listenings`, `readings`, `exercises`, `quizzes`.
- Produces: Lộ trình 7 bước tuần tự chuẩn mực, thanh tiến độ 7 bước, logic khóa/mở chặt chẽ, tích hợp đầy đủ 7 component con.

- [ ] **Step 1: Cập nhật danh sách 7 tabs**
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
- [ ] **Step 2: Cập nhật `stepCompletionMap` và tính toán tiến độ 7 bước**
  - Thêm `reading: false` vào `stepCompletionMap`.
  - Tính `progressPercent`: `isCompleted ? 100 : Math.min(95, Math.round((Math.min(unlockedStepIndex, 6) / 7) * 100))`.
  - Cập nhật tất cả text nhãn: "Lộ trình 7 bước", "Bước X/7: [Tên bước]", "Tiến độ 7 bước".
- [ ] **Step 3: Tích hợp component `ReadingSection` vào Main Stage**
```javascript
{activeTab === 'reading' && (
  <ReadingSection
    readings={lesson.readings}
    onStepComplete={(complete) => handleMarkStepComplete('reading')}
  />
)}
```
- [ ] **Step 4: Đảm bảo điều hướng tuần tự và khóa bước chưa mở**
  - Không cho phép click vào tab `idx > unlockedStepIndex` (trừ khi admin hoặc đã hoàn thành bài học).
  - Nút "Sang tiếp theo" ở sticky bottom bar chỉ bật khi bước hiện tại đã hoàn thành.
- [ ] **Step 5: Commit**

```bash
git add client/src/pages/LessonDetailPage.jsx
git commit -m "feat(lesson): upgrade LessonDetailPage to 7-step sequential roadmap with ReadingSection integration"
```

---

### Task 8: Kiểm thử Toàn diện & Xác thực Hệ thống

**Files:**
- Test: `server/tests/readingApi.test.js`
- Test: Toàn bộ test suites backend hiện có
- Client build: `npm run build`

**Interfaces:**
- Consumes: Toàn bộ code client & server
- Produces: Ứng dụng build thành công không lỗi, pass toàn bộ test case.

- [ ] **Step 1: Chạy test suite backend**

Run: `cd server && npm test`
Expected: Toàn bộ test backend pass 100%.

- [ ] **Step 2: Chạy build frontend Vite**

Run: `cd client && npm run build`
Expected: Build thành công không có lỗi cú pháp hoặc import thiếu.

- [ ] **Step 3: Chạy test API chi tiết bài học đầy đủ 7 bước**

Run: `node -e "
const axios = require('axios');
// Verify localhost:5000 /api/lessons/1 returns all 7 components data
"`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify 7-step lesson roadmap and passing tests"
```
