# Redesign Lesson Detail Page (6 Steps & 1.5s Auto-Advance) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely redesign the Lesson Detail page (`LessonDetailPage.jsx`) and its step components: standardize to a strict 6-step roadmap (removing Conversation), enforce sequential step unlocking and lesson-to-lesson unlocking, implement 1.5-second auto-advance on correct answers across all interactive question steps, enforce an 80% passing threshold for the final quiz, and ensure all progress persists accurately.

**Architecture:**
1. Upgrade `LessonDetailPage.jsx` layout: remove Conversation step, recalculate progress across 6 steps (1: Vocab, 2: Pronounce, 3: Grammar, 4: Listen, 5: Exercise, 6: Quiz). Build a modern header info bar, vertical 6-step roadmap with strict lock enforcement, main stage content area, and a bottom action bar with dynamic completion gates.
2. Upgrade `FlashcardSection.jsx`: compact balanced 3D card layout (front/back), full metadata, word selector carousel, and a completion condition requiring viewing all cards before Step 1 completes.
3. Upgrade `PronunciationSection.jsx`, `GrammarSection.jsx`, `ListeningSection.jsx`, `ExerciseSection.jsx`, and `QuizSection.jsx`: implement the 1.5-second auto-advance mechanism (`setTimeout` with cleanup) on correct answers, pause on wrong answers for retrying, and track complete states.
4. Upgrade backend `testController.js` quiz passing threshold from 70% to 80%, updating test assertions accordingly.

**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide React icons, Web Speech API (TTS & STT), Axios, Express, Prisma ORM, SQLite.

**Spec:** `docs/superpowers/specs/2026-10-09-lesson-detail-redesign-6steps.md`

## Global Constraints

- Keep existing overall layout: Left Sidebar, Header, blue primary color, `slate-50` background, `rounded-3xl` cards, Lucide icons.
- No second database, no second API client, no second auth system.
- 6 steps only: 1. Từ vựng, 2. Phát âm, 3. Ngữ pháp, 4. Luyện nghe, 5. Bài tập, 6. Quiz cuối bài. No Conversation.
- Strictly sequential: cannot skip forward to locked steps or locked lessons.
- 1.5s auto-advance timer must clean up on unmount or question change (`clearTimeout`).
- Quiz pass threshold must be $\ge 80\%$.

## Review Focus

1. **Conversation removal consistency:** Ensure no remaining references or UI artifacts to the 7th Conversation step in roadmap, progress math, or step indices.
2. **Timer leak prevention:** Rapid clicking or switching steps while the 1.5s auto-advance timer is running must not cause memory leaks or jump into invalid question indices.
3. **Step completion verification:** Stepping forward must be blocked until all required activities of the current step are satisfied (e.g. all vocabularies viewed, all questions answered).
4. **80% Quiz threshold:** Quiz submission with 70–79% must evaluate as failed (`passed = false`) and require retrying; only $\ge 80\%$ unlocks the next lesson.
5. **State persistence across page reloads:** Reloading `/lessons/:id` must restore the highest unlocked step and completed lesson state from database and `localStorage`.

---

### Task 1: Backend Quiz Pass Threshold Upgrade (`server/src/controllers/testController.js`) & Test Updates

**Files:**
- Modify: `server/src/controllers/testController.js:143-150`
- Modify: `server/tests/api.test.js:115-130`

**Interfaces:**
- Produces: Quiz submission endpoint with `passed = percentage >= 80`.

- [ ] **Step 1: Update quiz threshold to 80% in `testController.js`**
  In `submitLessonQuiz`:
  Change `const passed = percentage >= 70;` to `const passed = percentage >= 80;`.
  Update result message to reflect minimum 80%.

- [ ] **Step 2: Update test assertion in `server/tests/api.test.js`**
  Verify `POST /api/quiz/:lessonId/submit` evaluates quiz with 80% pass threshold.

