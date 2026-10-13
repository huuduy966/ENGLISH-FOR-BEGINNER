# Nâng Cấp Chất Lượng Câu Hỏi & Phương Án Nhiễu Toàn Diện Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp chất lượng câu hỏi trắc nghiệm và các phương án nhiễu (distractors) trên toàn bộ hệ thống E4B (Placement Test, 180 bài học CEFR, Daily Practice 60 câu), bảo đảm 4 phương án liên quan trực tiếp, có bẫy ngữ pháp/từ vựng sư phạm hợp lý, chỉ duy nhất 1 đáp án đúng và loại bỏ hoàn toàn các phương án lạc đề/vô lý.

**Architecture:** Sử dụng kiến trúc kết hợp (Hybrid): biên soạn chuẩn hóa ngân hàng câu hỏi Placement Test và 30 tình huống Speaking; nâng cấp Contextual Distractor Engine trong `helper.js` và `dataGenerator.js` bắt buộc cùng từ loại và cùng chủ đề; tạo bộ kiểm định chất lượng tự động `questionQualityValidation.test.js` chạy trong test suite; tái tạo 180 bài học và đồng bộ database an toàn.

**Tech Stack:** Node.js, Prisma ORM, SQLite, JavaScript (ES6+), Web Speech API compatible transcripts, Assert-based test suite.

**Spec:** `docs/superpowers/specs/2026-10-12-question-distractor-quality-upgrade-design.md`

## Global Constraints

- Mỗi câu trắc nghiệm bắt buộc có đúng 4 phương án A, B, C, D và đúng duy nhất 1 đáp án chuẩn (`correctAnswer`).
- Mọi phương án sai phải cùng chủ đề, cùng từ loại hoặc cùng ngữ cảnh giao tiếp với câu hỏi.
- Tuyệt đối không còn bất kỳ phương án vô lý, thô lỗ hoặc lạc đề (`bananas`, `airplanes`, `dinosaur`, `refrigerator`, `bus is red`, `vô nghĩa`, `cấm đoán`).
- Giữ nguyên 100% hình thức tự luận cho các bài thi tự luận (Điền từ, Sửa lỗi sai, Nghe tự luận, Sắp xếp câu trong bài thi 40 câu tại `/exam`).
- Bảo toàn nguyên vẹn tài khoản, mật khẩu, streak, điểm làm bài và tiến độ học tập hiện có của học viên.
- Tất cả 13 test suites hiện có phải tiếp tục Pass 100%.

## Review Focus

1. **Placement Test Option Leakage:** Client không được nhận `correctAnswer` hay `explanation` trước khi nộp bài (bảo đảm hàm `getPlacementTest` sanitize đúng).
2. **Grammar Agreement Distractors:** Các phương án nhiễu ngữ pháp phải chia đúng ngôi/thì theo bẫy thường gặp của người học, không được là chuỗi từ vô nghĩa.
3. **Part-of-Speech Matching:** Phương án nhiễu điền từ bắt buộc cùng từ loại (`noun` với `noun`, `verb` với `verb`) để không thể loại trừ chỉ bằng ngữ pháp hình thức.
4. **Contextual Politeness in Speaking:** Các phương án sai trong bài nói giao tiếp phải hoàn toàn lịch sự, tự nhiên, chỉ khác về mục đích giao tiếp hoặc mức độ phù hợp văn cảnh.
5. **No Duplicate Options:** Không có bất kỳ câu hỏi nào bị trùng lặp phương án A, B, C, D sau khi sinh ngẫu nhiên.

---

### Task 1: Automated Question Quality Validator Test Suite

**Files:**
- Create: `server/tests/questionQualityValidation.test.js`

**Interfaces:**
- Produces: `verifyQuestionStructure(q)`, `checkBannedDistractors(options)`, `checkLengthRatio(options, correctAnswer)`

- [ ] **Step 1: Write the quality validator test script**

Viết test suite kiểm tra tự động:
1. Mỗi câu trắc nghiệm có mảng `options` gồm đúng 4 phần tử không rỗng.
2. `correctAnswer` xuất hiện duy nhất 1 lần trong `options`.
3. Không có phương án trùng lặp trong cùng 1 câu (`new Set(options).size === 4`).
4. Không chứa các từ khóa cấm/lạc đề trong danh sách cấm:
   `['banana', 'airplane', 'dinosaur', 'refrigerator', 'bus is red', 'cấm đoán', 'vô nghĩa', 'see you never', 'hate weekend', 'bothering me']`.
5. Tỷ lệ độ dài phương án dài nhất so với ngắn nhất không vượt quá 4.0 lần đối với câu đơn.

