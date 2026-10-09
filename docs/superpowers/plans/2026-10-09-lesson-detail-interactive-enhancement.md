# Lesson Detail Interactive Enhancement & 10 Question Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `LessonDetailPage` and its 7 learning step components: redesign the flashcard to eliminate empty space with rich two-sided learning cards and quick-jump word selector; implement 10 interactive question types across Grammar, Listening, Conversation, Exercises, and Quizzes; scale exercise/quiz counts to match CEFR levels (A1 to C2); and ensure robust feedback, scoring, and progress tracking.

**Architecture:** 
1. Redesign `FlashcardSection.jsx` into a balanced, rich 3D card (front: word, IPA, part-of-speech badge, audio button, quick hint, example; back: deep Vietnamese explanation, bilingual example, collocations/synonyms) plus an interactive word-selector carousel.
2. Upgrade curriculum generation in `server/prisma/curriculum/generators/helper.js` and level generators to generate the full target counts of grammar, listening, conversation, exercise, and quiz questions per CEFR level, followed by re-seeding the SQLite database.
3. Overhaul `ExerciseSection.jsx` to render all question types: Matching Pairs, Word Ordering, Text Input Fill-in, Meaning Selection, Error Correction, Translation, Listen & Choose.
4. Upgrade `GrammarSection.jsx`, `ListeningSection.jsx`, `ConversationSection.jsx`, and `QuizSection.jsx` with dedicated interactive question handling, audio playback, roleplay modes, and review of incorrect answers.

**Tech Stack:** React 18, Tailwind CSS, Lucide React icons, Web Speech API (TTS & STT), Axios, Express, Prisma ORM, SQLite.

**Spec:** `docs/superpowers/specs/2026-10-09-lesson-detail-interactive-enhancement-design.md`

## Global Constraints

- Preserve overall layout: Left Sidebar, Header, blue primary color, `rounded-3xl` cards, `slate-50` background, Lucide icons.
- No second database, no second API client, no second auth system.
- Web Speech API for genuine audio pronunciation; no mock or fake audio URLs.
- Never reveal answers before user submits/selects.
- Progress percentage and completion must be earned through real user interaction.

## Review Focus

1. **Card flip and audio sync:** Clicking the audio button on front or back must not inadvertently trigger card flip (`e.stopPropagation()`).
2. **Matching pairs state reset:** Changing to next exercise or resetting matching game must clear selected cards cleanly without phantom matches.
3. **Audio during listening and dialogue:** Stopping speech playback when navigating to another tab or step to prevent overlapping voices.
4. **Quiz scoring accuracy:** Quiz passing condition must strictly require $\ge 70\%$ to trigger lesson completion and XP award.
5. **No empty space / responsive viewport:** All 7 step components must fit comfortably on both mobile devices (375px+) and desktop screens without horizontal scroll.

---

### Task 1: Redesign Flashcard Component (`FlashcardSection.jsx`)

**Files:**
- Modify: `client/src/components/lesson/FlashcardSection.jsx`

**Interfaces:**
- Consumes: `vocabularies: Array<{ id, word, meaning, pronunciation, partOfSpeech, example, exampleMeaning, category, isFavorite, status }>`
- Produces: Enhanced Flashcard component with front/back rich layouts, audio player, favorite/review toggles, keyboard navigation, and quick-jump word carousel.

- [ ] **Step 1: Implement Rich Front-Side Card Layout**
  In `FlashcardSection.jsx`, replace the empty center with:
  - Top header: Part of speech badge (`noun`, `verb`, `adj`...), category badge, counter indicator (`1 / 15`), action buttons (Dictionary, Heart/Favorite, Bookmark/Review).
  - Main center: Large English word, IPA phonetic transcription font, large blue "Nghe phát âm" audio button with sound-wave icon.
  - Quick learning preview: Vietnamese meaning hint and short English example sentence with translation.
  - Bottom: 3D flip hint button with rotate icon.

- [ ] **Step 2: Implement Rich Back-Side Card Layout**
  In `FlashcardSection.jsx`, design the flipped state with:
  - Full Vietnamese definition with grammatical notes.
  - Contextual example card: English sentence in quotes + Vietnamese translation.
  - Usage notes & related terms (Synonyms, Collocations) if available.
  - "Chạm để quay lại mặt trước" return hint.

- [ ] **Step 3: Add Bottom Quick-Jump Word Selector Carousel**
  Under the navigation buttons, render a horizontal scrollable row of mini word chips:
  - Each chip displays word order (`1`, `2`...), word text, and status icon (learned, favorite ❤️).
  - Clicking any chip jumps directly to that word index.
  - Active chip has distinct blue highlighting.

