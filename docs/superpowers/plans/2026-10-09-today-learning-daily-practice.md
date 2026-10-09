# Daily Practice 60 Questions & Today's Learning Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the "Today's Learning" system on the Dashboard into a comprehensive 60-question daily practice engine tailored to the learner's current CEFR level (A1..C2), divided into 5 parts (Vocabulary: 20, Speaking: 10, Error correction: 10, Listening: 10, Reading: 10), with server-side scoring (+4 correct, -2 wrong, min 0), daily session persistence, instant check without confirmation button, 1.5s auto-advance, and replacing "Words learned" with "Practice Score" on the Dashboard.

**Architecture:**
1. Database: Update Prisma schema to add `practiceScore` to `User` and create `DailyPractice` model with `@@unique([userId, date])`.
2. Backend: Build CEFR question bank generator for all 6 levels, `dailyPracticeController.js` for session creation/resumption and tamper-proof answer scoring, mount `/api/daily-practice` routes.
3. Frontend: Redesign `TodaysLearningCard.jsx` to show 5 mission cards with live progress, replace words learned with practice score in `StatsRow.jsx`, and create `DailyPracticeModal.jsx` for the focused 60-question runner with immediate click verification and 1.5s auto-advance.

**Tech Stack:** Express, Prisma ORM, SQLite, React 18, Vite, Tailwind CSS, Lucide React icons, Web Speech API.

**Spec:** `docs/superpowers/specs/2026-10-09-today-learning-daily-practice-design.md`

## Global Constraints

- Preserve website design: Left Sidebar, Header, blue color theme, `slate-50` background, `rounded-3xl` cards, Lucide icons.
- No second database, no second API client, no second auth system.
- Exactly 60 questions per day: 20 Vocabulary + 10 Speaking + 10 Error Correction + 10 Listening + 10 Reading.
- Strictly level-scoped: A2 student only receives A2 questions; no cross-level mixing.
- Server-side scoring: +4 points per correct answer (awarded once per question), -2 points per wrong attempt (clamped at 0).
- NO "Check Answer" / "Kiểm tra đáp án" button; selection immediately triggers verification.
- 1.5-second auto-advance on correct answers.

## Review Focus

1. **Session Idempotence:** Reloading the page or logging back in on the same date must restore the exact same 60 questions, answers, and score.
2. **Score Floor:** Answering wrong multiple times must never drop `practiceScore` below 0.
3. **No Duplicate Scoring:** Clicking a correct answer multiple times or clicking rapidly must not multiply points.
4. **Passage Visibility in Reading & Audio in Listening:** Reading comprehension questions must display the passage clearly; Listening questions must play audio via Web Speech API.
5. **Dashboard Stats Synchronization:** Updating practice score in the modal must immediately update the Dashboard's "Điểm làm bài" stat card.

---

### Task 1: Database Schema Migration & Question Bank (`server/prisma/`)

**Files:**
- Modify: `server/prisma/schema.prisma`
- Create: `server/prisma/dailyQuestions/index.js`
- Create: `server/prisma/dailyQuestions/a1.js`
- Create: `server/prisma/dailyQuestions/a2.js`
- Create: `server/prisma/dailyQuestions/b1.js`
- Create: `server/prisma/dailyQuestions/b2.js`
- Create: `server/prisma/dailyQuestions/c1.js`
- Create: `server/prisma/dailyQuestions/c2.js`

**Interfaces:**
- Produces: `DailyPractice` database model and `getQuestionsForLevel(level)` returning 60 structured questions in 5 parts.

- [ ] **Step 1: Update Prisma schema**
  In `server/prisma/schema.prisma`:
  Add `practiceScore Int @default(0)` to model `User`.
  Add model `DailyPractice` with fields: `id`, `userId`, `date`, `level`, `score`, `completed`, `currentPart`, `currentQuestionIndex`, `sessionData`, `createdAt`, `updatedAt`, `@@unique([userId, date])`.
  Add `dailyPractices DailyPractice[]` relation on `User`.

