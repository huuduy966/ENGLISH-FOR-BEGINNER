# CEFR Lessons Expansion (A1–C2) & Lessons List Page Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand English for Beginner (E4B) curriculum to all 6 CEFR levels (A1, A2, B1, B2, C1, C2) with 30 lessons per level (180 structured lessons total), and upgrade the Lessons List page with CEFR tabs, search, category/status filters, pagination (12 lessons/page), and independent per-level sequential unlocking.

**Architecture:** Split curriculum content into modular JS files per level under `server/prisma/curriculum/`, seeded safely into SQLite via Prisma. Upgrade backend `GET /api/lessons` to handle level/category/status/search query parameters with database-level pagination, level statistics, and per-level sequential progress locking. Re-architect frontend `LessonsListPage.jsx` into a responsive, filterable, paginated dashboard with skeletons and empty states while preserving existing layout and Tailwind styling.

**Tech Stack:** Node.js, Express, Prisma ORM, SQLite, React 18, Vite, Tailwind CSS, Lucide React icons, Axios, Web Speech API.

**Spec:** `docs/superpowers/specs/2026-10-09-cefr-lessons-expansion-design.md`

## Global Constraints

- Preserve existing styling: Tailwind CSS, `rounded-3xl` cards, `slate-50` background, Lucide icons, existing Sidebar and Header.
- Do not create a second database, second API client, second layout, or second auth system.
- Preserve student progress and database records: seeding must be idempotent and non-destructive.
- Sequential lock rule: Lesson 1 of any level is unlocked; Lesson $N$ within a level requires Lesson $N-1$ of that same level to be completed. Admin users have all lessons unlocked.
- Do not break existing features: QuickDictionaryModal, DictionaryPage, PlacementTestPage, ProgressPage, ProfilePage, LessonDetailPage.

## Review Focus

1. **Level boundary in sequential locking:** Completing Lesson 30 of A1 must not lock or affect Lesson 1 of A2; each level's Lesson 1 must start unlocked.
2. **Page boundary pagination:** Changing levels or filters must reset pagination to Page 1 and recalculate total pages accurately.
3. **Empty filter search state:** Searching for a non-existent title must display a friendly empty state with a "Reset filters" button without crashing.
4. **Lesson detail backward compatibility:** Navigating to `/lessons/:id` from any level must render all 7 steps (vocab, pronounce, grammar, listen, conversation, exercise, quiz) without missing JSON fields.
5. **Admin role bypass:** Admin users must see all lessons unlocked across all 6 levels without restriction.

---

### Task 1: Curriculum Data Architecture (`server/prisma/curriculum/`)

**Files:**
- Create: `server/prisma/curriculum/a1.js`
- Create: `server/prisma/curriculum/a2.js`
- Create: `server/prisma/curriculum/b1.js`
- Create: `server/prisma/curriculum/b2.js`
- Create: `server/prisma/curriculum/c1.js`
- Create: `server/prisma/curriculum/c2.js`
- Create: `server/prisma/curriculum/index.js`

**Interfaces:**
- Produces: `curriculum: { A1: Lesson[], A2: Lesson[], B1: Lesson[], B2: Lesson[], C1: Lesson[], C2: Lesson[] }`
  Each `Lesson` object contains:
  `{ title, description, level, category, orderNumber, durationMinutes, vocabularies: [...], grammarPoints: [...], listenings: [...], conversations: [...], exercises: [...], quizzes: [...] }`

- [ ] **Step 1: Create `a1.js` with 30 beginner lessons**
  Build 30 lessons covering Greetings, Numbers, Colors, Family, Food, Jobs, Time, Daily Routines, Places in Town, Home, School, Basic Questions, etc. Each with 10–12 vocabulary items (word, pronunciation IPA, partOfSpeech, meaning, example, exampleMeaning), grammar points, listenings, conversations, exercises, quizzes.

- [ ] **Step 2: Create `a2.js` with 30 elementary lessons**
  Build 30 lessons covering Shopping, Directions, Transportation, Weather, Hobbies, Health, Restaurants, Travel, Past Simple, Future with Going to/Will, Comparatives/Superlatives, Countable/Uncountable, Modal Verbs (Can/Must/Should), etc.

