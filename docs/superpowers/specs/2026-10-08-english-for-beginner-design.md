# Đặc tả Thiết kế Kỹ thuật (Technical Design Spec)
## Dự án: English for Beginner (E4B)

- **Ngày tạo:** 2026-10-08
- **Tài liệu tham chiếu:** `docx/English_for_Beginner.docx`
- **Phiên bản:** 1.0.0
- **Trạng thái:** Chờ duyệt (Pending Review)

---

### 1. Tổng quan & Mục tiêu Dự án (Overview & Goals)

**English for Beginner (E4B)** là nền tảng học tiếng Anh trực tuyến toàn diện dành cho người mới bắt đầu hoặc người mất gốc tiếng Anh. Dự án giải quyết triệt để vấn đề "hôm nay tôi cần học gì?" bằng cách cung cấp lộ trình từng bước rõ ràng, kết hợp đa kỹ năng và hệ thống tạo động lực học tập (Gamification).

#### Mục tiêu chính:
1. **Lộ trình học chuẩn mực:** Cung cấp lộ trình bài học theo chủ đề đời sống thiết thực (Greetings, Introductions, Family, Numbers, Food...).
2. **Học tập đa giác quan:** Tích hợp Từ vựng (Flashcard + IPA + Audio), Ngữ pháp nền tảng, Luyện nghe & Hội thoại, Phát âm giọng bản xứ (Web Speech API).
3. **Bài tập tương tác đa dạng:** Trắc nghiệm, điền khuyết, sắp xếp từ thành câu, nối từ vựng, kiểm tra nghe.
4. **Hệ thống theo dõi & tạo động lực:** Tính điểm kinh nghiệm (XP), chuỗi ngày học liên tục (Streak), huy hiệu thành tích và trang thống kê trực quan.
5. **Quản trị nội dung (Admin):** CRUD bài học, từ vựng và quản lý người dùng.

---

### 2. Kiến trúc Hệ thống & Ngăn xếp Công nghệ (System Architecture & Tech Stack)

Hệ thống được tổ chức theo mô hình **Client-Server Monorepo**:

```
D:\Projects\E4B\
├── client/                 # Frontend React SPA
│   ├── src/
│   │   ├── components/     # UI Components (Sidebar, Header, Flashcard, Player...)
│   │   ├── pages/          # Pages (Dashboard, Lesson, PlacementTest, Admin...)
│   │   ├── services/       # API clients (axios)
│   │   ├── contexts/       # AuthContext, NotificationContext
│   │   └── utils/          # Audio / Speech helpers, formatters
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Backend REST API
│   ├── prisma/             # Schema & SQLite database
│   │   ├── schema.prisma
│   │   └── seed.js         # Gói dữ liệu khởi tạo bài học, từ vựng, user
│   ├── src/
│   │   ├── routes/         # auth, lessons, vocabulary, test, progress, admin
│   │   ├── controllers/    # Xử lý logic nghiệp vụ
│   │   ├── middlewares/    # authMiddleware (verifyToken, requireAdmin)
│   │   └── app.js          # Khởi tạo Express server
│   ├── package.json
│   └── .env
└── package.json            # Root orchestrator: chạy song song client & server
```

#### Công nghệ sử dụng:
- **Frontend:**
  - React 18/19, Vite (Bundler siêu tốc)
  - Tailwind CSS (Thiết kế giao diện hiện đại, responsive mobile/desktop)
  - React Router DOM v6 (Điều hướng SPA, bảo vệ Protected Routes)
  - Lucide React (Bộ icon đồng bộ, sắc nét)
  - Web Speech API (Tổng hợp giọng nói TTS và Nhận diện giọng nói STT)
- **Backend:**
  - Node.js + Express.js
  - Prisma ORM + SQLite (Cơ sở dữ liệu dạng file 0-setup, quan hệ chuẩn mực)
  - JSON Web Token (JWT) & bcryptjs (Bảo mật đăng nhập và mã hóa mật khẩu)
  - CORS, dotenv

---

### 3. Thiết kế Cơ sở dữ liệu (Prisma Schema)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            Int             @id @default(autoincrement())
  name          String
  email         String          @unique
  password      String
  role          String          @default("STUDENT") // STUDENT | ADMIN
  level         String          @default("A1")      // A1, A2, B1, B2...
  goal          String          @default("Zero-foundation")
  xp            Int             @default(0)
  streakDays    Int             @default(0)
  lastStudyDate DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  progress      UserProgress[]
  quizAttempts  QuizAttempt[]
  savedWords    UserVocabulary[]
}

model Lesson {
  id              Int             @id @default(autoincrement())
  title           String
  description     String
  level           String          @default("A1")
  category        String
  orderNumber     Int             @default(1)
  durationMinutes Int             @default(15)

  vocabularies    Vocabulary[]
  grammarPoints   GrammarPoint[]
  listenings      Listening[]
  conversations   Conversation[]
  exercises       Exercise[]
  quizzes         QuizQuestion[]
  userProgress    UserProgress[]
}