- [ ] **Step 2: Apply schema changes via `prisma db push`**
  Run: `npm run db:push`
  Expected: SQLite schema pushed successfully.

- [ ] **Step 3: Build 60-question banks for all 6 CEFR levels (`a1.js` to `c2.js`)**
  For each level, export 5 parts:
  - Part 1 (Vocabulary): 20 questions
  - Part 2 (Speaking / Situational): 10 questions
  - Part 3 (Error Correction): 2 tasks $\times$ 5 questions = 10 questions
  - Part 4 (Listening): 2 audio texts $\times$ 5 questions = 10 questions
  - Part 5 (Reading): 2 passages $\times$ 5 questions = 10 questions
  Export via `server/prisma/dailyQuestions/index.js`.

- [ ] **Step 4: Verify question bank integrity with node script**
  Run: `node -e "const q = require('./server/prisma/dailyQuestions'); ['A1','A2','B1','B2','C1','C2'].forEach(lvl => { const d = q.getQuestionsForLevel(lvl); console.log(lvl, d.length, d.map(p => p.questions.length)); });"`
  Expected: All 6 levels print 5 parts with lengths `[20, 10, 10, 10, 10]`, total 60.

- [ ] **Step 5: Commit**
  ```bash
  git add server/prisma/schema.prisma server/prisma/dailyQuestions/
  git commit -m "feat(db): add DailyPractice model and 60-question banks for CEFR levels A1-C2"
  ```

---

### Task 2: Backend Daily Practice Controller & API Routes

**Files:**
- Create: `server/src/controllers/dailyPracticeController.js`
- Create: `server/src/routes/dailyPracticeRoutes.js`
- Modify: `server/src/app.js`
- Modify: `server/src/controllers/dashboardController.js`

**Interfaces:**
- Produces: `GET /api/daily-practice/today`, `POST /api/daily-practice/answer`, and updated `GET /api/dashboard`.

- [ ] **Step 1: Implement `dailyPracticeController.js`**
  - `getTodayPractice(req, res)`:
    - Format today's date `YYYY-MM-DD`.
    - Find existing `DailyPractice` for `userId` & `date`.
    - If none, fetch 60 questions for `req.user.level` from bank, initialize answer states, create `DailyPractice` record.
    - Return sanitized session data (strip answers from frontend if needed or keep for check).
  - `submitAnswer(req, res)`:
    - Find today's session.
    - Verify answer against `sessionData`.
    - If correct: if not previously answered correctly, award +4 points to session and `user.practiceScore`.
    - If wrong: deduct 2 points (clamp $\ge 0$) from session and `user.practiceScore`.
    - Update `sessionData` with attempt info, save record.
    - Return `{ isCorrect, pointsDelta, newScore, userPracticeScore, explanation }`.

- [ ] **Step 2: Create `dailyPracticeRoutes.js` and mount in `app.js`**
  Mount under `/api/daily-practice` protected by `verifyToken`.

- [ ] **Step 3: Update `dashboardController.js`**
  Include `practiceScore: user.practiceScore` in `stats` of `GET /api/dashboard`.

- [ ] **Step 4: Commit**
  ```bash
  git add server/src/controllers/dailyPracticeController.js server/src/routes/dailyPracticeRoutes.js server/src/app.js server/src/controllers/dashboardController.js
  git commit -m "feat(api): add daily practice controller, routes, and practice score in dashboard stats"
  ```

---

### Task 3: Backend Test Suite Updates (`server/tests/api.test.js`)

**Files:**
- Modify: `server/tests/api.test.js`

**Interfaces:**
- Tests `GET /api/daily-practice/today` and `POST /api/daily-practice/answer`.

- [ ] **Step 1: Add automated tests in `api.test.js`**
  - Verify `GET /api/daily-practice/today` returns 5 parts totaling 60 questions for student.
  - Verify `POST /api/daily-practice/answer` awards +4 for correct and -2 for wrong.
  - Verify `GET /api/dashboard` returns `practiceScore`.

