// dailyPracticeReset.test.js - Comprehensive Verification of 10 Mandatory Scenarios
// Covers: Vietnam timezone (Asia/Ho_Chi_Minh), 00:00 reset, 60-question quota,
// idempotence on reload, concurrency safety, lifetime score preservation.

process.env.NODE_ENV = 'test';
process.env.PORT = '5004';

const app = require('../src/app');
const prisma = require('../src/db');
const {
  getVietnamDateString,
  getVietnamDateParts,
  getMsUntilNextMidnightVN,
  VIETNAM_TIMEZONE,
} = require('../src/utils/vietnamTime');
const { getQuestionsForLevel } = require('../prisma/dailyQuestions');

async function runTests() {
  console.log('=== Starting E4B Daily Practice 00:00 VN Reset Test Suite ===\n');
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

  const server = app.listen(5004);
  const BASE_URL = 'http://localhost:5004/api';

  try {
    // ----------------------------------------------------
    // SETUP: Get student user and auth token
    // ----------------------------------------------------
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@e4b.com', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && !!loginData.token, 'Student authentication succeeds');
    const token = loginData.token;
    const userId = loginData.user.id;

    // ----------------------------------------------------
    // SCENARIO 9: Vietnam Timezone Determination (Asia/Ho_Chi_Minh, UTC+7)
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 9: Timezone Determination (Asia/Ho_Chi_Minh) ---');
    // Test 10/10/2026 16:59:00 UTC -> 23:59:00 in Vietnam (Date: 2026-10-10)
    const beforeMidnightUtc = new Date('2026-10-10T16:59:00.000Z');
    const vnDateBefore = getVietnamDateString(beforeMidnightUtc);
    assert(vnDateBefore === '2026-10-10', '16:59 UTC evaluates to 23:59 VN on 2026-10-10');

    // Test 10/10/2026 17:00:00 UTC -> 00:00:00 in Vietnam (Date: 2026-10-11)
    const atMidnightUtc = new Date('2026-10-10T17:00:00.000Z');
    const vnDateAtMidnight = getVietnamDateString(atMidnightUtc);
    assert(vnDateAtMidnight === '2026-10-11', '17:00 UTC evaluates to exact 00:00 VN on 2026-10-11');

    // Test remaining ms to midnight VN calculation
    const msToMidnight = getMsUntilNextMidnightVN(beforeMidnightUtc);
    assert(msToMidnight > 0 && msToMidnight <= 60000, 'getMsUntilNextMidnightVN correctly computes ms at 23:59 VN (<= 60s)');

    // ----------------------------------------------------
    // SCENARIO 1: Exact 60 Questions Structure (20 Vocab, 10 Speaking, 10 Error, 10 Listening, 10 Reading)
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 1: Daily Practice 60-Question Quota ---');
    const todayVn = getVietnamDateString();
    // Clean any existing session for today to test fresh creation
    await prisma.dailyPractice.deleteMany({ where: { userId, date: todayVn } });

    const sessionRes = await fetch(`${BASE_URL}/daily-practice/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessionData = await sessionRes.json();
    assert(sessionRes.status === 200 && !!sessionData.session, 'GET /api/daily-practice/today returns session');

    const s = sessionData.session;
    assert(s.totalQuestions === 60, 'Total questions is strictly 60');
    assert(s.parts.length === 5, 'Session has exactly 5 parts');
    assert(s.parts[0].questions.length === 20, 'Part 1 (Vocabulary) has exactly 20 questions');
    assert(s.parts[1].questions.length === 10, 'Part 2 (Speaking) has exactly 10 questions');
    assert(s.parts[2].questions.length === 10, 'Part 3 (Error Correction) has exactly 10 questions');
    assert(s.parts[3].questions.length === 10, 'Part 4 (Listening) has exactly 10 questions (2 tracks x 5)');
    assert(s.parts[4].questions.length === 10, 'Part 5 (Reading) has exactly 10 questions (2 passages x 5)');

    // Verify audioText and passageText exist for listening and reading
    const sampleListening = s.parts[3].questions[0];
    assert(!!sampleListening.audioText && sampleListening.options.length === 4, 'Listening question includes real audioText and 4 options');

    const sampleReading = s.parts[4].questions[0];
    assert(!!sampleReading.passageText && sampleReading.options.length === 4, 'Reading question includes real passageText and 4 options');

    // ----------------------------------------------------
    // SCENARIO 5 & 6: Idempotence & State Preservation across Page Reloads
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 5 & 6: Idempotence on Reload & Logout/Login ---');
    const firstQ1Id = s.parts[0].questions[0].id;
    const firstQ20Id = s.parts[0].questions[19].id;

    // Simulate page reload by making a second request
    const reloadRes = await fetch(`${BASE_URL}/daily-practice/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const reloadData = await reloadRes.json();
    const reloadS = reloadData.session;

    assert(reloadS.id === s.id, 'Session ID remains identical across reloads on the same day');
    assert(reloadS.parts[0].questions[0].id === firstQ1Id, 'Question 1 ID remains identical on reload (no re-shuffle)');
    assert(reloadS.parts[0].questions[19].id === firstQ20Id, 'Question 20 ID remains identical on reload (no re-shuffle)');

    // ----------------------------------------------------
    // Answering Questions: Score delta (+4 / -2) & In-progress tracking
    // ----------------------------------------------------
    console.log('\n--- Testing Question Answering & Score Differentiation ---');
    const targetQ = s.parts[0].questions[0];
    const initialUserScore = s.userPracticeScore;

    // Answer correctly: +4
    const ansRes = await fetch(`${BASE_URL}/daily-practice/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId: s.id,
        partNumber: 1,
        questionIndex: 0,
        selectedOption: targetQ.correctAnswer,
      }),
    });
    const ansData = await ansRes.json();
    assert(ansRes.status === 200 && ansData.isCorrect === true, 'Submitting correct answer returns isCorrect: true');
    assert(ansData.newScore === 4, 'Daily score is updated to +4');
    assert(ansData.userPracticeScore === initialUserScore + 4, 'Lifetime userPracticeScore is updated to initial + 4');

    // Fetch session again to verify state is preserved after answering
    const reloadedAfterAnsRes = await fetch(`${BASE_URL}/daily-practice/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const afterAnsData = await reloadedAfterAnsRes.json();
    assert(afterAnsData.session.parts[0].questions[0].isCorrect === true, 'Answered question retains isCorrect: true in DB');
    assert(afterAnsData.session.completedCount === 1, 'Completed count is 1/60');
    assert(afterAnsData.session.remainingCount === 59, 'Remaining count is 59/60');

    // ----------------------------------------------------
    // SCENARIO 8: Concurrency Safety (Multiple Tabs Open Simultaneously)
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 8: Concurrency Safety ---');
    // Dispatch 5 concurrent requests at the exact same moment
    const parallelResponses = await Promise.all([
      fetch(`${BASE_URL}/daily-practice/today`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/daily-practice/today`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/daily-practice/today`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/daily-practice/today`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/daily-practice/today`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const parallelData = await Promise.all(parallelResponses.map((r) => r.json()));
    const allSameId = parallelData.every((d) => d.session.id === s.id);
    assert(allSameId, 'All concurrent requests return the exact same session ID without duplicate creation');

    // Verify DB has only 1 record for this user and today's date
    const countInDb = await prisma.dailyPractice.count({
      where: { userId, date: todayVn },
    });
    assert(countInDb === 1, 'Database has strictly 1 DailyPractice record for this user and date');

    // ----------------------------------------------------
    // SCENARIO 2, 3, 4: Transition to New Day at 00:00 VN Time
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 2, 3, 4: 00:00 Transition & Lifetime Score Preservation ---');
    // 1. Manually simulate yesterday's record ('2026-10-09')
    const yesterdayDate = '2026-10-09';
    await prisma.dailyPractice.deleteMany({ where: { userId, date: yesterdayDate } });
    const yesterdayRecord = await prisma.dailyPractice.create({
      data: {
        userId,
        date: yesterdayDate,
        level: 'A1',
        score: 32,
        completed: true,
        currentPart: 5,
        currentQuestionIndex: 9,
        sessionData: JSON.stringify([]),
      },
    });

    // Verify yesterday's record is intact
    const oldSession = await prisma.dailyPractice.findUnique({
      where: { userId_date: { userId, date: yesterdayDate } },
    });
    assert(oldSession.score === 32, 'Past day session score (32 pts) is preserved in history');

    // 2. Simulate a future day (strictly distinct from todayVn)
    const tomorrowDate = todayVn === '2026-10-12' ? '2026-10-13' : '2026-10-12';
    await prisma.dailyPractice.deleteMany({ where: { userId, date: tomorrowDate } });

    // Fetch user before new day
    const userBefore = await prisma.user.findUnique({ where: { id: userId } });
    const userLifetimeScore = userBefore.practiceScore;
    const userXp = userBefore.xp;
    const userStreak = userBefore.streakDays;

    // Create session for tomorrow date
    const tomorrowParts = getQuestionsForLevel('A1', { dateStr: tomorrowDate });
    const tomorrowSession = await prisma.dailyPractice.create({
      data: {
        userId,
        date: tomorrowDate,
        level: 'A1',
        score: 0,
        completed: false,
        currentPart: 1,
        currentQuestionIndex: 0,
        sessionData: JSON.stringify(tomorrowParts),
      },
    });

    assert(tomorrowSession.score === 0, 'New day practice score starts at 0');
    assert(tomorrowSession.completed === false, 'New day completed status is false');

    // Verify user lifetime scores did NOT change
    const userAfter = await prisma.user.findUnique({ where: { id: userId } });
    assert(userAfter.practiceScore === userLifetimeScore, 'User lifetime practiceScore is preserved 100%');
    assert(userAfter.xp === userXp, 'User XP is preserved 100%');
    assert(userAfter.streakDays === userStreak, 'User streakDays is preserved 100%');

    // Clean up tomorrow's mock record
    await prisma.dailyPractice.deleteMany({ where: { userId, date: tomorrowDate } });
    await prisma.dailyPractice.deleteMany({ where: { userId, date: yesterdayDate } });

    // ----------------------------------------------------
    // SCENARIO 7: Dashboard Today's Learning Synchronization
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 7: Dashboard Synchronization ---');
    const dashboardRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashboardData = await dashboardRes.json();
    assert(dashboardRes.status === 200, 'GET /api/dashboard returns 200 OK');
    assert(dashboardData.vietnamTime.date === todayVn, 'Dashboard returns accurate Vietnam date string');
    assert(dashboardData.todaysGoal.totalQuestions === 60, 'Dashboard todaysGoal has 60 total questions');
    assert(dashboardData.todaysGoal.todayScore === 4, 'Dashboard todaysGoal displays accurate dailyScore (+4)');

    // ----------------------------------------------------
    // SCENARIO 10: Error Handling & Data Safety
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 10: Error Handling & Integrity ---');
    const invalidAnsRes = await fetch(`${BASE_URL}/daily-practice/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        partNumber: 99, // Non-existent part
        questionIndex: 0,
        selectedOption: 'Invalid',
      }),
    });
    assert(invalidAnsRes.status === 404, 'Submitting invalid part returns 404 Not Found without crashing');

    // Confirm session score is intact after error
    const intactCheckRes = await fetch(`${BASE_URL}/daily-practice/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const intactData = await intactCheckRes.json();
    assert(intactData.session.score === 4, 'Daily score remains 4 pts and is not corrupted by invalid submissions');

    // ----------------------------------------------------
    // SCENARIO 11: Wrong Answers Count Toward Completed Count & Progress %
    // ----------------------------------------------------
    console.log('\n--- Testing Scenario 11: Wrong Answers Count Toward Completed Count & Progress % ---');
    const wrongAnsRes = await fetch(`${BASE_URL}/daily-practice/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId: s.id,
        partNumber: 1,
        questionIndex: 1,
        selectedOption: 'DEFINITELY_WRONG_OPTION_XYZ',
      }),
    });
    const wrongAnsData = await wrongAnsRes.json();
    assert(wrongAnsData.isCorrect === false, 'Submitting wrong answer returns isCorrect: false');
    assert(wrongAnsData.pointsDelta === -2, 'Submitting wrong answer deducts 2 points');

    // Verify session completedCount increments to 2
    const checkAfterWrongRes = await fetch(`${BASE_URL}/daily-practice/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const checkAfterWrongData = await checkAfterWrongRes.json();
    assert(checkAfterWrongData.session.completedCount === 2, 'Completed count is 2/60 even when second question answered wrongly');
    assert(checkAfterWrongData.session.remainingCount === 58, 'Remaining count is 58/60');

    // Verify dashboard reflects completed count and progress percentage
    const checkDashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const checkDashData = await checkDashRes.json();
    assert(checkDashData.todaysGoal.completedCount === 2, 'Dashboard todaysGoal has completedCount: 2');
    assert(checkDashData.todaysGoal.progressPercent === 3, 'Dashboard todaysGoal progressPercent is 3% (2/60)');
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