- [ ] **Step 4: Add Keyboard Arrow Navigation**
  Add `useEffect` listener for `ArrowLeft` (previous word) and `ArrowRight` (next word) and `Space` (flip card).

- [ ] **Step 5: Test Flashcard rendering and build**
  Run: `npm run build:client`
  Expected: Successful compilation without errors.

- [ ] **Step 6: Commit**
  ```bash
  git add client/src/components/lesson/FlashcardSection.jsx
  git commit -m "feat(flashcard): redesign vocabulary card with rich dual-sided layout, audio, and quick word selector"
  ```

---

### Task 2: Curriculum Generator Expansion for CEFR Question Quantities (`server/prisma/curriculum/`)

**Files:**
- Modify: `server/prisma/curriculum/generators/helper.js`
- Modify: `server/prisma/curriculum/generators/genA1.js`
- Modify: `server/prisma/curriculum/generators/genA2.js`
- Modify: `server/prisma/curriculum/generators/genB1.js`
- Modify: `server/prisma/curriculum/generators/genB2.js`
- Modify: `server/prisma/curriculum/generators/genC1.js`
- Modify: `server/prisma/curriculum/generators/genC2.js`
- Run: `node server/prisma/curriculum/generateAll.js`
- Run: `node server/prisma/seed.js`

**Interfaces:**
- Produces: 180 lessons seeded with target question counts:
  - A1: 10–12 vocab, 5 grammar exercises, 5 listening questions, 5 dialogue turns, 10 quiz questions.
  - A2: 12–15 vocab, 6–8 grammar exercises, 5–8 listening questions, 5 dialogue turns, 10–12 quiz questions.
  - B1: 15–18 vocab, 8 grammar exercises, 8 listening questions, 6 dialogue turns, 12–15 quiz questions.
  - B2: 15–20 vocab, 8–10 grammar exercises, 8–10 listening questions, 6–8 dialogue turns, 15 quiz questions.
  - C1: 15–20 vocab, 10 grammar exercises, 10 listening questions, 8 dialogue turns, 15–20 quiz questions.
  - C2: 15–20 vocab, 10 grammar exercises, 10 listening questions, 8 dialogue turns, 20 quiz questions.

- [ ] **Step 1: Enhance `helper.js` to support diverse question generation**
  Add generator helpers for:
  - Matching pairs (`MATCHING`): pairs of English words and Vietnamese meanings.
  - Word order (`WORD_ORDER`): scrambled words.
  - Fill in blank (`FILL_BLANK` & `FILL_BLANK_INPUT`).
  - Error correction (`ERROR_CORRECTION`): sentence with an error, options for correct word.
  - Translation (`TRANSLATION`): Vietnamese prompt with English word blocks.
  - Listen and choose (`LISTEN_CHOOSE`): audio prompt with text choices.
  - Situational conversation questions (`SITUATION_RESPONSE`).
  - Scaled quiz questions: generate 10 to 20 quiz items per lesson based on `level`.

- [ ] **Step 2: Update Level Generators (genA1 to genC2)**
  Configure each generator with appropriate question counts matching the CEFR quota table.

- [ ] **Step 3: Re-generate all curriculum files**
  Run: `node server/prisma/curriculum/generateAll.js`
  Expected: 180 lessons generated with expanded exercises and quizzes.

- [ ] **Step 4: Run database seeder**
  Run: `node server/prisma/seed.js`
  Expected: 180 lessons seeded into SQLite database with updated exercise and quiz counts.

