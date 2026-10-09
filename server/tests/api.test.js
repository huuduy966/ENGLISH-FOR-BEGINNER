process.env.NODE_ENV = 'test';
process.env.PORT = '5002';

const app = require('../src/app');

async function runTests() {
  console.log('=== Starting E4B Backend API Test Suite ===');
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

  const server = app.listen(5002);
  const BASE_URL = 'http://localhost:5002/api';

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Student Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@e4b.com', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && !!loginData.token, 'POST /api/auth/login returns JWT token');
    const studentToken = loginData.token;

    // 3. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@e4b.com', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.user.role === 'ADMIN', 'Admin login has role ADMIN');
    const adminToken = adminLoginData.token;

    // 4. GET /api/lessons with token
    const lessonsRes = await fetch(`${BASE_URL}/lessons`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const lessonsData = await lessonsRes.json();
    assert(lessonsRes.status === 200 && lessonsData.lessons.length >= 5, 'GET /api/lessons returns at least 5 lessons');
    const firstLessonId = lessonsData.lessons[0].id;

    // 4b. Test CEFR Pagination & Level Filtering
    const a1PagedRes = await fetch(`${BASE_URL}/lessons?level=A1&page=1&limit=12`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const a1PagedData = await a1PagedRes.json();
    assert(
      a1PagedRes.status === 200 &&
      a1PagedData.lessons.length === 12 &&
      a1PagedData.pagination.total === 30 &&
      a1PagedData.pagination.totalPages === 3,
      'GET /api/lessons?level=A1&page=1&limit=12 returns 12 lessons with 3 total pages'
    );

    // 4c. Test Independent Per-Level Sequential Locking: B1 Lesson 1 is unlocked even if student is A1
    const b1Res = await fetch(`${BASE_URL}/lessons?level=B1&page=1&limit=12`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const b1Data = await b1Res.json();
    assert(
      b1Res.status === 200 &&
      b1Data.lessons[0].orderNumber === 1 &&
      b1Data.lessons[0].isLocked === false,
      'B1 Lesson 1 is unlocked independently for student'
    );

    // 4d. Test In-Level Sequential Lock: In A1, Lesson 1 is completed -> Lesson 2 is unlocked -> Lesson 3 is locked
    const a1Lessons = a1PagedData.lessons;
    assert(
      a1Lessons[0].completed === true &&
      a1Lessons[1].isLocked === false &&
      a1Lessons[2].isLocked === true,
      'A1 progression: Lesson 1 completed, Lesson 2 unlocked, Lesson 3 locked'
    );

    // 4e. Test Category Filter
    const catRes = await fetch(`${BASE_URL}/lessons?level=A1&category=Greetings`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const catData = await catRes.json();
    assert(
      catRes.status === 200 && catData.lessons.length >= 1 && catData.lessons.every(l => l.category === 'Greetings'),
      'GET /api/lessons?level=A1&category=Greetings filters correctly by category'
    );

    // 4f. Test Search Filter
    const searchRes = await fetch(`${BASE_URL}/lessons?level=A1&search=Introductions`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 && searchData.lessons.some(l => l.title.includes('Introductions')),
      'GET /api/lessons?level=A1&search=Introductions returns matching search results'
    );

    // 4g. Test Admin Access: Admin has all lessons unlocked
    const adminLessonsRes = await fetch(`${BASE_URL}/lessons?level=A1&page=1&limit=12`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminLessonsData = await adminLessonsRes.json();
    assert(
      adminLessonsRes.status === 200 && adminLessonsData.lessons.every(l => l.isLocked === false),
      'Admin has all lessons unlocked across level'
    );

    // 5. GET /api/lessons/:id detail
    const lessonDetailRes = await fetch(`${BASE_URL}/lessons/${firstLessonId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const lessonDetail = await lessonDetailRes.json();
    assert(
      lessonDetailRes.status === 200 &&
      lessonDetail.lesson.vocabularies.length > 0 &&
      lessonDetail.lesson.grammarPoints.length > 0 &&
      lessonDetail.lesson.quizzes.length > 0,
      'GET /api/lessons/:id returns full lesson modules (vocab, grammar, quizzes)'
    );

    // 6. GET /api/vocabulary
    const vocabRes = await fetch(`${BASE_URL}/vocabulary`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const vocabData = await vocabRes.json();
    assert(vocabRes.status === 200 && vocabData.vocabulary.length >= 30, 'GET /api/vocabulary returns vocabulary list');

    // 7. POST /api/vocabulary/:id/status (Favorite toggle)
    const testVocabId = vocabData.vocabulary[0].id;
    const favRes = await fetch(`${BASE_URL}/vocabulary/${testVocabId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ isFavorite: true, status: 'LEARNING' }),
    });
    const favData = await favRes.json();
    assert(favRes.status === 200 && favData.userVocab.isFavorite === true, 'POST /api/vocabulary/:id/status sets favorite');

    // 7b. Dictionary: GET /api/vocabulary/lookup/hello (Exact match with IPA and Vietnamese meaning)
    const dictHelloRes = await fetch(`${BASE_URL}/vocabulary/lookup/hello`);
    const dictHelloData = await dictHelloRes.json();
    assert(
      dictHelloRes.status === 200 &&
      dictHelloData.word.toLowerCase() === 'hello' &&
      !!dictHelloData.phonetic &&
      !!dictHelloData.vietnameseMeaning,
      'GET /api/vocabulary/lookup/hello returns accurate definitions with IPA'
    );

    // 7c. Dictionary: GET /api/vocabulary/lookup/gg (Strict exact matching, not found, suggests alternatives)
    const dictGgRes = await fetch(`${BASE_URL}/vocabulary/lookup/gg`);
    const dictGgData = await dictGgRes.json();
    assert(
      dictGgRes.status === 404 &&
      dictGgData.message.includes('Không tìm thấy định nghĩa phù hợp'),
      'GET /api/vocabulary/lookup/gg rejects invalid entry and returns 404 with suggestions'
    );

    // 7d. Dictionary: GET /api/vocabulary/topics (Real curriculum topics from DB)
    const dictTopicsRes = await fetch(`${BASE_URL}/vocabulary/topics`);
    const dictTopicsData = await dictTopicsRes.json();
    assert(
      dictTopicsRes.status === 200 &&
      Array.isArray(dictTopicsData.topics) &&
      dictTopicsData.topics.length >= 3,
      'GET /api/vocabulary/topics returns dynamic curriculum topics'
    );

    // 8. GET /api/placement-test
    const testRes = await fetch(`${BASE_URL}/placement-test`);
    const testData = await testRes.json();
    assert(testRes.status === 200 && testData.questions.length >= 20, 'GET /api/placement-test returns placement questions');

    // 9. POST /api/placement-test/submit
    const sampleAnswers = {};
    testData.questions.forEach((q, idx) => {
      // Pick first option for each
      sampleAnswers[q.id] = q.options[0];
    });
    const submitTestRes = await fetch(`${BASE_URL}/placement-test/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ answers: sampleAnswers }),
    });
    const submitTestData = await submitTestRes.json();
    assert(submitTestRes.status === 200 && !!submitTestData.assignedLevel, 'POST /api/placement-test/submit evaluates level');

    // 10. POST /api/quiz/:lessonId/submit
    const quizQuestions = lessonDetail.lesson.quizzes;
    const quizAnswers = {};
    quizQuestions.forEach((q) => {
      quizAnswers[q.id] = q.options[0];
    });
    const submitQuizRes = await fetch(`${BASE_URL}/quiz/${firstLessonId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ answers: quizAnswers }),
    });
    const submitQuizData = await submitQuizRes.json();
    assert(submitQuizRes.status === 200 && submitQuizData.total === quizQuestions.length, 'POST /api/quiz/:lessonId/submit evaluates quiz');

    // 11. GET /api/dashboard
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const dashData = await dashRes.json();
    assert(
      dashRes.status === 200 &&
      dashData.user &&
      dashData.stats &&
      dashData.stats.practiceScore !== undefined &&
      dashData.todaysPackage,
      'GET /api/dashboard returns Today\'s Learning package and practiceScore in stats'
    );

    // 11b. GET /api/daily-practice/today
    const dailyRes = await fetch(`${BASE_URL}/daily-practice/today`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const dailyData = await dailyRes.json();
    assert(
      dailyRes.status === 200 &&
      dailyData.session.totalQuestions === 60 &&
      dailyData.session.parts.length === 5,
      'GET /api/daily-practice/today returns 60 questions across 5 parts'
    );

    // 11c. POST /api/daily-practice/answer (Correct answer gives +4)
    const targetQIdx = dailyData.session.parts[0].questions.findIndex(q => !q.isCorrect);
    const targetQ = targetQIdx >= 0 ? dailyData.session.parts[0].questions[targetQIdx] : dailyData.session.parts[0].questions[0];
    const answerCorrectRes = await fetch(`${BASE_URL}/daily-practice/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        partNumber: 1,
        questionIndex: targetQIdx >= 0 ? targetQIdx : 0,
        selectedOption: targetQ.correctAnswer,
      }),
    });
    const answerCorrectData = await answerCorrectRes.json();
    assert(
      answerCorrectRes.status === 200 &&
      answerCorrectData.isCorrect === true &&
      (targetQIdx >= 0 ? answerCorrectData.pointsDelta === 4 : answerCorrectData.pointsDelta === 0),
      'POST /api/daily-practice/answer awards +4 points on correct answer'
    );

    // 11d. POST /api/daily-practice/answer (Wrong answer deducts -2 on an uncompleted question)
    const targetWrongIdx = dailyData.session.parts[1].questions.findIndex(q => !q.isCorrect);
    const speakingQIdx = targetWrongIdx >= 0 ? targetWrongIdx : 0;
    const speakingQ = dailyData.session.parts[1].questions[speakingQIdx];
    const wrongOption = speakingQ.options.find(o => o.trim().toLowerCase() !== speakingQ.correctAnswer.trim().toLowerCase()) || 'Wrong Option';
    const answerWrongRes = await fetch(`${BASE_URL}/daily-practice/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        partNumber: 2,
        questionIndex: speakingQIdx,
        selectedOption: wrongOption,
      }),
    });
    const answerWrongData = await answerWrongRes.json();
    assert(
      answerWrongRes.status === 200 &&
      (targetWrongIdx >= 0
        ? answerWrongData.isCorrect === false && answerWrongData.pointsDelta === -2
        : answerWrongData.alreadyAnswered === true),
      'POST /api/daily-practice/answer deducts -2 points on wrong answer'
    );

    // 12. Security: Student forbidden from admin endpoints
    const forbiddenRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(forbiddenRes.status === 403, 'Student accessing /api/admin/stats is blocked with 403 Forbidden');

    // 13. Admin allowed to access admin endpoints
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    assert(adminStatsRes.status === 200 && adminStatsData.counts.totalUsers >= 2, 'Admin accessing /api/admin/stats succeeds with 200 OK');

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exit(1);
  }
}

runTests();