- [ ] **Step 3: Create `b1.js` with 30 intermediate lessons**
  Build 30 lessons covering Work & Careers, Digital Technology, Environmental Issues, Travel Experiences, Present Perfect vs Past Simple, Passive Voice, Conditionals Type 1 & 2, Phrasal Verbs, Reported Speech, Giving Opinions, etc.

- [ ] **Step 4: Create `b2.js` with 30 upper-intermediate lessons**
  Build 30 lessons covering Debates & Negotiations, Media & Journalism, Business Communication, Scientific Advances, Culture & Society, Common Idioms & Collocations, Mixed Conditionals, Advanced Relative Clauses, Formal Argumentation, etc.

- [ ] **Step 5: Create `c1.js` with 30 advanced lessons**
  Build 30 lessons covering Academic English, Professional Leadership, Critical Thinking, Research Methodologies, Lexical Nuance & Connotation, Inversion & Cleft Sentences, Conference Presentations, Nuanced Discussions, etc.

- [ ] **Step 6: Create `c2.js` with 30 proficiency lessons**
  Build 30 lessons covering Rhetoric & Literary Language, Native-Level Idiomatic Nuance, Subtle Meaning Distinctions, Academic Discourse, Complex Audio Comprehension, Metaphorical Reasoning, Persuasive Oratory, etc.

- [ ] **Step 7: Create `server/prisma/curriculum/index.js`**
  Export aggregated curriculum map: `{ A1, A2, B1, B2, C1, C2, allLessons }`.

- [ ] **Step 8: Verify curriculum module imports and structure**
  Run quick Node check: `node -e "const c = require('./server/prisma/curriculum'); console.log(Object.keys(c), c.allLessons.length);"`
  Expected output: `[ 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'allLessons' ] 180`

- [ ] **Step 9: Commit**
  ```bash
  git add server/prisma/curriculum/
  git commit -m "feat(curriculum): add 180 comprehensive lessons across CEFR levels A1 to C2"
  ```

---

### Task 2: Database Seeder Upgrade (`server/prisma/seed.js`)

**Files:**
- Modify: `server/prisma/seed.js`

**Interfaces:**
- Consumes: `curriculum.allLessons` from `server/prisma/curriculum/index.js`
- Produces: Populated SQLite database with 180 lessons, associated vocabularies, grammar, listenings, conversations, exercises, quizzes, preserving existing student users.

- [ ] **Step 1: Write seeder logic with idempotent upsert/findFirst**
  Update `server/prisma/seed.js` to iterate over all 180 lessons. For each lesson:
  - Check if lesson exists by `level` and `orderNumber` (or `title`).
  - If existing, update title, category, description, durationMinutes.
  - If new, create `Lesson` with relations (`vocabularies`, `grammarPoints`, `listenings`, `conversations`, `exercises`, `quizzes`).
  - Ensure student account (`student@e4b.com`) and admin account (`admin@e4b.com`) remain intact.

- [ ] **Step 2: Run seeder script**
  Run: `node server/prisma/seed.js`
  Expected output: Confirmation message indicating 180 lessons seeded successfully without error.

- [ ] **Step 3: Verify lesson count and relations in SQLite database**
  Run: `node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.lesson.count().then(c => console.log('Total lessons:', c)).finally(() => prisma.\$disconnect());"`
  Expected output: `Total lessons: 180` (or >= 180)

- [ ] **Step 4: Commit**
  ```bash
  git add server/prisma/seed.js
  git commit -m "feat(db): update seed script to import all 180 CEFR lessons"
  ```

---

### Task 3: Backend API Upgrade for Lessons Pagination, Filters, and Per-Level Sequential Locking

**Files:**
- Modify: `server/src/controllers/lessonController.js`
- Modify: `server/tests/api.test.js`

**Interfaces:**
- Consumes: Query params `level`, `category`, `search`, `status`, `page`, `limit` on `GET /api/lessons`.
- Produces: JSON response with `{ lessons, pagination, stats, categories }` and per-level sequential locked status (`isLocked`, `isCurrentActive`).

