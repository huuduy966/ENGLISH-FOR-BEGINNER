process.env.NODE_ENV = 'test';
process.env.PORT = '5003';

const app = require('../src/app');

async function runTests() {
  console.log('=== Testing GET /api/lessons/:id - Readings & Clean Grammar Points ===');
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

  const server = app.listen(5003);
  const BASE_URL = 'http://localhost:5003/api';

  try {
    // 1. Login to get token
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@e4b.com', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && !!loginData.token, 'Student login returns 200 with JWT');
    const token = loginData.token;

    // 2. Fetch lessons list to get first lesson ID
    const listRes = await fetch(`${BASE_URL}/lessons?level=A1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    assert(listRes.status === 200 && listData.lessons && listData.lessons.length > 0, 'GET /api/lessons returns lessons list');
    const firstLessonId = listData.lessons[0].id;

    // 3. Fetch lesson detail with token
    const res = await fetch(`${BASE_URL}/lessons/${firstLessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    assert(res.status === 200, `GET /api/lessons/${firstLessonId} returns 200 OK`);
    assert(!!data.lesson, 'Response includes lesson object');
    assert(Array.isArray(data.lesson.readings), 'lesson.readings is an array');
    assert(Array.isArray(data.lesson.grammarPoints), 'lesson.grammarPoints is an array');

    if (data.lesson.grammarPoints && data.lesson.grammarPoints.length > 0) {
      const firstGp = data.lesson.grammarPoints[0];
      assert(
        !firstGp.practiceQuestions || firstGp.practiceQuestions.length === 0,
        'grammarPoints does not have practiceQuestions'
      );
    }
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
    if (failed > 0) process.exitCode = 1;
  }
}

runTests();