- [ ] **Step 2: Run test to observe baseline violations on existing data**

Run: `node server/tests/questionQualityValidation.test.js`
Expected: Phát hiện vi phạm trên dữ liệu cũ (chứng minh test phát hiện lỗi chính xác).

- [ ] **Step 3: Update `package.json` test scripts if needed**

Đảm bảo lệnh `npm test` trong `server/package.json` bao gồm bài test mới `tests/questionQualityValidation.test.js`.

- [ ] **Step 4: Commit**

```bash
git add server/tests/questionQualityValidation.test.js server/package.json
git commit -m "test: add automated question quality and distractor validator suite"
```

---

### Task 2: Upgrade Placement Test Bank (25 Questions)

**Files:**
- Modify: `server/prisma/curriculum/placementQuestions.js`
- Test: `server/tests/placementTest.test.js`

**Interfaces:**
- Consumes: `placementQuestions.js` format: `{ orderNumber, partNumber, levelTarget, category, question, options, correctAnswer, audioText, explanation }`
- Produces: 25 sanitized placement questions progressing sequentially from A1 to C2 with pedagogical CEFR distractors and balanced key distribution.

- [ ] **Step 1: Write/Update placement test unit assertions in test file**

Đảm bảo test kiểm tra tính toàn vẹn của 25 câu hỏi: 15 câu Part 1, 10 câu Part 2, các phương án đều hợp lý và không chứa phương án lạc đề.

- [ ] **Step 2: Refactor all 25 placement questions in `placementQuestions.js`**

- **Part 1 (15 câu Fill-in)**:
  - Câu 1 (A1 - Tính từ sở hữu): `['Her', 'His', 'She', 'Hers']`, đáp án `Her`.
  - Câu 2 (A1 - To Be số nhiều): `['are', 'is', 'am', 'was']`, đáp án `are`.
  - Câu 3 (A1 - Từ vựng bếp): `['dishes', 'plates', 'pots', 'glasses']`, câu: "wash the dirty _____ in the kitchen sink", đáp án `dishes`.
  - Câu 4 (A2 - Quá khứ đơn): `['went', 'goes', 'visited', 'travelled']` (với "to the seaside"), đáp án `went`.
  - Câu 5 (A2 - So sánh hơn tính từ ngắn): `['faster', 'more fast', 'quicker', 'fastest']`, đáp án `faster`.
  - Câu 6 (A2 - Giới từ thời gian): `['at', 'on', 'in', 'by']` (với "8 o'clock"), đáp án `at`.
  - Câu 7 (B1 - Liên từ nhượng bộ): `['although', 'despite', 'because', 'unless']`, đáp án `although`.
  - Câu 8 (B1 - Thì Hiện tại hoàn thành): `['lived', 'been living', 'stayed', 'resided']`, đáp án `lived`.
  - Câu 9 (B1 - Phrasal verb chăm sóc): `['after', 'for', 'at', 'into']` ("look _____ my pet cat"), đáp án `after`.
  - Câu 10 (B2 - Modal verb suy đoán): `['must', 'should', 'can', 'might']`, đáp án `must`.
  - Câu 11 (B2 - Câu điều kiện loại 2): `['had', 'would have', 'have', 'were having']`, đáp án `had`.
  - Câu 12 (C1 - Academic collocation kiềm chế lạm phát): `['curb', 'dampen', 'mitigate', 'stifle']`, đáp án `curb`.
  - Câu 13 (C1 - Đảo ngữ phủ định): `['had the keynote speaker finished', 'did the keynote speaker finish', 'the keynote speaker had finished', 'finished the keynote speaker']`, đáp án `had the keynote speaker finished`.
  - Câu 14 (C2 - Từ vựng sắc thái nghĩa tỉ mỉ): `['meticulous', 'scrupulous', 'punctilious', 'fastidious']`, đáp án `meticulous`.
  - Câu 15 (C2 - Mệnh đề điều kiện giả định): `['given that', 'provided that', 'notwithstanding that', 'whereas']`, đáp án `given that`.
- **Part 2 (10 câu Listening)**:
  - Tất cả các phương án A, B, C, D đều là các thông tin có thể xảy ra trong cùng ngữ cảnh (thời gian, địa điểm, con số, chỉ số nghiên cứu).
- Phân bổ vị trí đáp án đúng đều giữa A, B, C, D (khoảng 6–7 câu mỗi vị trí).

- [ ] **Step 3: Run placement test suite to verify passes**

Run: `node server/tests/placementTest.test.js`
Expected: PASS 100%

- [ ] **Step 4: Commit**