- [ ] **Step 5: Run backend test suite to verify data integrity**
  Run: `npm run test:server`
  Expected: All 19 tests PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add server/prisma/curriculum/ server/prisma/seed.js
  git commit -m "feat(curriculum): expand exercises and quiz question counts tailored to CEFR levels A1-C2"
  ```

---

### Task 3: Interactive Multi-Modal Exercise Component (`ExerciseSection.jsx`)

**Files:**
- Modify: `client/src/components/lesson/ExerciseSection.jsx`

**Interfaces:**
- Consumes: `exercises: Array<{ id, type, question, options, correctAnswer, explanation }>`
- Produces: Interactive exercise runner supporting:
  1. `MATCHING`: 2-column interactive clickable pairs game with match animation.
  2. `WORD_ORDER`: Clickable word chips to arrange sentence with reset.
  3. `FILL_BLANK`: Multiple choice or text input fill in the blank.
  4. `MULTIPLE_CHOICE`: 4-choice question with instant feedback.
  5. `ERROR_CORRECTION`: Sentence with error highlight and replacement choice.
  6. `TRANSLATION`: Vietnamese sentence to English word blocks.
  7. `LISTEN_CHOOSE`: Audio listen button + select correct word.

- [ ] **Step 1: Build Matching Pairs Game Sub-component**
  Render left column (English words) and right column (Vietnamese meanings).
  - Selected left card highlights blue.
  - Selected right card checks match.
  - Correct match turns green and locks.
  - Incorrect match flashes red and resets selection.
  - Win state when all pairs matched.

- [ ] **Step 2: Build Word Order Sub-component**
  Render bank of available word chips and answer slot.
  - Clicking available chip moves it to answer line.
  - Clicking answer chip returns it to available bank.
  - "Làm lại" button resets all chips.

- [ ] **Step 3: Build Fill-in & Error Correction Sub-components**
  - Render sentence with input or error selection.
  - Check answer button with immediate positive/negative feedback.

- [ ] **Step 4: Build Listen & Choose Sub-component**
  - Render big speaker button calling `speakText()`.
  - 4 answer options with instant check and explanation.

- [ ] **Step 5: Add Overall Exercise Progress Bar & Score Summary**
  - Top header tracking `Câu X / Y` and score `Z đúng`.
  - Final summary card when all exercises completed with percentage and button to re-try or proceed to Quiz.

- [ ] **Step 6: Test ExerciseSection build**
  Run: `npm run build:client`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 7: Commit**
  ```bash
  git add client/src/components/lesson/ExerciseSection.jsx
  git commit -m "feat(exercises): add interactive matching, word order, listening, and error correction exercises"
  ```

---

### Task 4: Upgrade Grammar, Listening, Conversation, and Quiz Components

**Files:**
- Modify: `client/src/components/lesson/GrammarSection.jsx`
- Modify: `client/src/components/lesson/ListeningSection.jsx`
- Modify: `client/src/components/lesson/ConversationSection.jsx`
- Modify: `client/src/components/lesson/QuizSection.jsx`

**Interfaces:**
- `GrammarSection`: Formula card + Interactive grammar practice check questions.
- `ListeningSection`: Native audio player (Web Speech API) + toggleable transcript + listening comprehension questions.
- `ConversationSection`: Roleplay dialogue + per-line audio + Situational response challenge.
- `QuizSection`: Timed/scored comprehensive test + results overview + review incorrect answers modal.

- [ ] **Step 1: Upgrade `GrammarSection.jsx`**
  - Top: Formula box and bilingual examples.
  - Bottom: Interactive grammar practice questions with instant check and explanations.
  - Audio button on grammar example sentences.

- [ ] **Step 2: Upgrade `ListeningSection.jsx`**
  - Audio player bar with Play, Pause, Replay, and speech rate control.
  - Hidden transcript challenge: prompt user to listen first before revealing transcript.
  - 5 to 10 listening comprehension questions with detailed explanations.

- [ ] **Step 3: Upgrade `ConversationSection.jsx`**
  - Dialogue turns with character avatars, bilingual toggle, and line-by-line audio.
  - Roleplay mode: mute one character so learner can speak that part.
  - Situational response question at the end: select the best natural reply in context.

- [ ] **Step 4: Upgrade `QuizSection.jsx`**
  - Question navigation with progress bar.
  - Instant selection with radio options.
  - Result screen with circular score, pass badge ($\ge 70\%$), and "Xem lại câu trả lời sai" with explanations.
  - Trigger `onQuizPassed` callback when passed.

- [ ] **Step 5: Test and build client**
  Run: `npm run build:client`
  Expected: Successful compilation with zero errors.

- [ ] **Step 6: Commit**
  ```bash
  git add client/src/components/lesson/GrammarSection.jsx client/src/components/lesson/ListeningSection.jsx client/src/components/lesson/ConversationSection.jsx client/src/components/lesson/QuizSection.jsx
  git commit -m "feat(lesson-steps): upgrade grammar, listening, conversation, and quiz sections with interactive features"
  ```

---

### Task 5: Integration Verification & Regression Testing

**Files:**
- Verify: Full stack (`server`, `client`, database, routing)

- [ ] **Step 1: Run complete backend test suite**
  Run: `npm run test:server`
  Expected: 19/19 tests PASS.

- [ ] **Step 2: Verify production frontend build**
  Run: `npm run build:client`
  Expected: Vite compiles successfully with 0 errors.

- [ ] **Step 3: End-to-end sanity check of all 7 learning steps**
  Verify lesson detail endpoint returns all 7 modules populated with rich content.