model Vocabulary {
  id             Int              @id @default(autoincrement())
  lessonId       Int?
  lesson         Lesson?          @relation(fields: [lessonId], references: [id])
  word           String
  meaning        String
  pronunciation  String           // Phiên âm IPA
  partOfSpeech   String?          // noun, verb, adj...
  example        String?
  exampleMeaning String?
  category       String           @default("General")
  level          String           @default("A1")

  userSaves      UserVocabulary[]
}

model UserVocabulary {
  id           Int        @id @default(autoincrement())
  userId       Int
  user         User       @relation(fields: [userId], references: [id])
  vocabularyId Int
  vocabulary   Vocabulary @relation(fields: [vocabularyId], references: [id])
  status       String     @default("LEARNING") // LEARNING | MASTERED | NEED_REVIEW
  isFavorite   Boolean    @default(false)
  updatedAt    DateTime   @updatedAt

  @@unique([userId, vocabularyId])
}

model GrammarPoint {
  id          Int      @id @default(autoincrement())
  lessonId    Int
  lesson      Lesson   @relation(fields: [lessonId], references: [id])
  title       String
  explanation String
  formula     String?  // Công thức ngữ pháp
  examples    String   // Dạng chuỗi JSON chứa các ví dụ
}

model Listening {
  id         Int      @id @default(autoincrement())
  lessonId   Int
  lesson     Lesson   @relation(fields: [lessonId], references: [id])
  title      String
  transcript String
  audioUrl   String?
  questions  String   // JSON danh sách câu hỏi trắc nghiệm nghe
}

model Conversation {
  id       Int      @id @default(autoincrement())
  lessonId Int
  lesson   Lesson   @relation(fields: [lessonId], references: [id])
  title    String
  context  String
  dialogue String   // JSON danh sách lượt thoại: [{ speaker, text, meaning }]
}

model Exercise {
  id            Int      @id @default(autoincrement())
  lessonId      Int
  lesson        Lesson   @relation(fields: [lessonId], references: [id])
  type          String   // MULTIPLE_CHOICE | FILL_BLANK | WORD_ORDER | MATCHING
  question      String
  options       String?  // JSON các lựa chọn
  correctAnswer String   // Đáp án đúng hoặc JSON chuỗi từ đúng
  explanation   String?
}

model QuizQuestion {
  id            Int      @id @default(autoincrement())
  lessonId      Int
  lesson        Lesson   @relation(fields: [lessonId], references: [id])
  question      String
  options       String   // JSON mảng 4 lựa chọn
  correctAnswer String
  explanation   String?
}

model UserProgress {
  id             Int       @id @default(autoincrement())
  userId         Int
  user           User      @relation(fields: [userId], references: [id])
  lessonId       Int
  lesson         Lesson    @relation(fields: [lessonId], references: [id])
  progress       Int       @default(0) // 0 đến 100%
  completed      Boolean   @default(false)
  score          Int       @default(0)
  completedAt    DateTime?
  updatedAt      DateTime  @updatedAt

  @@unique([userId, lessonId])
}

model QuizAttempt {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  lessonId  Int
  score     Int
  total     Int
  passed    Boolean
  createdAt DateTime @default(now())
}
```

---

### 4. Danh sách REST API Endpoints

| Nhóm | Method | Đường dẫn (Path) | Chức năng | Phân quyền |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/register` | Đăng ký tài khoản mới | Public |
| | POST | `/api/auth/login` | Đăng nhập & lấy token JWT | Public |
| | GET | `/api/auth/me` | Lấy thông tin tài khoản hiện tại | User Token |
| **Lessons** | GET | `/api/lessons` | Danh sách bài học + % hoàn thành | User Token |
| | GET | `/api/lessons/:id` | Trọn bộ chi tiết bài học đa kỹ năng | User Token |
| | POST | `/api/lessons/:id/complete`| Cập nhật hoàn thành bài học, nhận XP | User Token |
| **Vocab** | GET | `/api/vocabulary` | Tra cứu/lọc từ vựng theo bài, level | User Token |
| | POST | `/api/vocabulary/:id/status`| Đánh dấu yêu thích / cần ôn | User Token |
| **Quiz** | POST | `/api/quiz/:lessonId/submit`| Nộp bài quiz, tính điểm & XP | User Token |
| **Placement** | GET | `/api/placement-test` | Lấy đề thi kiểm tra đầu vào | Public/User |
| | POST | `/api/placement-test/submit`| Chấm điểm & cập nhật Level (A1, A2...) | User Token |
| **Dashboard** | GET | `/api/dashboard` | Lấy thông tin "Today's Learning", streak | User Token |
| **Admin** | GET | `/api/admin/stats` | Thống kê tổng số users, lessons, quiz | Admin Token |
| | POST | `/api/admin/lessons` | Thêm bài học mới | Admin Token |
| | PUT/DELETE | `/api/admin/lessons/:id` | Chỉnh sửa / xóa bài học | Admin Token |
| | POST | `/api/admin/vocabulary` | Thêm từ vựng mới | Admin Token |

---

