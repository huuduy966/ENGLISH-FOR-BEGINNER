# English for Beginner (E4B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng website học tiếng Anh toàn diện cho người mới bắt đầu (E4B) theo kiến trúc Client-Server monorepo (React + Vite + Tailwind CSS và Express + Prisma + SQLite), đầy đủ các luồng học tập tương tác, kiểm tra đầu vào, flashcard phát âm, đố vui, gamification và trang quản trị.

**Architecture:** Monorepo gồm `client/` (React SPA + Tailwind CSS + React Router) và `server/` (Node.js Express + Prisma ORM + SQLite). Thư mục gốc điều phối chạy song song qua `concurrently`. Xác thực dựa trên JWT và cơ chế bảo vệ Protected Routes.

**Tech Stack:** React 18/19, Vite, Tailwind CSS, Lucide React, Web Speech API, Node.js, Express.js, Prisma ORM, SQLite, bcryptjs, jsonwebtoken, concurrently.

**Spec:** `docs/superpowers/specs/2026-10-08-english-for-beginner-design.md`

## Global Constraints

- Backend chạy tại port `5000`, Frontend Vite chạy tại port `5173` với proxy cấu hình chuyển tiếp `/api` sang port 5000.
- Database là file SQLite nội bộ (`server/prisma/dev.db`), 0-setup, không yêu cầu cài đặt MySQL/PostgreSQL bên ngoài.
- Dữ liệu mẫu (Seed) nạp sẵn 2 tài khoản (`admin@e4b.com` / `admin123` và `student@e4b.com` / `student123`), 5 bài học chuẩn A1 theo tài liệu, bộ từ vựng kèm phiên âm IPA, bài tập và đề thi Placement Test.
- Phát âm sử dụng Web Speech API của trình duyệt (giọng chuẩn bản xứ tiếng Anh).

## Review Focus

1. Người dùng làm mới trang (F5) khi đang đăng nhập: Token JWT và trạng thái user trong `AuthContext` cần được phục hồi an toàn từ `localStorage`.
2. Học viên hoàn thành bài học hoặc nộp quiz nhiều lần: XP và streak cần được cộng đúng quy tắc (không bị cộng dồn vô hạn điểm nếu làm lại cùng 1 bài đã pass).
3. Người dùng chưa làm bài kiểm tra đầu vào (Level Test): Hệ thống gợi ý bài kiểm tra hoặc mặc định gán cấp độ khởi đầu A1.
4. Trình duyệt không hỗ trợ Web Speech Recognition: Hệ thống có fallback thông báo hoặc cho phép tự so khớp/nghe đối chiếu mà không bị crash ứng dụng.
5. Quyền truy cập Admin: Người dùng thường truy cập `/admin` phải bị chuyển hướng hoặc chặn với mã lỗi 403 Forbidden.

---

### Task 1: Khởi tạo Cấu trúc Monorepo & Điều phối Gốc

**Files:**
- Create: `package.json` (Root orchestrator)
- Create: `server/package.json`
- Create: `server/.env`
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/index.html`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`

**Interfaces:**
- Produces: Cấu trúc thư mục chuẩn, lệnh `npm run dev` ở thư mục gốc khởi chạy đồng thời client & server.

- [ ] **Step 1: Khởi tạo root `package.json` với script cài đặt và điều phối `concurrently`**
- [ ] **Step 2: Khởi tạo `server/package.json` với dependencies: express, cors, dotenv, bcryptjs, jsonwebtoken, @prisma/client, nodemon, prisma**
- [ ] **Step 3: Khởi tạo `client/package.json` với dependencies: react, react-dom, react-router-dom, lucide-react, tailwindcss, postcss, autoprefixer, axios, vite, @vitejs/plugin-react**
- [ ] **Step 4: Cấu hình `client/vite.config.js` với proxy `/api` trỏ về `http://localhost:5000`**
- [ ] **Step 5: Kiểm tra cài đặt dependencies cho cả root, server và client**
  Run: `npm install && cd server && npm install && cd ../client && npm install`
  Expected: Cài đặt hoàn tất thành công.

---