- [ ] **Step 1: Update test file `server/tests/api.test.js` with new assertions**
  Add assertions for:
  - `GET /api/lessons?level=A1&page=1&limit=12` returns 12 lessons, `pagination.total === 30`, `pagination.totalPages === 3`.
  - `GET /api/lessons?level=B1&page=1&limit=12` returns Lesson 1 of B1 unlocked (`isLocked === false`).
  - `GET /api/lessons?level=A1&category=Greetings` filters by category.
  - `GET /api/lessons?search=introduce` searches by keyword.
  - Lesson 2 of A1 is locked if Lesson 1 is not completed for the test user.

- [ ] **Step 2: Run test suite to verify tests fail before implementation**
  Run: `npm run test:server`
  Expected: FAIL on new assertions.

- [ ] **Step 3: Implement enhanced `getLessons` in `lessonController.js`**
  - Extract query params: `level` (defaults to user's level or 'A1'), `category`, `search`, `status`, `page = 1`, `limit = 12`.
  - Build Prisma `where` clause:
    - If `level && level !== 'All'`, filter by `level`.
    - If `category && category !== 'All'`, filter by `category`.
    - If `search`, filter by `OR: [{ title: { contains: search } }, { description: { contains: search } }]`.
  - Fetch distinct categories for the current level to supply the filter dropdown.
  - Query total count matching `where` for pagination.
  - Calculate per-level sequential locks:
    - Group lessons by level or sort by `orderNumber asc`.
    - Lesson with `orderNumber: 1` in that level has `isLocked: false`.
    - Lesson $N$ in that level is unlocked only if Lesson $N-1$ in *the same level* is completed by `userId`.
    - Admin users always have `isLocked: false`.
  - Filter by `status` if requested (`completed`, `learning`, `not_started`).
  - Apply pagination slice (`skip = (page - 1) * limit`, `take = limit`).
  - Return `{ lessons: pagedLessons, pagination: { page, limit, total, totalPages }, stats: { totalInLevel, completedInLevel, learningInLevel }, categories }`.

- [ ] **Step 4: Update `getLessonById` in `lessonController.js` for per-level sequential progression check**
  Update check:
  - Find `prevLesson` with `orderNumber: lesson.orderNumber - 1` AND `level: lesson.level`.
  - If `prevLesson` exists and is not completed by `userId`, return `403 Forbidden` with `{ isLocked: true, requiredLessonId: prevLesson.id, requiredLessonTitle: prevLesson.title, requiredOrderNumber: prevLesson.orderNumber, level: lesson.level }`.

- [ ] **Step 5: Run backend test suite to verify all tests pass**
  Run: `npm run test:server`
  Expected: All tests PASS (100% green).

- [ ] **Step 6: Commit**
  ```bash
  git add server/src/controllers/lessonController.js server/tests/api.test.js
  git commit -m "feat(api): implement CEFR level filtering, pagination, and per-level sequential progression"
  ```

---

### Task 4: Frontend Lessons List Page UI Upgrade (`client/src/pages/LessonsListPage.jsx`)

**Files:**
- Modify: `client/src/pages/LessonsListPage.jsx`

**Interfaces:**
- Consumes: `GET /api/lessons?level=...&category=...&search=...&status=...&page=...&limit=12`
- Produces: Upgraded React component with Level Filter Bar, Stats Overview KPI, Search & Dropdown Toolbar, 3-column Lesson Cards Grid, Pagination Bar, Skeletons, and Empty State.

- [ ] **Step 1: Define CEFR level metadata and color schemas**
  Map out levels:
  - `A1`: Beginner (Blue: `border-blue-200 bg-blue-50 text-blue-700`)
  - `A2`: Elementary (Cyan: `border-cyan-200 bg-cyan-50 text-cyan-700`)
  - `B1`: Intermediate (Emerald: `border-emerald-200 bg-emerald-50 text-emerald-700`)
  - `B2`: Upper Intermediate (Amber: `border-amber-200 bg-amber-50 text-amber-700`)
  - `C1`: Advanced (Purple: `border-purple-200 bg-purple-50 text-purple-700`)
  - `C2`: Proficiency (Rose: `border-rose-200 bg-rose-50 text-rose-700`)
  - `All`: Tất cả cấp độ (Slate: `border-slate-200 bg-slate-100 text-slate-700`)

- [ ] **Step 2: Implement state management and URL query synchronisation**
  Add state hooks for:
  - `selectedLevel`: initialized from `user.level || 'A1'`.
  - `searchKeyword`: with debounce or instant enter handler.
  - `selectedCategory`: `All` or specific category.
  - `selectedStatus`: `all`, `completed`, `learning`, `not_started`.
  - `currentPage`: integer, defaults to 1. Resets to 1 whenever level, search, category, or status changes.
  - `pagination`: `{ page, limit, total, totalPages }`.
  - `levelStats`: `{ totalInLevel, completedInLevel, learningInLevel }`.
  - `categoriesList`: string array from API.

- [ ] **Step 3: Build Level Filter Bar (Tabs)**
  Render horizontal scrollable / responsive row of 6 CEFR level tabs + "Tất cả". Display badge indicator for current student's level ("Trình độ hiện tại").

- [ ] **Step 4: Build Level Progress Summary (KPI Cards)**
  Render 3 KPI summary cards showing:
  - Tổng số bài trong cấp độ
  - Số bài đã hoàn thành (kèm thanh phần trăm tiến độ của cấp độ)
  - Số bài đang học dở dang

- [ ] **Step 5: Build Search and Filter Toolbar**
  - Search input with clear button.
  - Category dropdown populated dynamically from API.
  - Status filter dropdown (`Tất cả`, `Đã hoàn thành`, `Đang học`, `Chưa học`).

- [ ] **Step 6: Build Responsive 3-Column Lesson Cards Grid**
  Each card displays:
  - Order number & level badge (e.g. `Bài 1 • A1`).
  - Status badge (Đã hoàn thành / Đang học / Mở khóa / Bị khóa).
  - Lesson title & category.
  - 2-line clamped description.
  - Vocabulary count (e.g. `12 từ vựng`), Grammar point title, duration (~15–20 phút).
  - Action button:
    - If completed: "Học lại bài" (link to `/lessons/:id`).
    - If active/in-progress: "Tiếp tục học" (prominent blue button).
    - If unlocked & not started: "Bắt đầu học".
    - If locked: disabled with message "Cần làm Bài X trước".

- [ ] **Step 7: Build Pagination Bar**
  Render bottom pagination controls:
  - `← Trang trước` (disabled on page 1).
  - Numeric page buttons (`1`, `2`, `3`...).
  - `Trang sau →` (disabled on last page).
  - Summary text: "Hiển thị bài X - Y trên tổng số Z bài của cấp độ [Level]".
  - Scroll smooth to top on page change.

- [ ] **Step 8: Implement Skeletons and Empty State**
  - Loading skeleton: 6 pulsating card skeletons.
  - Empty state: Clean friendly icon + "Không tìm thấy bài học nào phù hợp" + "Đặt lại bộ lọc".

- [ ] **Step 9: Test and build client bundle**
  Run: `npm run build:client`
  Expected: Successful build with zero errors.

- [ ] **Step 10: Commit**
  ```bash
  git add client/src/pages/LessonsListPage.jsx
  git commit -m "feat(ui): upgrade lessons list page with CEFR tabs, filters, pagination, and KPI cards"
  ```

---

### Task 5: Integration Verification & Regression Testing

**Files:**
- Verify: Full stack (`server`, `client`, database, routing)

- [ ] **Step 1: Run complete backend test suite**
  Run: `npm run test:server`
  Expected: 100% tests PASS.

- [ ] **Step 2: Test API endpoints across multiple CEFR levels**
  Execute API curl/fetch tests across levels:
  - Check A1 pagination (Page 1 and Page 2).
  - Check B2 lessons list and category filtering.
  - Check C1 lesson detail API returns all 7 modules (vocab, grammar, listen, conversation, exercise, quiz).

- [ ] **Step 3: Run production frontend build check**
  Run: `npm run build:client`
  Expected: Vite compiles successfully with 0 errors.

- [ ] **Step 4: Verify git status and commit final adjustments**
  ```bash
  git status
  git commit -m "test(integration): verify CEFR lessons expansion and pagination across all levels"
  ```