- [ ] **Step 3: Run backend test suite**
  Run: `npm run test:server`
  Expected: 19/19 tests PASS.

- [ ] **Step 4: Commit**
  ```bash
  git add server/src/controllers/testController.js server/tests/api.test.js
  git commit -m "feat(quiz): enforce 80% passing threshold for final quiz submissions"
  ```

---

### Task 2: Redesign `LessonDetailPage.jsx` to 6-Step Roadmap, Sequential Progression & Bottom Action Bar

**Files:**
- Modify: `client/src/pages/LessonDetailPage.jsx`

**Interfaces:**
- Consumes: `GET /api/lessons/:id`
- Produces: 6-step roadmap (`vocab`, `pronounce`, `grammar`, `listen`, `exercise`, `quiz`), bottom action bar, strict sequential lock enforcement, and real progress percentage.

- [ ] **Step 1: Replace 7 tabs with 6 standardized steps**
  Define `tabs`:
  1. `vocab`: 1. Từ vựng (BookOpen)
  2. `pronounce`: 2. Phát âm (Mic)
  3. `grammar`: 3. Ngữ pháp (BookOpen)
  4. `listen`: 4. Luyện nghe (Headphones)
  5. `exercise`: 5. Bài tập (CheckSquare)
  6. `quiz`: 6. Quiz cuối bài (Award)
  Remove all imports and references to `ConversationSection`.

- [ ] **Step 2: Implement step completion tracking**
  Add state `stepCompletionStatus`: `{ vocab: boolean, pronounce: boolean, grammar: boolean, listen: boolean, exercise: boolean, quiz: boolean }`.
  Calculate progress percentage based on 6 steps: `Math.round((unlockedStepIndex / 6) * 100)`. If lesson is completed, show 100%.

- [ ] **Step 3: Enforce strict in-lesson sequential locking**
  In `handleTabClick(targetTabId, targetIndex)`:
  - Allow access only if `isCompleted || isAdmin || targetIndex <= unlockedStepIndex`.
  - Block jumping ahead to future steps with an informative alert/toast.

- [ ] **Step 4: Build Bottom Action Bar with Dynamic Next-Step Button**
  Render fixed/sticky bottom action bar:
  - Left: "← Quay lại bước trước" (enabled when `currentStepIndex > 0`).
  - Center: Status hint ("Hoàn thành nội dung để mở khóa bước tiếp theo").
  - Right: "Tiếp tục sang [Tên bước sau] →" (enabled only if current step is marked complete; advances `unlockedStepIndex` and sets `activeTab`).
  - When in Quiz step: show "Nộp bài Quiz" or "Hoàn thành bài học".

- [ ] **Step 5: Test client build**
  Run: `npm run build:client`
  Expected: Successful compilation without errors.

- [ ] **Step 6: Commit**
  ```bash
  git add client/src/pages/LessonDetailPage.jsx
  git commit -m "feat(lesson-detail): redesign page layout with 6-step roadmap, sequential locks, and action bar"
  ```

---

### Task 3: Redesign Step 1 - Vocabulary (`FlashcardSection.jsx`) with Full-View Completion Gate

**Files:**
- Modify: `client/src/components/lesson/FlashcardSection.jsx`

**Interfaces:**
- Consumes: `vocabularies: Array<Vocabulary>`, `onStepComplete: (isComplete: boolean) => void`
- Produces: Balanced flashcard with full vocabulary metadata and tracking of viewed words to gate step completion.

- [ ] **Step 1: Add viewed words tracking**
  In `FlashcardSection.jsx`, add state `viewedIndices = new Set([0])`.
  Whenever `currentIndex` changes, add it to `viewedIndices`.
  When `viewedIndices.size === vocabs.length`, call `onStepComplete(true)`.

- [ ] **Step 2: Optimize card dimensions and visual balance**
  Ensure card height is balanced (~380px on desktop, ~420px on mobile), eliminate excessive empty space, with clean typography and badges.