```bash
git add server/prisma/curriculum/placementQuestions.js
git commit -m "feat(curriculum): upgrade placement test with CEFR pedagogical distractors"
```

---

### Task 3: Upgrade Curriculum Generator Engine (`helper.js`)

**Files:**
- Modify: `server/prisma/curriculum/generators/helper.js`
- Test: `server/tests/readingApi.test.js`

**Interfaces:**
- Consumes: `createLesson({ level, orderNumber, title, category, description, durationMinutes, vocabularies, grammar, listening, reading, exercises, quizzes })`
- Produces: Enhanced Reading MCQs, Listening MCQs, Multi-modal Exercises, and Comprehensive Final Quizzes with contextual, part-of-speech-aligned distractors.

- [ ] **Step 1: Write test case verifying distractor quality in lesson details**

Đảm bảo reading questions và quiz questions không có từ khóa cấm và đáp án sai cùng chủ đề bài học.

- [ ] **Step 2: Refactor Reading Questions in `helper.js`**

- Câu 1 (Ý chính): 4 lựa chọn đều về việc học và làm chủ chủ đề `${title}`, chỉ 1 câu tóm tắt chính xác.
- Câu 2 (Phương pháp học từ vựng):
  - Phương án đúng: `Connecting new vocabulary to real-life situations`
  - 3 phương án nhiễu: `Reviewing vocabulary lists only once a week`, `Relying entirely on passive audio listening`, `Focusing exclusively on grammatical formulas without practicing sentences`.
- Câu 3 (Thời lượng thực hành):
  - Phương án đúng: `Twenty minutes daily`
  - 3 phương án nhiễu: `Forty-five minutes twice a week`, `One hour every weekend`, `Ten minutes before bedtime`.
- Câu 4 (Từ vựng trọng tâm): 4 phương án đều về vai trò của từ vựng trong bài học.
- Câu 5 (Chìa khóa làm chủ ngôn ngữ):
  - Phương án đúng: `Consistency, curiosity, and patience`
  - 3 phương án nhiễu: `Speed, repetition, and memorization`, `Fluency, grammar rules, and translation`, `Confidence, vocabulary breadth, and accent`.

- [ ] **Step 3: Refactor Listening Questions in `helper.js`**

- Câu 1 (Tên người nói): Tên chuẩn trong giao tiếp (`Anna`, `Emma`, `Sarah`, `Laura`).
- Câu 2 (Tuổi & Nơi ở): Các thành phố và độ tuổi sinh viên chuẩn (`21 years old, living in London`, `22 years old, living in Manchester`, `20 years old, living in Edinburgh`, `23 years old, living in Bristol`).
- Câu 3 (Nghề nghiệp): Các vai trò học tập thực tế (`University student studying languages`, `Graduate teaching assistant in linguistics`, `Intern at an international cultural exchange center`, `Part-time language peer tutor`).
- Câu 4 (Từ vựng thực hành): Lấy các từ vựng khác trong chính danh sách từ vựng của bài học (`vocabsFormatted[1].word`, `vocabsFormatted[2].word`, `vocabsFormatted[3].word`, `vocabsFormatted[0].word`).
- Câu 5 (Bí quyết tự tin): 4 lời khuyên học tập hợp lý, chỉ 1 lời khuyên trích từ audio.

- [ ] **Step 4: Refactor Exercises & Final Quizzes in `helper.js`**

- `FILL_BLANK`: Thay thế `['không cần thiết', 'bị cấm đoán', 'vô nghĩa']` bằng nghĩa của các từ vựng khác trong bài học (`vocabsFormatted[1].meaning`, `vocabsFormatted[2].meaning`, `vocabsFormatted[3].meaning`).
- `LISTEN_CHOOSE`: Thay thế `['Computer', 'Umbrella', 'Telephone']` bằng các từ vựng khác trong bài học.
- `MULTIPLE_CHOICE`: Lọc các từ cùng từ loại (`partOfSpeech`).
- `Quiz List`:
  - Câu nghĩa từ: Lấy 3 distractors từ các từ có cùng từ loại trong bài học hoặc level.
  - Câu điền từ vào câu: Thay thế `bananas, airplanes, umbrellas` bằng các từ vựng khác trong bài học phù hợp với loại từ của chỗ trống.
  - Câu ngữ pháp: 4 câu hoàn chỉnh phản ánh các lỗi chia động từ, giới từ hoặc mạo từ thực tế.

- [ ] **Step 5: Run tests to verify**

Run: `node server/tests/readingApi.test.js`
Expected: PASS 100%

- [ ] **Step 6: Commit**

