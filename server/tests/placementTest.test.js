// placementTest.test.js - Comprehensive Verification Suite for CEFR Placement Test (25 Questions)
// Tests:
// 1. Structure: strictly 25 questions (15 fill-in + 10 listening)
// 2. Progression: A1 -> C2 difficulty order without leaking levelTarget in client payload
// 3. Audio text presence for all 10 listening questions
// 4. "Học từ đầu" (skip test): sets level A1 with placementStatus 'UNASSESSED'
// 5. Grading scale: 4 pts/question, 100 pts maximum
// 6. Sequential Tier Assessment:
//    - Failing A1 (<75%) forces recommendation of A1
//    - Passing A1 & A2 (>=75%) but failing B1 forces recommendation of A2
//    - Passing all tiers up to C2 awards C2
// 7. Profile synchronization: sets level, placementStatus, and placementScore in database

process.env.NODE_ENV = 'test';
process.env.PORT = '5011';

const app = require('../src/app');
const prisma = require('../src/db');
const placementData = require('../prisma/curriculum/placementQuestions');

async function runTests() {
  console.log('=== Starting E4B Placement Test Verification Suite ===\n');
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

  const server = app.listen(5011);
  const BASE_URL = 'http://localhost:5011/api';

  try {
    // -------------------------------------------------------------------------
    // Setup: Login student
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

    // -------------------------------------------------------------------------
    // Test 1: GET /api/placement-test Structure & Content
    // -------------------------------------------------------------------------
    console.log('\n--- Test 1: Placement Test Structure & Quotas ---');
    const testRes = await fetch(`${BASE_URL}/placement-test`);
    const testData = await testRes.json();
    assert(testRes.status === 200, 'GET /api/placement-test returns 200 OK');
    assert(testData.totalQuestions === 25, 'Total questions is strictly 25');
    assert(Array.isArray(testData.questions) && testData.questions.length === 25, 'Returns array of 25 questions');

    const fillInQuestions = testData.questions.filter((q) => q.partNumber === 1);
    const listeningQuestions = testData.questions.filter((q) => q.partNumber === 2);
    assert(fillInQuestions.length === 15, 'Part 1 (Fill-in) has exactly 15 questions');
    assert(listeningQuestions.length === 10, 'Part 2 (Listening) has exactly 10 questions');

    // Verify all listening questions have audioText
    const allListeningHaveAudio = listeningQuestions.every((q) => !!q.audioText && q.audioText.length >= 10);
    assert(allListeningHaveAudio, 'All 10 listening questions contain valid audioText for speech synthesis');

    // Verify client payload does NOT leak correctAnswer or levelTarget
    const hasNoLeaks = testData.questions.every((q) => !q.correctAnswer && !q.levelTarget && !q.explanation);
    assert(hasNoLeaks, 'Client payload withholds correctAnswer, levelTarget, and explanation');

    // Verify 4 options per question
    const allHave4Options = testData.questions.every((q) => Array.isArray(q.options) && q.options.length === 4);
    assert(allHave4Options, 'All 25 questions contain exactly 4 options (A, B, C, D)');

    // -------------------------------------------------------------------------
    // Test 2: "Học từ đầu" (POST /api/placement-test/skip)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Skip Placement Test ("Học từ đầu") ---');
    const skipRes = await fetch(`${BASE_URL}/placement-test/skip`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const skipData = await skipRes.json();
    assert(skipRes.status === 200 && skipData.success === true, 'POST /api/placement-test/skip returns 200 OK');
    assert(skipData.level === 'A1', 'Level is set to A1');
    assert(skipData.placementStatus === 'UNASSESSED', 'Placement status is marked UNASSESSED');

    // Verify DB user record
    const userInDb = await prisma.$queryRawUnsafe(
      'SELECT level, placementStatus, placementScore FROM User WHERE id = ?',
      userId
    );
    assert(userInDb[0].level === 'A1', 'Database user level updated to A1');
    assert(userInDb[0].placementStatus === 'UNASSESSED', 'Database placementStatus is UNASSESSED');

    // -------------------------------------------------------------------------
    // Test 3: Sequential Tier Assessment - Failing A1 forces A1 recommendation
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Sequential Progression - Failed A1 (<75%) forces A1 ---');
    // Simulate answering: Fail A1 questions (correct 1/4), but correctly answer all C1/C2 questions
    const answersFailA1 = {};
    placementData.forEach((q) => {
      const qId = `pq_${q.orderNumber}`;
      if (q.levelTarget === 'A1' && q.orderNumber !== 1) {
        answersFailA1[qId] = 'WRONG_OPTION';
      } else {
        answersFailA1[qId] = q.correctAnswer;
      }
    });

    const submitFailA1Res = await fetch(`${BASE_URL}/placement-test/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers: answersFailA1 }),
    });
    const failA1Data = await submitFailA1Res.json();
    assert(submitFailA1Res.status === 200, 'Submit test returns 200');
    assert(failA1Data.tierBreakdown.A1.passed === false, 'A1 tier is flagged as NOT passed (<75%)');
    assert(failA1Data.recommendedLevel === 'A1', 'Recommended level is A1 despite correct answers in higher tiers');
    assert(failA1Data.assignedLevel === 'A1', 'Assigned level is strictly A1');

    // -------------------------------------------------------------------------
    // Test 4: Sequential Tier Assessment - Passed A1 & A2 (>=75%) but failed B1
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: Sequential Progression - Passed A1 & A2, Failed B1 forces A2 ---');
    const answersReachA2 = {};
    placementData.forEach((q) => {
      const qId = `pq_${q.orderNumber}`;
      if (q.levelTarget === 'A1' || q.levelTarget === 'A2') {
        answersReachA2[qId] = q.correctAnswer; // 100% on A1 and A2
      } else {
        answersReachA2[qId] = 'WRONG_OPTION'; // Fail B1 and above
      }
    });

    const submitReachA2Res = await fetch(`${BASE_URL}/placement-test/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers: answersReachA2 }),
    });
    const reachA2Data = await submitReachA2Res.json();
    assert(reachA2Data.tierBreakdown.A1.passed === true, 'A1 tier passed (100% >= 75%)');
    assert(reachA2Data.tierBreakdown.A2.passed === true, 'A2 tier passed (100% >= 75%)');
    assert(reachA2Data.tierBreakdown.B1.passed === false, 'B1 tier failed (0% < 75%)');
    assert(reachA2Data.recommendedLevel === 'A2', 'Recommended level is A2 (ready to progress to B1)');

    // -------------------------------------------------------------------------
    // Test 5: Full Mastery - Passed all tiers up to C2
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: Full Mastery - Passed up to C2 awards C2 ---');
    const perfectAnswers = {};
    placementData.forEach((q) => {
      const qId = `pq_${q.orderNumber}`;
      perfectAnswers[qId] = q.correctAnswer;
    });

    const submitC2Res = await fetch(`${BASE_URL}/placement-test/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers: perfectAnswers }),
    });
    const c2Data = await submitC2Res.json();
    assert(c2Data.correctCount === 25, 'All 25 questions answered correctly');
    assert(c2Data.score === 100, 'Score is 100/100 points');
    assert(c2Data.percentage === 100, 'Percentage is 100%');
    assert(c2Data.partScores.fillBlank.score === 60, 'Part 1 score is 60/60 pts');
    assert(c2Data.partScores.listening.score === 40, 'Part 2 score is 40/40 pts');
    assert(c2Data.recommendedLevel === 'C2', 'Recommended level is C2');
    assert(c2Data.details.length === 25, 'Returns detailed review for all 25 questions');

    // Verify DB user record updated to C2 with ASSESSED status
    const userC2Db = await prisma.$queryRawUnsafe(
      'SELECT level, placementStatus, placementScore FROM User WHERE id = ?',
      userId
    );
    assert(userC2Db[0].level === 'C2', 'Database user level updated to C2');
    assert(userC2Db[0].placementStatus === 'ASSESSED', 'Database placementStatus is ASSESSED');
    assert(userC2Db[0].placementScore === 100, 'Database placementScore is 100');
  } catch (err) {
    console.error('\nUnexpected test failure:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exitCode = 1;
  }
}

runTests();