- [ ] **Step 3: Test client build**
  Run: `npm run build:client`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add client/src/components/lesson/FlashcardSection.jsx
  git commit -m "feat(vocab): add view-all completion requirement and optimize card visual balance"
  ```

---

### Task 4: Redesign Step 2 - Pronunciation (`PronunciationSection.jsx`) with 1.5s Auto-Advance

**Files:**
- Modify: `client/src/components/lesson/PronunciationSection.jsx`

**Interfaces:**
- Consumes: `vocabularies: Array<Vocabulary>`, `onStepComplete: (isComplete: boolean) => void`
- Produces: Pronunciation practice with model audio, mouth-shape guides, phonetic recognition questions, and 1.5s auto-advance on correct answers.

- [ ] **Step 1: Build pronunciation practice and discrimination quiz items**
  Render target word, IPA transcription, and Vietnamese pronunciation guide (hướng dẫn phát âm âm khó).
  Render Web Speech API model audio button.
  Render interactive phonetic recognition questions (e.g. "Từ nào sau đây có phát âm là /.../?").

- [ ] **Step 2: Implement 1.5-second auto-advance on CORRECT**
  Use `autoAdvanceTimerRef = useRef(null)`.
  When answer is correct:
  - Display green feedback and checkmark immediately.
  - Disable options.
  - Set `setTimeout` for 1500ms to advance `currentIndex`.
  - If last item, call `onStepComplete(true)` and render section completion banner.
  When answer is wrong:
  - Display red warning, do not set timer, allow retrying.
  Clean up timer in `useEffect` return and on question change.

- [ ] **Step 3: Test client build**
  Run: `npm run build:client`
  Expected: Successful compilation without errors.

- [ ] **Step 4: Commit**
  ```bash
  git add client/src/components/lesson/PronunciationSection.jsx
  git commit -m "feat(pronunciation): implement pronunciation guides, discrimination quiz, and 1.5s auto-advance"
  ```

---

### Task 5: Redesign Step 3 - Grammar (`GrammarSection.jsx`) with 1.5s Auto-Advance

**Files:**
- Modify: `client/src/components/lesson/GrammarSection.jsx`

**Interfaces:**
- Consumes: `grammarPoints: Array<GrammarPoint>`, `onStepComplete: (isComplete: boolean) => void`
- Produces: Bite-sized grammar cards (formula, rules, examples with audio, common mistakes) and interactive practice with 1.5s auto-advance.

- [ ] **Step 1: Format grammar theory cards**
  Render formula box, usage rules, bilingual examples with audio, and "Các lỗi thường gặp (Common Mistakes)".

- [ ] **Step 2: Implement 1.5s auto-advance on practice questions**
  For grammar practice questions:
  - On CORRECT: green styling, checkmark, "Chính xác! Đang chuyển câu tiếp theo..." -> 1500ms timer -> advance question.
  - On WRONG: red styling, explanation, allow retrying.
  - When all questions answered correctly: call `onStepComplete(true)`.
  - Proper `clearTimeout` on unmount / change.

- [ ] **Step 3: Test client build**
  Run: `npm run build:client`
  Expected: Successful compilation without errors.

- [ ] **Step 4: Commit**
  ```bash
  git add client/src/components/lesson/GrammarSection.jsx
  git commit -m "feat(grammar): add common mistakes box and 1.5s auto-advance on practice questions"
  ```

---

### Task 6: Redesign Step 4 - Listening (`ListeningSection.jsx`) with 1.5s Auto-Advance

**Files:**
- Modify: `client/src/components/lesson/ListeningSection.jsx`

**Interfaces:**
- Consumes: `listenings: Array<Listening>`, `onStepComplete: (isComplete: boolean) => void`
- Produces: Audio player with Play/Pause/Replay, toggleable transcript, comprehension questions with 1.5s auto-advance.

- [ ] **Step 1: Audio player controls & transcript toggle**
  Ensure audio plays via Web Speech API with clean play/pause/replay controls.
  Start with transcript hidden; button to reveal.

- [ ] **Step 2: Implement 1.5s auto-advance on comprehension questions**
  - On CORRECT: green feedback, "Chính xác! Đang chuyển câu tiếp theo..." -> 1500ms timer -> next question.
  - On WRONG: red feedback, allow retry.
  - Clean up timer in cleanup function.
  - When all questions completed: call `onStepComplete(true)`.

- [ ] **Step 3: Test client build**
  Run: `npm run build:client`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add client/src/components/lesson/ListeningSection.jsx
  git commit -m "feat(listening): implement 1.5s auto-advance on listening comprehension questions"
  ```