```bash
git add server/prisma/curriculum/generators/helper.js
git commit -m "feat(curriculum): upgrade reading, listening, exercises, and quizzes distractor engine"
```

---

### Task 4: Regenerate 180 CEFR Curriculum Files & Seed Database

**Files:**
- Modify: `server/prisma/curriculum/a1.js`
- Modify: `server/prisma/curriculum/a2.js`
- Modify: `server/prisma/curriculum/b1.js`
- Modify: `server/prisma/curriculum/b2.js`
- Modify: `server/prisma/curriculum/c1.js`
- Modify: `server/prisma/curriculum/c2.js`
- Modify: `server/prisma/seed.js`

**Interfaces:**
- Consumes: `generateAll.js`
- Produces: Re-generated clean curriculum data across 6 CEFR levels (180 lessons) with pedagogical distractors.

- [ ] **Step 1: Execute curriculum regeneration script**

Run: `node server/prisma/curriculum/generateAll.js`
Expected: Output `Successfully generated all 6 CEFR curriculum files!`

- [ ] **Step 2: Seed the updated curriculum into SQLite database**

Run: `node server/prisma/seed.js`
Expected: Seeding succeeds without foreign key errors.

- [ ] **Step 3: Run existing API tests**

Run: `node server/tests/api.test.js && node server/tests/readingApi.test.js`
Expected: PASS 100%

- [ ] **Step 4: Commit**

```bash
git add server/prisma/curriculum/
git commit -m "chore(curriculum): regenerate all 180 CEFR lessons with upgraded questions"
```

---

### Task 5: Upgrade Daily Practice Engine (60 Questions)

**Files:**
- Modify: `server/prisma/dailyQuestions/dataGenerator.js`
- Test: `server/tests/dailyPracticeReset.test.js`

**Interfaces:**
- Consumes: `getQuestionsForLevel(level, { dateStr, recentQuestionIds, seed })`
- Produces: 60 questions daily with strict part-of-speech matching for vocabulary, 30 polite conversational speaking situations, and sentence-derived error correction options.

- [ ] **Step 1: Upgrade Part 1 (Vocabulary) distractor selection in `dataGenerator.js`**

- Lọc `candidateDistractors` bắt buộc **cùng từ loại (`partOfSpeech`)** với từ đang hỏi (`v.partOfSpeech`).
- Ưu tiên chọn từ cùng `category` trước, sau đó mới đến các từ cùng `partOfSpeech` trong level.

- [ ] **Step 2: Rewrite all 30 Speaking Situations in `dataGenerator.js`**

- Rà soát và viết lại toàn bộ 30 tình huống `ALL_SPEAKING_SITUATIONS`:
  - Mỗi tình huống có 4 câu thoại: Đều lịch sự, ngữ pháp chuẩn chỉnh, tự nhiên.
  - 1 câu là phản hồi đúng nhất cho tình huống.
  - 3 câu là phản hồi phù hợp cho tình huống khác (ví dụ: chào hỏi vs cảm ơn vs xin lỗi vs hỏi đường), hoặc mức độ trang trọng chưa tương thích.
  - Tuyệt đối loại bỏ các câu cộc lốc/phi lý cũ.

- [ ] **Step 3: Upgrade Part 3 (Error Correction) in `dataGenerator.js`**

- Đảm bảo 4 phương án trích trực tiếp từ các thành phần trong câu cần sửa.

- [ ] **Step 4: Run Daily Practice reset test suite**

Run: `node server/tests/dailyPracticeReset.test.js`
Expected: PASS (tất cả 43 assertions)

- [ ] **Step 5: Commit**

```bash
git add server/prisma/dailyQuestions/dataGenerator.js
git commit -m "feat(daily-practice): upgrade vocabulary POS filtering and polite speaking distractors"
```

---

### Task 6: Comprehensive Verification & Build

**Files:**
- Test: `server/tests/questionQualityValidation.test.js`
- All 13 server test files in `server/tests/`

- [ ] **Step 1: Run the question quality validator test**

Run: `node server/tests/questionQualityValidation.test.js`
Expected: 0 vi phạm về từ cấm, 0 vi phạm về trùng lặp đáp án, 100% câu trắc nghiệm có đúng 4 phương án và 1 đáp án chuẩn.

- [ ] **Step 2: Run all server test suites**

Run: `npm run test:server`
Expected: Tất cả các test suites đạt PASS 100%.

- [ ] **Step 3: Build the client to verify no frontend regressions**

Run: `npm run build:client`
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Final verification commit**

```bash
git add -A
git commit -m "feat(questions): complete full-system question quality and distractor upgrade"
```