### 5. Kiến trúc Giao diện Frontend (UI/UX Pages & Features)

1. **Trang Chủ / Landing Page (`/`):**
   - Hero Section: Slogan *"Learn English Step by Step - Easy"*, nút Bắt đầu học và Kiểm tra trình độ.
   - Nhóm 4 trụ cột kỹ năng: Vocabulary, Grammar, Listening, Speaking.
   - Lộ trình học minh họa và lợi ích phương pháp.

2. **Xác thực (`/login`, `/register`):**
   - Form đăng ký có chọn mục tiêu học (Giao tiếp, Lấy lại gốc, Cải thiện phát âm...).
   - Lưu thông tin phiên đăng nhập tự động.

3. **Kiểm tra đầu vào (`/placement-test`):**
   - Giao diện làm bài tập trung, thanh tiến trình trực quan, 15-20 câu phân loại chuẩn từ cơ bản đến nâng cao.
   - Bảng kết quả công bố cấp độ (A1, A2, B1...) và đề xuất lộ trình khởi đầu.

4. **Trang Điều khiển Học viên (`/dashboard`):**
   - Khối **"Today's Learning"** hướng dẫn học trong ngày (10 Từ vựng, 1 Ngữ pháp, 1 Bài nghe).
   - Khối **"Continue Learning"** tiếp tục bài học dang dở.
   - Chỉ số thống kê nhanh: Chuỗi học (Streak 🔥), Điểm tích lũy (XP ⭐), Mục tiêu ngày.

5. **Trình Học bài Tương tác (`/lessons/:id`):**
   - Chuyển tab hoặc chuyển bước theo tuần tự:
     - **Từ vựng & Flashcards:** Lật thẻ 3D trực quan, nghe phát âm IPA qua Web Speech API.
     - **Ngữ pháp:** Trình bày lý thuyết trực quan kèm ví dụ màu sắc.
     - **Luyện nghe & Hội thoại:** Nghe đoạn đọc mẫu, phân vai đối thoại A/B.
     - **Luyện phát âm:** Thu âm giọng nói người dùng và so khớp chính tả (Speech Recognition).
     - **Bài tập tương tác:** Làm bài kiểm tra phản xạ đa dạng.
     - **Quiz kết thúc:** Chấm điểm, thông báo đậu/trượt và cộng điểm thưởng XP.

6. **Tra cứu & Sổ tay Từ vựng (`/vocabulary` & `/dictionary`):**
   - Tìm kiếm từ vựng theo chủ đề, lọc các từ đã yêu thích hoặc cần ôn tập định kỳ.

7. **Trang Quản trị Admin (`/admin`):**
   - Thống kê toàn hệ thống (Học viên, Bài học, Lượt làm bài).
   - Bảng biểu quản lý, thêm/sửa/xóa bài học và từ vựng nhanh chóng.

---

### 6. Gói Dữ liệu Khởi tạo Mẫu (Seed Data)

Hệ thống sẽ nạp sẵn dữ liệu khởi đầu phong phú:
- **Tài khoản:**
  - Admin: `admin@e4b.com` / Mật khẩu: `admin123`
  - Học viên mẫu: `student@e4b.com` / Mật khẩu: `student123`
- **Bài học (5 bài học mẫu chuẩn theo tài liệu):**
  1. *Lesson 1: Greetings & Introductions* (Chào hỏi và Làm quen)
  2. *Lesson 2: Personal Pronouns & Verb To Be* (Đại từ nhân xưng & Động từ To Be)
  3. *Lesson 3: Family Members* (Gia đình thân yêu)
  4. *Lesson 4: Numbers & Daily Time* (Số đếm & Thời gian)
  5. *Lesson 5: Food, Drinks & At the Coffee Shop* (Đồ ăn, thức uống & Gọi món tại quán cà phê)
- Mỗi bài học đi kèm tối thiểu 8-12 từ vựng chuẩn IPA, bài giảng ngữ pháp, file/đoạn hội thoại mẫu, bài tập tương tác và bài quiz 5 câu trắc nghiệm.
- Bộ đề kiểm tra đầu vào (Placement Test) chuẩn gồm các câu hỏi từ vựng, ngữ pháp và đọc hiểu cơ bản.

---

### 7. Kế hoạch Kiểm thử & Xác minh (Verification & Testing)

1. **Khởi tạo & Di chuyển CSDL:** Chạy `npx prisma migrate dev` và `node prisma/seed.js` không gặp lỗi.
2. **Kiểm tra API Backend:** Sử dụng script test HTTP gọi xác thực, lấy bài học, nộp quiz và tính điểm XP.
3. **Kiểm tra Frontend:** Build Vite thành công, chạy đồng bộ Client + Server, tương tác đầy đủ các luồng:
   - Đăng ký $\rightarrow$ Đăng nhập $\rightarrow$ Placement Test $\rightarrow$ Học bài tương tác $\rightarrow$ Lật Flashcard + Phát âm $\rightarrow$ Nộp Quiz $\rightarrow$ Kiểm tra điểm trên Dashboard $\rightarrow$ Admin panel.