- [ ] **Step 2: Run test suite**
  Run: `npm run test:server`
  Expected: All tests PASS.

- [ ] **Step 3: Commit**
  ```bash
  git add server/tests/api.test.js
  git commit -m "test(api): add automated tests for daily practice session and scoring"
  ```

---

### Task 4: Dashboard UI Updates (`StatsRow.jsx` & `TodaysLearningCard.jsx`)

**Files:**
- Modify: `client/src/components/dashboard/StatsRow.jsx`
- Modify: `client/src/components/dashboard/TodaysLearningCard.jsx`

**Interfaces:**
- `StatsRow`: displays "Điểm làm bài" (`stats.practiceScore`).
- `TodaysLearningCard`: displays 60-question daily overview with 5 part cards and "Bắt đầu ngay" button.

- [ ] **Step 1: Update `StatsRow.jsx`**
  Replace "Từ vựng đã thuộc" with "Điểm làm bài", displaying `stats?.practiceScore || 0` điểm.

- [ ] **Step 2: Redesign `TodaysLearningCard.jsx`**
  Fetch today's practice session via `/api/daily-practice/today`.
  Render top summary: Today's date, Level (e.g. A1), Total 60 questions, Correct count, Remaining, Score today, Progress bar.
  Render 5 part cards (Từ vựng, Luyện nói, Tìm & sửa lỗi sai, Luyện nghe, Luyện đọc) with counts, progress, and button.
  Add "Bắt đầu ngay" button opening `DailyPracticeModal`.

- [ ] **Step 3: Test client build**
  Run: `npm run build:client`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add client/src/components/dashboard/StatsRow.jsx client/src/components/dashboard/TodaysLearningCard.jsx
  git commit -m "feat(dashboard): update stats row with practice score and redesign today learning card"
  ```

---

### Task 5: Build Interactive Daily Practice Runner Modal (`DailyPracticeModal.jsx`)

**Files:**
- Create: `client/src/components/dashboard/DailyPracticeModal.jsx`
- Modify: `client/src/components/dashboard/TodaysLearningCard.jsx`

**Interfaces:**
- Modal focus runner: renders active part and question, 4 choices, immediate check on click, +4/-2 feedback, 1.5s auto-advance, passage display for reading, audio player for listening, and completion summary.

- [ ] **Step 1: Implement `DailyPracticeModal.jsx`**
  - Navigation header: Part name, Question `X / Y`, Current score, Close button.
  - Question view with immediate click option check (calls `api.post('/daily-practice/answer')`).
  - Audio player for Listening questions using `speakText()`.
  - Reading passage card for Reading questions.
  - On CORRECT: green styling, "+4 điểm", start 1500ms timer, advance to next question.
  - On WRONG: red styling, "-2 điểm", allow retry, no advance.
  - Completion summary screen when all 60 questions are done.

- [ ] **Step 2: Connect Modal in `TodaysLearningCard.jsx`**
  Pass session data and trigger modal open on "Bắt đầu ngay" / "Tiếp tục".
  On answer or complete, update local session and refresh dashboard stats.

- [ ] **Step 3: Test client build**
  Run: `npm run build:client`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add client/src/components/dashboard/DailyPracticeModal.jsx client/src/components/dashboard/TodaysLearningCard.jsx
  git commit -m "feat(daily-practice): implement 60-question interactive runner modal with 1.5s auto-advance"
  ```

---

### Task 6: Full Integration & Regression Testing

**Files:**
- Verify: Full stack (`server`, `client`, database, routing)

- [ ] **Step 1: Run complete backend test suite**
  Run: `npm run test:server`
  Expected: 100% tests PASS.

- [ ] **Step 2: Run frontend production build check**
  Run: `npm run build:client`
  Expected: Vite compiles successfully with 0 errors.

- [ ] **Step 3: End-to-end sanity check**
  Verify daily practice session generation across CEFR levels, scoring math, and Dashboard display.
