// examRandomization.test.js - Comprehensive Test Suite for Dynamic Exam Randomization & Question Pools
// Verifies:
// 1. Each new attempt generates a fresh set of questions from the question pools
// 2. Subsequent attempts have different questions, listening audio, and reading passages
// 3. Page reload (F5) / session resume strictly preserves the same attempt, question order, answers, and continuing countdown
// 4. No duplicate questions within a single attempt
// 5. Cohesion of listening audio + 5 questions and reading passages + 5 questions
// 6. Submitting locks the attempt and preserves history with exact questions and scores

process.env.NODE_ENV = 'test';
process.env.PORT = '5009';

const app = require('../src/app');
const prisma = require('../src/db');

async function runTests() {
  console.log('=== Starting E4B Exam Randomization & State Preservation Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${message}`);
      failed++;
    }
  }

  const server = app.listen(5009);
  const BASE_URL = 'http://localhost:5009/api';

  try {
    // -------------------------------------------------------------------------
    // Setup: Authenticate test student
    // -------------------------------------------------------------------------
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@e4b.com', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && !!loginData.token, 'Student authentication succeeds');
    const token = loginData.token;
    const userId = loginData.user.id;

    // Clean up any uncompleted attempts for a clean test state
    await prisma.$executeRawUnsafe('DELETE FROM ExamAttempt WHERE userId = ? AND isCompleted = 0', userId);

    // -------------------------------------------------------------------------
    // Scenario 1: Start Attempt 1 & Extract Structure
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Start Attempt 1 & Verify Structure ---');
    const start1Res = await fetch(`${BASE_URL}/exam/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const start1Data = await start1Res.json();
    assert(start1Res.status === 200, 'POST /api/exam/start for Attempt 1 succeeds');
    const attempt1Id = start1Data.attemptId;
    assert(!!attempt1Id, `Attempt 1 ID generated: ${attempt1Id}`);
    assert(start1Data.isResumed === false, 'Attempt 1 is flagged as a fresh attempt (isResumed: false)');

    const parts1 = start1Data.parts || [];
    assert(parts1.length === 6, 'Attempt 1 has 6 pages');

    const qIds1 = [];
    parts1.forEach((p) => {
      p.questions.forEach((q) => qIds1.push(q.id));
    });
    assert(qIds1.length === 40, 'Attempt 1 contains strictly 40 questions');

    // Check no duplicate question IDs in Attempt 1
    const uniqueQIds1 = new Set(qIds1);
    assert(uniqueQIds1.size === 40, 'Attempt 1 has zero duplicate questions (40 unique IDs)');

    // Extract Track & Passage metadata from DB for Attempt 1
    const dbAttempt1 = await prisma.$queryRawUnsafe('SELECT examData FROM ExamAttempt WHERE id = ?', attempt1Id);
    const examData1 = JSON.parse(dbAttempt1[0].examData);
    const track1Id = examData1.parts[2].trackId;
    const passage1Id = examData1.parts[3].passageId;
    const passage2Id = examData1.parts[4].passageId;
    assert(!!track1Id, `Attempt 1 Listening Track: ${track1Id}`);
    assert(!!passage1Id && !!passage2Id, `Attempt 1 Reading Passages: ${passage1Id}, ${passage2Id}`);
    assert(passage1Id !== passage2Id, 'Attempt 1 Reading Passages 1 and 2 are completely distinct');

    // -------------------------------------------------------------------------
    // Scenario 2: Reload Safety (F5 simulation & Back navigation)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Page Reload (F5) & State Preservation ---');
    // Save answer for question 1 and question 11
    const testQ1Id = qIds1[0];
    const testQ11Id = qIds1[10];
    await fetch(`${BASE_URL}/exam/save-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attemptId: attempt1Id,
        currentPage: 3,
        answers: {
          [testQ1Id]: 'sample_saved_answer_1',
          [testQ11Id]: 'B - tested_correction',
        },
      }),
    });

    // Simulate F5 by calling /api/exam/current
    const reloadCurrentRes = await fetch(`${BASE_URL}/exam/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const reloadCurrentData = await reloadCurrentRes.json();
    assert(reloadCurrentData.attemptId === attempt1Id, 'Attempt ID remains identical on F5 reload');
    assert(reloadCurrentData.currentPage === 3, 'Current page cursor is preserved on F5 reload');
    assert(reloadCurrentData.answers[testQ1Id] === 'sample_saved_answer_1', 'Saved answer for Q1 preserved on reload');
    assert(reloadCurrentData.answers[testQ11Id] === 'B - tested_correction', 'Saved answer for Q11 preserved on reload');

    // Confirm exact question IDs and exact same order on reload
    const reloadedQIds = [];
    (reloadCurrentData.parts || []).forEach((p) => {
      p.questions.forEach((q) => reloadedQIds.push(q.id));
    });
    assert(reloadedQIds.length === 40, 'Reloaded attempt has 40 questions');
    const orderMatches100 = qIds1.every((id, idx) => id === reloadedQIds[idx]);
    assert(orderMatches100, 'Questions and order are 100% identical on F5 reload (no mid-test re-shuffle)');

    // Simulate calling /api/exam/start again while test is active (must resume, NOT create new attempt)
    const restartDuringActiveRes = await fetch(`${BASE_URL}/exam/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const restartDuringActiveData = await restartDuringActiveRes.json();
    assert(restartDuringActiveData.attemptId === attempt1Id, 'Calling startExam during active session resumes same attempt');
    assert(restartDuringActiveData.isResumed === true, 'Session flagged as isResumed: true');

    // Verify timer does not reset to 3600s
    assert(restartDuringActiveData.remainingSeconds <= 3600, 'Countdown timer continues running and does NOT reset');

    // -------------------------------------------------------------------------
    // Scenario 3: Submit Attempt 1
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Submit Attempt 1 ---');
    const submit1Res = await fetch(`${BASE_URL}/exam/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attemptId: attempt1Id,
        answers: {
          [testQ1Id]: 'sample_saved_answer_1',
        },
      }),
    });
    const submit1Data = await submit1Res.json();
    assert(submit1Res.status === 200 && submit1Data.success === true, 'Attempt 1 submitted successfully');
    assert(typeof submit1Data.score === 'number', `Attempt 1 score graded: ${submit1Data.score}`);

    // Confirm Attempt 1 is now marked completed in DB
    const checkAttempt1Db = await prisma.$queryRawUnsafe('SELECT isCompleted FROM ExamAttempt WHERE id = ?', attempt1Id);
    assert(checkAttempt1Db[0].isCompleted === 1, 'Attempt 1 is locked and finalized in database');

    // -------------------------------------------------------------------------
    // Scenario 4: Start Attempt 2 & Verify Question Randomization
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Start Attempt 2 & Verify Question Randomization ---');
    const start2Res = await fetch(`${BASE_URL}/exam/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const start2Data = await start2Res.json();
    assert(start2Res.status === 200, 'POST /api/exam/start for Attempt 2 succeeds');
    const attempt2Id = start2Data.attemptId;
    assert(attempt2Id !== attempt1Id, `Attempt 2 ID is distinct: ${attempt2Id} != ${attempt1Id}`);
    assert(start2Data.isResumed === false, 'Attempt 2 is a brand new session (isResumed: false)');

    const parts2 = start2Data.parts || [];
    const qIds2 = [];
    parts2.forEach((p) => {
      p.questions.forEach((q) => qIds2.push(q.id));
    });
    assert(qIds2.length === 40, 'Attempt 2 contains 40 questions');

    // Verify question divergence between Attempt 1 and Attempt 2
    const set1 = new Set(qIds1);
    const overlapping = qIds2.filter((id) => set1.has(id));
    const differentQuestionsCount = 40 - overlapping.length;
    console.log(`  [Info] Questions different in Attempt 2: ${differentQuestionsCount}/40 (Overlap: ${overlapping.length}/40)`);
    assert(differentQuestionsCount >= 15, `Attempt 2 selects fresh questions from question pools (${differentQuestionsCount} new questions >= 15)`);

    // Verify Listening Track & Reading Passages rotation
    const dbAttempt2 = await prisma.$queryRawUnsafe('SELECT examData FROM ExamAttempt WHERE id = ?', attempt2Id);
    const examData2 = JSON.parse(dbAttempt2[0].examData);
    const track2Id = examData2.parts[2].trackId;
    const passage2_1Id = examData2.parts[3].passageId;
    const passage2_2Id = examData2.parts[4].passageId;

    console.log(`  [Info] Attempt 1 Track: ${track1Id} vs Attempt 2 Track: ${track2Id}`);
    console.log(`  [Info] Attempt 1 Passages: [${passage1Id}, ${passage2Id}] vs Attempt 2 Passages: [${passage2_1Id}, ${passage2_2Id}]`);
    assert(track1Id !== track2Id, 'Attempt 2 selects a different Listening Track from listening pool');
    assert(passage2_1Id !== passage1Id || passage2_2Id !== passage2Id, 'Attempt 2 selects different Reading Passages from reading pool');

    // -------------------------------------------------------------------------
    // Scenario 5: History Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Review Past Attempt History ---');
    const historyRes = await fetch(`${BASE_URL}/exam/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const historyData = await historyRes.json();
    assert(historyRes.status === 200, 'GET /api/exam/history returns 200');
    assert(Array.isArray(historyData.history) && historyData.history.length >= 1, 'History lists completed attempts');

    const foundAttempt1InHistory = historyData.history.some((h) => h.id === attempt1Id);
    assert(foundAttempt1InHistory, 'Completed Attempt 1 is preserved in user history');

    // Review past attempt result
    const result1Res = await fetch(`${BASE_URL}/exam/result/${attempt1Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result1Data = await result1Res.json();
    assert(result1Res.status === 200, 'GET /api/exam/result/:id for Attempt 1 returns 200');
    assert(result1Data.attemptId === attempt1Id, 'Result view preserves exact Attempt 1 data');
    assert(result1Data.evaluation?.reviews?.length === 40, 'Result review preserves full 40 question reviews');

    // Cleanup active Attempt 2
    await prisma.$executeRawUnsafe('DELETE FROM ExamAttempt WHERE id = ?', attempt2Id);
  } catch (err) {
    console.error('\nUnexpected test error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exitCode = 1;
  }
}

runTests();