---

### Task 7: Redesign Step 5 - Exercises (`ExerciseSection.jsx`) with 1.5s Auto-Advance

**Files:**
- Modify: `client/src/components/lesson/ExerciseSection.jsx`

**Interfaces:**
- Consumes: `exercises: Array<Exercise>`, `onStepComplete: (isComplete: boolean) => void`
- Produces: Multi-modal exercise runner (Matching, Word Order, Fill Blank, Error Correction, Translation) with 1.5s auto-advance on all question types.

- [ ] **Step 1: Implement 1.5s auto-advance on question verification**
  On checking answer or completing matching game:
  - If CORRECT: lock inputs, display green feedback, start 1500ms timer to advance `currentIndex`.
  - If WRONG: display red feedback, allow retrying, do not advance.
  - Timer cleanup on unmount or question change.
  - When last exercise finishes: call `onStepComplete(true)` and display completion summary.

- [ ] **Step 2: Test client build**
  Run: `npm run build:client`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 3: Commit**
  ```bash
  git add client/src/components/lesson/ExerciseSection.jsx
  git commit -m "feat(exercises): add 1.5s auto-advance mechanism across all exercise types"
  ```

---

### Task 8: Redesign Step 6 - Quiz (`QuizSection.jsx`) with 80% Passing Threshold & 1.5s Auto-Advance

**Files:**
- Modify: `client/src/components/lesson/QuizSection.jsx`

**Interfaces:**
- Consumes: `lessonId: number`, `quizzes: Array<QuizQuestion>`, `onQuizPassed: () => void`
- Produces: Final quiz with question-by-question flow, 1.5s auto-advance after selecting answer, 80% passing evaluation, review of wrong answers, and lesson completion triggering.

- [ ] **Step 1: Quiz question flow with 1.5s auto-advance**
  When learner selects an answer for the current question:
  - Save answer, highlight selection.
  - 1500ms timer automatically moves to next question (or prompts submission on the final question).

- [ ] **Step 2: Result screen with 80% passing evaluation**
  - Check `quizResult.passed` (backed by backend 80% threshold).
  - If passed ($\ge 80\%$): trigger `onQuizPassed()`, award XP, show victory celebration.
  - If failed ($< 80\%$): show "Chưa đạt 80%", button "Làm lại bài Quiz", filter "Chỉ xem các câu sai" with detailed explanations.

- [ ] **Step 3: Test client build**
  Run: `npm run build:client`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add client/src/components/lesson/QuizSection.jsx
  git commit -m "feat(quiz): enforce 80% pass threshold and 1.5s auto-advance in final quiz"
  ```

---

### Task 9: Integration Verification & Regression Testing

**Files:**
- Verify: Full stack (`server`, `client`, database, routing)

- [ ] **Step 1: Run complete backend test suite**
  Run: `npm run test:server`
  Expected: 19/19 tests PASS.

- [ ] **Step 2: Run frontend production build check**
  Run: `npm run build:client`
  Expected: Vite compiles cleanly with 0 errors.

- [ ] **Step 3: End-to-end flow check**
  Verify lesson detail loads cleanly with 6 steps, no Conversation step, sequential progression enforced, and 1.5s timer operates smoothly.
