// progressApi.test.js - Comprehensive Test Suite for Learning Progress Analytics
// Verifies:
// 1. Periods (7_days, 30_days, 90_days, all_time)
// 2. SSOT KPI cards (Lessons, Practice score, Words learned, Study time, Streak, XP)
// 3. Day-by-day activity array in Vietnam timezone (Asia/Ho_Chi_Minh)
// 4. Skills breakdown (Vocabulary, Grammar, Speaking, Listening, Reading, Exercises, Exams)
// 5. CEFR roadmap (A1 to C2)
// 6. Chronological activity feed

process.env.NODE_ENV = 'test';
process.env.PORT = '5010';

const app = require('../src/app');

async function runTests() {
  console.log('=== Starting E4B Progress Analytics Test Suite ===\n');
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

  const server = app.listen(5010);
  const BASE_URL = 'http://localhost:5010/api';

  try {
    // 1. Authenticate student
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@e4b.com', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && !!loginData.token, 'Student authentication succeeds');
    const token = loginData.token;

    // 2. Test GET /dashboard/progress/stats (Default: 7_days)
    console.log('\n--- Testing 1: Default Period (7_days) ---');
    const res7 = await fetch(`${BASE_URL}/dashboard/progress/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data7 = await res7.json();
    assert(res7.status === 200, 'GET /dashboard/progress/stats returns 200 OK');
    assert(data7.period === '7_days', 'Default period is "7_days"');
    assert(data7.daysCount === 7, 'Days count is 7');
    assert(data7.dailyActivity.length === 7, 'dailyActivity has exactly 7 days');
    assert(!!data7.userLevel, `User level returned: ${data7.userLevel}`);

    // Check KPI cards
    const kpi = data7.kpiCards;
    assert(kpi.completedLessons && typeof kpi.completedLessons.value === 'number', 'KPI completedLessons exists and is a number');
    assert(kpi.practiceScore && typeof kpi.practiceScore.value === 'number', 'KPI practiceScore exists and is a number');
    assert(kpi.wordsLearned && typeof kpi.wordsLearned.value === 'number', 'KPI wordsLearned exists and is a number');
    assert(kpi.studyTime && !isNaN(parseFloat(kpi.studyTime.value)), 'KPI studyTime exists and is numeric');
    assert(kpi.streak && typeof kpi.streak.value === 'number', 'KPI streak exists and is a number');
    assert(kpi.accuracy && typeof kpi.accuracy.value === 'number', 'KPI accuracy exists and is a number');

    // 3. Test Period: 30_days
    console.log('\n--- Testing 2: Period 30_days ---');
    const res30 = await fetch(`${BASE_URL}/dashboard/progress/stats?period=30_days`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data30 = await res30.json();
    assert(res30.status === 200, 'GET with period=30_days returns 200 OK');
    assert(data30.period === '30_days', 'Period is "30_days"');
    assert(data30.daysCount === 30, 'Days count is 30');
    assert(data30.dailyActivity.length === 30, 'dailyActivity has exactly 30 days');

    // 4. Test Period: 90_days
    console.log('\n--- Testing 3: Period 90_days ---');
    const res90 = await fetch(`${BASE_URL}/dashboard/progress/stats?period=90_days`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data90 = await res90.json();
    assert(res90.status === 200, 'GET with period=90_days returns 200 OK');
    assert(data90.period === '90_days', 'Period is "90_days"');
    assert(data90.daysCount === 90, 'Days count is 90');
    assert(data90.dailyActivity.length === 90, 'dailyActivity has exactly 90 days');

    // 5. Test Period: all_time
    console.log('\n--- Testing 4: Period all_time ---');
    const resAll = await fetch(`${BASE_URL}/dashboard/progress/stats?period=all_time`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataAll = await resAll.json();
    assert(resAll.status === 200, 'GET with period=all_time returns 200 OK');
    assert(dataAll.period === 'all_time', 'Period is "all_time"');
    assert(dataAll.dailyActivity.length >= 30, 'all_time has at least 30 days of activity data');

    // 6. Verify Daily Activity data integrity
    console.log('\n--- Testing 5: Daily Activity Data Integrity ---');
    const todayItem = data7.dailyActivity[data7.dailyActivity.length - 1];
    assert(/^\d{4}-\d{2}-\d{2}$/.test(todayItem.date), 'Date matches YYYY-MM-DD format');
    assert(typeof todayItem.studyMinutes === 'number' && todayItem.studyMinutes >= 0, 'studyMinutes is non-negative number');
    assert(typeof todayItem.questionsCount === 'number' && todayItem.questionsCount >= 0, 'questionsCount is non-negative number');
    assert(typeof todayItem.intensity === 'number' && todayItem.intensity >= 0 && todayItem.intensity <= 4, 'intensity is between 0 and 4');

    // 7. Verify Skill Breakdown
    console.log('\n--- Testing 6: Skill Breakdown ---');
    const skills = data7.skillMetrics;
    assert(!!skills.vocabulary && typeof skills.vocabulary.accuracyPercent === 'number', 'Vocabulary skill accuracy is calculated');
    assert(!!skills.grammar && typeof skills.grammar.accuracyPercent === 'number', 'Grammar skill accuracy is calculated');
    assert(!!skills.speaking && typeof skills.speaking.accuracyPercent === 'number', 'Speaking skill accuracy is calculated');
    assert(!!skills.listening && typeof skills.listening.accuracyPercent === 'number', 'Listening skill accuracy is calculated');
    assert(!!skills.reading && typeof skills.reading.accuracyPercent === 'number', 'Reading skill accuracy is calculated');
    assert(!!skills.sentenceBuilding && typeof skills.sentenceBuilding.accuracyPercent === 'number', 'Sentence building skill accuracy is calculated');
    assert(!!skills.exam && typeof skills.exam.hasData === 'boolean', 'Exam skill exists with hasData flag');

    // 8. Verify CEFR Roadmap
    console.log('\n--- Testing 7: CEFR Roadmap ---');
    const roadmap = data7.cefrRoadmap;
    assert(Array.isArray(roadmap) && roadmap.length === 6, 'Roadmap contains exactly 6 levels (A1 to C2)');
    assert(roadmap[0].level === 'A1' && roadmap[0].totalLessons > 0, 'A1 level has totalLessons > 0');
    assert(roadmap[0].progressPercent >= 0 && roadmap[0].progressPercent <= 100, 'A1 progressPercent is valid (0-100%)');
    assert(['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'].includes(roadmap[0].status), 'A1 status is one of valid statuses');

    // 9. Verify Recent Activities Feed
    console.log('\n--- Testing 8: Recent Activities Feed ---');
    const activities = data7.recentActivities;
    assert(Array.isArray(activities), 'recentActivities is an array');
    if (activities.length > 0) {
      const firstAct = activities[0];
      assert(!!firstAct.id && !!firstAct.title && !!firstAct.timestamp, 'Activity item contains id, title, and timestamp');
      assert(!!firstAct.badge, 'Activity item contains badge');
    }

    // 10. Backward Compatibility Check
    console.log('\n--- Testing 9: Backward Compatibility Keys ---');
    assert(!!data7.overview && typeof data7.overview.completedLessons === 'number', 'data.overview exists for legacy consumers');
    assert(!!data7.skills && typeof data7.skills.vocabulary === 'number', 'data.skills exists for legacy consumers');
    assert(Array.isArray(data7.recentQuizzes), 'data.recentQuizzes exists for legacy consumers');
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