### Task 2: Thiết kế Database Schema, Prisma Client & Nạp Dữ liệu Mẫu (Seed Data)

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/prisma/seed.js`
- Create: `server/src/db.js` (Khởi tạo PrismaClient singleton)

**Interfaces:**
- Produces: Prisma Client xuất khẩu từ `server/src/db.js` cho toàn bộ controllers sử dụng.
- Seed data: 2 users (Admin & Student), 5 lessons (Greetings, Personal Pronouns & To Be, Family, Numbers & Time, Food & Coffee Shop), 50+ vocabularies kèm IPA & câu ví dụ, 20 câu hỏi kiểm tra Placement Test.

- [ ] **Step 1: Viết file `server/prisma/schema.prisma` theo đúng đặc tả spec (User, Lesson, Vocabulary, UserVocabulary, GrammarPoint, Listening, Conversation, Exercise, QuizQuestion, UserProgress, QuizAttempt)**
- [ ] **Step 2: Sinh Prisma Client và chạy migration tạo SQLite database**
  Run: `cd server && npx prisma db push`
  Expected: Database `dev.db` được tạo thành công với đầy đủ các bảng.
- [ ] **Step 3: Viết script `server/prisma/seed.js` nạp đầy đủ 2 tài khoản, 5 bài học chi tiết, từ vựng, ngữ pháp, bài nghe, hội thoại, bài tập và đề kiểm tra đầu vào**
- [ ] **Step 4: Chạy seed dữ liệu**
  Run: `cd server && node prisma/seed.js`
  Expected: "Database seeded successfully" và in ra số lượng bản ghi đã tạo.

---

### Task 3: Backend Authentication & Middleware Bảo mật

**Files:**
- Create: `server/src/middlewares/auth.js`
- Create: `server/src/controllers/authController.js`
- Create: `server/src/routes/authRoutes.js`
- Create: `server/src/app.js`

**Interfaces:**
- Consumes: PrismaClient từ `server/src/db.js`
- Produces:
  - `POST /api/auth/register`: body `{ name, email, password, goal }` -> `{ token, user }`
  - `POST /api/auth/login`: body `{ email, password }` -> `{ token, user }`
  - `GET /api/auth/me`: header `Authorization: Bearer <token>` -> `{ user }`
  - `verifyToken`: middleware xác thực JWT và gán `req.user`
  - `requireAdmin`: middleware kiểm tra `req.user.role === 'ADMIN'`

- [ ] **Step 1: Viết middleware `server/src/middlewares/auth.js` (verifyToken, requireAdmin)**
- [ ] **Step 2: Viết `authController.js` (register, login, getMe) mã hóa mật khẩu bằng bcryptjs và tạo JWT token**
- [ ] **Step 3: Viết `authRoutes.js` và tích hợp vào `server/src/app.js`**
- [ ] **Step 4: Kiểm thử API Auth qua script curl / node fetch**
  Run: Kiểm tra đăng nhập với `student@e4b.com` trả về HTTP 200 và token hợp lệ.

---

### Task 4: Backend REST APIs Nghiệp vụ Học tập, Đố vui, Dashboard & Admin

**Files:**
- Create: `server/src/controllers/lessonController.js`
- Create: `server/src/controllers/vocabController.js`
- Create: `server/src/controllers/testController.js`
- Create: `server/src/controllers/dashboardController.js`
- Create: `server/src/controllers/adminController.js`
- Create: `server/src/routes/lessonRoutes.js`
- Create: `server/src/routes/vocabRoutes.js`
- Create: `server/src/routes/testRoutes.js`
- Create: `server/src/routes/dashboardRoutes.js`
- Create: `server/src/routes/adminRoutes.js`

**Interfaces:**
- Produces:
  - `GET /api/lessons`: Danh sách bài học + tiến độ người dùng
  - `GET /api/lessons/:id`: Chi tiết trọn vẹn bài học (Vocab, Grammar, Listening, Dialogue, Exercises, Quiz)
  - `POST /api/lessons/:id/complete`: Ghi nhận hoàn thành bài học, cộng +20 XP, cập nhật streak
  - `GET /api/vocabulary`: Tra cứu/lọc từ vựng
  - `POST /api/vocabulary/:id/status`: Đánh dấu yêu thích / cần ôn / đã thuộc
  - `GET /api/placement-test`: Đề thi 20 câu hỏi đầu vào
  - `POST /api/placement-test/submit`: Chấm điểm, gán Level (A1, A2...)
  - `POST /api/quiz/:lessonId/submit`: Nộp quiz bài học, chấm điểm, lưu QuizAttempt, thưởng +30 XP nếu đạt
  - `GET /api/dashboard`: Gói học hôm nay ("Today's Learning"), bài học tiếp tục, thống kê Streak & XP
  - `GET /api/admin/stats` & CRUD bài học/từ vựng cho Admin

- [ ] **Step 1: Xây dựng `lessonController.js` & `lessonRoutes.js`**
- [ ] **Step 2: Xây dựng `vocabController.js` & `vocabRoutes.js`**
- [ ] **Step 3: Xây dựng `testController.js` & `testRoutes.js` (Placement test & Lesson Quiz)**
- [ ] **Step 4: Xây dựng `dashboardController.js` & `dashboardRoutes.js`**
- [ ] **Step 5: Xây dựng `adminController.js` & `adminRoutes.js` có bảo vệ qua `requireAdmin`**
- [ ] **Step 6: Đăng ký toàn bộ routes vào `server/src/app.js` và mở cổng lắng nghe 5000**

---

### Task 5: Kiểm thử Tự động Backend API

**Files:**
- Create: `server/tests/api.test.js`

**Interfaces:**
- Produces: Kịch bản kiểm thử tự động toàn bộ luồng Auth, Lesson, Quiz, XP và Admin.

- [ ] **Step 1: Viết script `server/tests/api.test.js` sử dụng Node.js native fetch**
  - Đăng nhập tài khoản student
  - Lấy danh sách bài học và chi tiết bài học số 1
  - Nộp bài quiz bài học số 1 và kiểm tra tính điểm + XP
  - Lấy dữ liệu Dashboard xác nhận Streak & XP tăng
  - Kiểm tra tài khoản student không thể truy cập `/api/admin/stats` (HTTP 403)
  - Đăng nhập tài khoản admin và truy cập `/api/admin/stats` thành công (HTTP 200)
- [ ] **Step 2: Chạy kiểm thử API**
  Run: `cd server && node tests/api.test.js`
  Expected: Tất cả các bài kiểm tra đều vượt qua (100% PASS).

---

### Task 6: Cấu hình Giao diện Cơ bản Frontend, Routing & Layout Hệ thống

**Files:**
- Create: `client/src/index.css` (Tailwind imports & custom utilities)
- Create: `client/src/services/api.js` (Axios instance với Authorization Interceptor)
- Create: `client/src/contexts/AuthContext.jsx` (Quản lý User, Login, Register, Logout)
- Create: `client/src/components/layout/Sidebar.jsx` (Thanh điều hướng bên trái)
- Create: `client/src/components/layout/Header.jsx` (Thanh header phía trên: Streak, XP, Avatar)
- Create: `client/src/components/layout/MainLayout.jsx` (Khung giao diện kết hợp Sidebar + Header)
- Create: `client/src/components/common/ProtectedRoute.jsx`
- Create: `client/src/App.jsx` (Thiết lập React Router DOM)
- Create: `client/src/main.jsx`

**Interfaces:**
- Produces: Khung giao diện chuẩn mực, responsive, điều hướng mượt mà, lưu trạng thái đăng nhập vào localStorage.

- [ ] **Step 1: Viết `index.css` với Tailwind base/components/utilities**
- [ ] **Step 2: Viết `services/api.js` cấu hình baseURL và tự động đính kèm JWT token vào request headers**
- [ ] **Step 3: Xây dựng `AuthContext.jsx` quản lý đăng nhập, khôi phục session qua `/api/auth/me`**
- [ ] **Step 4: Thiết kế `Sidebar.jsx` và `Header.jsx` với giao diện chuyên nghiệp, icon trực quan từ Lucide React**
- [ ] **Step 5: Xây dựng `MainLayout.jsx` và `ProtectedRoute.jsx`**
- [ ] **Step 6: Cấu hình bộ định tuyến Router trong `App.jsx`**

---

### Task 7: Frontend Landing Page & Kiểm tra Trình độ Đầu vào (Placement Test)

**Files:**
- Create: `client/src/pages/LandingPage.jsx`
- Create: `client/src/pages/LoginPage.jsx`
- Create: `client/src/pages/RegisterPage.jsx`
- Create: `client/src/pages/PlacementTestPage.jsx`

**Interfaces:**
- Produces:
  - Trang Landing Page cuốn hút theo mục 3 trong tài liệu docx.
  - Form Đăng nhập / Đăng ký trực quan.
  - Giao diện làm bài kiểm tra đầu vào 20 câu hỏi, thanh tiến trình, chấm điểm và đề xuất lộ trình khởi đầu phù hợp (A1 Beginner).

- [ ] **Step 1: Xây dựng `LandingPage.jsx` với Hero Section, 4 Nhóm tính năng (Vocab, Grammar, Listening, Speaking), và lộ trình minh họa**
- [ ] **Step 2: Xây dựng `LoginPage.jsx` và `RegisterPage.jsx` kết nối với `AuthContext`**
- [ ] **Step 3: Xây dựng `PlacementTestPage.jsx` tương tác từng câu hỏi, hiển thị bảng kết quả phân loại trình độ và nút chuyển tiếp về Dashboard**
- [ ] **Step 4: Kiểm tra giao diện và luồng hoạt động trên trình duyệt**

---

### Task 8: Frontend Dashboard (Trung tâm Điều khiển Học viên)

**Files:**
- Create: `client/src/pages/DashboardPage.jsx`
- Create: `client/src/components/dashboard/TodaysLearningCard.jsx`
- Create: `client/src/components/dashboard/ContinueCard.jsx`
- Create: `client/src/components/dashboard/StatsRow.jsx`

**Interfaces:**
- Consumes: `/api/dashboard`
- Produces: Trang Dashboard trả lời câu hỏi cốt lõi "Hôm nay tôi cần học gì?", hiển thị Today's Goal, Streak 🔥, XP ⭐, và nút bắt đầu bài học trong ngày.

- [ ] **Step 1: Xây dựng `TodaysLearningCard.jsx` (Gói học trong ngày gồm 10 từ vựng, 1 ngữ pháp, 1 bài nghe/hội thoại với nút [BẮT ĐẦU NGAY])**
- [ ] **Step 2: Xây dựng `ContinueCard.jsx` hiển thị bài học đang dở dang kèm tiến độ %**
- [ ] **Step 3: Xây dựng `StatsRow.jsx` thống kê chuỗi ngày học streak, từ đã học, bài hoàn thành, tổng XP**
- [ ] **Step 4: Lắp ráp hoàn thiện `DashboardPage.jsx` kết nối dữ liệu từ backend**

---

### Task 9: Frontend Trình Học Bài Tương Tác (Interactive Lesson Player)

**Files:**
- Create: `client/src/pages/LessonDetailPage.jsx`
- Create: `client/src/components/lesson/FlashcardSection.jsx`
- Create: `client/src/components/lesson/GrammarSection.jsx`
- Create: `client/src/components/lesson/ListeningSection.jsx`
- Create: `client/src/components/lesson/ConversationSection.jsx`
- Create: `client/src/components/lesson/PronunciationSection.jsx`
- Create: `client/src/components/lesson/ExerciseSection.jsx`
- Create: `client/src/components/lesson/QuizSection.jsx`
- Create: `client/src/utils/speech.js` (Web Speech API helper phát âm và nhận diện giọng nói)

**Interfaces:**
- Consumes: `GET /api/lessons/:id`, `POST /api/lessons/:id/complete`, `POST /api/quiz/:lessonId/submit`
- Produces: Trải nghiệm học toàn diện theo đúng mục 7 & 13 trong tài liệu:
  - Thẻ Flashcard 3D lật mặt mượt mà, bấm loa phát âm giọng Anh-Mỹ chuẩn.
  - Lý thuyết ngữ pháp ngắn gọn, trực quan, có ví dụ màu sắc.
  - Nghe audio mẫu kèm phụ đề và câu hỏi kiểm tra nghe.
  - Phân vai hội thoại 2 nhân vật (Roleplay).
  - Thu âm phát âm và tự đánh giá / nhận diện giọng nói.
  - Bài tập tương tác: Trắc nghiệm, điền từ, sắp xếp câu, nối từ vựng.
  - Quiz cuối bài kèm hiệu ứng chúc mừng, nhận XP và cập nhật tiến độ.

- [ ] **Step 1: Viết module `utils/speech.js` đóng gói Web Speech API (TTS speak & SpeechRecognition)**
- [ ] **Step 2: Xây dựng `FlashcardSection.jsx` hiệu ứng lật mặt 3D, nút đánh dấu yêu thích/cần ôn**
- [ ] **Step 3: Xây dựng `GrammarSection.jsx`, `ListeningSection.jsx`, `ConversationSection.jsx`, `PronunciationSection.jsx`**
- [ ] **Step 4: Xây dựng `ExerciseSection.jsx` hỗ trợ đầy đủ 4 dạng bài tập (Multiple Choice, Fill in blank, Word order, Matching)**
- [ ] **Step 5: Xây dựng `QuizSection.jsx` chấm điểm trực tiếp, thông báo kết quả và gửi kết quả về backend**
- [ ] **Step 6: Tích hợp vào `LessonDetailPage.jsx` với thanh tiến trình học từng bước (Step-by-step Tabs)**

---

### Task 10: Frontend Tra cứu Từ vựng, Sổ tay & Từ điển Nhanh

**Files:**
- Create: `client/src/pages/VocabularyPage.jsx`
- Create: `client/src/pages/DictionaryPage.jsx`
- Create: `client/src/pages/ProgressPage.jsx`
- Create: `client/src/pages/ProfilePage.jsx`

**Interfaces:**
- Consumes: `/api/vocabulary`, `/api/progress/stats`
- Produces:
  - Trang Từ vựng: Lọc theo chủ đề, tìm kiếm, xem danh sách từ yêu thích hoặc từ cần ôn tập.
  - Trang Từ điển nhanh: Tra cứu từ tiếng Anh, xem nghĩa, IPA, ví dụ và phát âm trực tiếp.
  - Trang Tiến độ (Progress): Biểu đồ phân bố kỹ năng, lịch học tập và thành tích đạt được.
  - Trang Cá nhân (Profile): Quản lý thông tin tài khoản, cấp độ, mục tiêu học và cài đặt giao diện.

- [ ] **Step 1: Xây dựng `VocabularyPage.jsx` với chức năng tìm kiếm, bộ lọc chủ đề, thẻ từ và nút phát âm**
- [ ] **Step 2: Xây dựng `DictionaryPage.jsx` tra cứu từ vựng tức thì**
- [ ] **Step 3: Xây dựng `ProgressPage.jsx` hiển thị thanh % theo từng kỹ năng, số giờ học và huy hiệu thành tích**
- [ ] **Step 4: Xây dựng `ProfilePage.jsx` hiển thị thông tin học viên và nút Đăng xuất**

---

### Task 11: Frontend Trang Quản trị Admin

**Files:**
- Create: `client/src/pages/AdminDashboardPage.jsx`
- Create: `client/src/components/admin/LessonManager.jsx`
- Create: `client/src/components/admin/VocabManager.jsx`

**Interfaces:**
- Consumes: `/api/admin/*`
- Produces: Giao diện quản trị dành cho tài khoản Admin:
  - Thống kê tổng số học viên, số bài học, số từ vựng, lượt làm bài.
  - Danh sách bài học và form thêm/sửa bài học mới.
  - Danh sách từ vựng và form thêm từ vựng mới.

- [ ] **Step 1: Xây dựng `AdminDashboardPage.jsx` hiển thị các thẻ KPI thống kê**
- [ ] **Step 2: Xây dựng `LessonManager.jsx` hiển thị bảng bài học và modal thêm bài học**
- [ ] **Step 3: Xây dựng `VocabManager.jsx` hiển thị bảng từ vựng và modal thêm từ vựng**
- [ ] **Step 4: Kiểm tra phân quyền truy cập: Chỉ hiển thị menu Admin cho user có `role === 'ADMIN'`**

---

### Task 12: Tích hợp Toàn diện, Kiểm tra Build & Chạy Thử nghiệm (E2E Verification)

**Files:**
- Modify: `client/src/App.jsx`
- Create: `README.md` (Hướng dẫn cài đặt & khởi chạy dự án)

**Interfaces:**
- Produces: Toàn bộ hệ thống hoạt động trơn tru từ dòng lệnh `npm run dev`.

- [ ] **Step 1: Chạy build kiểm tra frontend `npm run build` trong `client/` không có lỗi cú pháp hoặc typescript/vite**
- [ ] **Step 2: Khởi động song song Client và Server bằng lệnh `npm run dev`**
- [ ] **Step 3: Xác minh toàn bộ luồng người dùng thực tế:**
  1. Vào Landing Page -> Bấm Làm bài kiểm tra đầu vào -> Nhận kết quả A1.
  2. Đăng nhập học viên (`student@e4b.com` / `student123`).
  3. Vào Dashboard -> Bấm [BẮT ĐẦU NGAY] gói học hôm nay -> Vào Bài học 1.
  4. Lật Flashcards từ vựng, nghe phát âm IPA.
  5. Đọc ngữ pháp, nghe hội thoại, làm bài tập và hoàn thành Quiz -> Nhận XP.
  6. Kiểm tra lại Dashboard: XP và tiến độ đã được cập nhật.
  7. Đăng nhập tài khoản Admin (`admin@e4b.com` / `admin123`) -> Vào trang Admin xem thống kê và quản lý nội dung.
- [ ] **Step 4: Viết tài liệu `README.md` hướng dẫn chi tiết cách chạy dự án và danh sách tài khoản mẫu.**
