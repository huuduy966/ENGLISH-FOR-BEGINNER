// newAccountProgress.test.js - Automated Verification for Brand-New User Account Isolation & Fresh Progress
// Verifies that a brand-new registered account has strictly 0% progress and no completed lessons

process.env.NODE_ENV = 'test';
process.env.PORT = '5012';

const app = require('../src/app');
const prisma = require('../src/db');

async function runTests() {
  console.log('=== Starting New Account Progress Isolation Test Suite ===\n');
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

  const server = app.listen(5012);
  const BASE_URL = 'http://localhost:5012/api';

  try {
    const uniqueEmail = `fresh_user_${Date.now()}@e4b.com`;

    // 1. Register a brand-new student account
    console.log('--- 1. Register Brand-New Account ---');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Brand New Learner',
        email: uniqueEmail,
        password: 'password123',
        goal: 'Zero-foundation',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && !!regData.token, 'Brand new account registration succeeds');
    const token = regData.token;
    const userId = regData.user.id;

    // 2. Verify Database records for this new user
    console.log('\n--- 2. Database Isolation Verification ---');
    const dbProgress = await prisma.userProgress.findMany({ where: { userId } });
    assert(dbProgress.length === 0, 'New user has strictly 0 UserProgress records in database');

    const dbDaily = await prisma.dailyPractice.findMany({ where: { userId } });
    assert(dbDaily.length === 0, 'New user has strictly 0 DailyPractice records in database');

    const dbExams = await prisma.$queryRawUnsafe('SELECT * FROM ExamAttempt WHERE userId = ?', userId);
    assert(dbExams.length === 0, 'New user has strictly 0 ExamAttempt records in database');

    // 3. Verify GET /api/lessons for new user
    console.log('\n--- 3. GET /api/lessons Verification ---');
    const lessonsRes = await fetch(`${BASE_URL}/lessons?level=A1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const lessonsData = await lessonsRes.json();
    assert(lessonsRes.status === 200, 'GET /api/lessons returns 200 OK');

    const allZeroProgress = lessonsData.lessons.every((l) => l.progress === 0 && l.completed === false);
    assert(allZeroProgress, 'All lessons have strictly progress: 0 and completed: false for new user');

    assert(lessonsData.stats.completedInLevel === 0, 'completedInLevel is strictly 0');
    assert(lessonsData.stats.learningInLevel === 0, 'learningInLevel is strictly 0');

    // 4. Verify GET /api/lessons/:id for Lesson 1
    console.log('\n--- 4. GET /api/lessons/:id for Lesson 1 ---');
    const lesson1Id = lessonsData.lessons[0].id;
    const lesson1Res = await fetch(`${BASE_URL}/lessons/${lesson1Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const lesson1Data = await lesson1Res.json();
    assert(lesson1Res.status === 200, 'GET /api/lessons/:id returns 200 OK');
    assert(lesson1Data.lesson.userProgress === null, 'lesson.userProgress is strictly null for brand new user');

    // 5. Verify GET /api/dashboard for new user
    console.log('\n--- 5. GET /api/dashboard Verification ---');
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, 'GET /api/dashboard returns 200 OK');
    assert(dashData.stats.lessonsCompleted === 0, 'Dashboard stats.lessonsCompleted is strictly 0');
    assert(dashData.stats.wordsLearned === 0, 'Dashboard stats.wordsLearned is strictly 0');
    assert(dashData.stats.examsCompleted === 0, 'Dashboard stats.examsCompleted is strictly 0');
    assert(dashData.continueLesson === null, 'Dashboard continueLesson is strictly null');

    // 6. Verify GET /api/dashboard/progress/stats for new user
    console.log('\n--- 6. GET /api/dashboard/progress/stats Verification ---');
    const progRes = await fetch(`${BASE_URL}/dashboard/progress/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const progData = await progRes.json();
    assert(progRes.status === 200, 'GET /api/dashboard/progress/stats returns 200 OK');
    assert(progData.kpiCards.completedLessons.value === 0, 'KPI completedLessons value is strictly 0');
    assert(progData.kpiCards.wordsLearned.value === 0, 'KPI wordsLearned value is strictly 0');
    assert(progData.kpiCards.practiceScore.value === 0, 'KPI practiceScore value is strictly 0');

    // Clean up created mock user
    await prisma.user.delete({ where: { id: userId } });
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
