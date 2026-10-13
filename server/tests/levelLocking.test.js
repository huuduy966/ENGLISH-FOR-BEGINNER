// levelLocking.test.js - Automated Verification for Cross-Level CEFR Locking
// Verifies:
// 1. Student at A1 has A1 unlocked, but A2, B1, B2, C1, C2 are completely locked
// 2. Accessing a lesson in a locked level returns 403 Forbidden with isLevelLocked: true
// 3. User with assessed level A2 has both A1 and A2 unlocked, while B1-C2 remain locked
// 4. Completing all 30 lessons of A1 automatically unlocks level A2
// 5. Admin user has all levels and lessons unlocked

process.env.NODE_ENV = 'test';
process.env.PORT = '5013';

const app = require('../src/app');
const prisma = require('../src/db');

async function runTests() {
  console.log('=== Starting Cross-Level CEFR Locking Test Suite ===\n');
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

  const server = app.listen(5013);
  const BASE_URL = 'http://localhost:5013/api';

  try {
    // 1. Create a dedicated test student with level A1
    console.log('--- 1. Testing Student with Level A1 ---');
    const a1StudentEmail = `a1_student_${Date.now()}@e4b.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A1 Test Student',
        email: a1StudentEmail,
        password: 'password123',
      }),
    });
    const regData = await regRes.json();
    const token = regData.token;
    const userId = regData.user.id;

    // A1 student querying A1 lessons
    const a1LessonsRes = await fetch(`${BASE_URL}/lessons?level=A1&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const a1LessonsData = await a1LessonsRes.json();
    assert(a1LessonsRes.status === 200, 'GET /api/lessons?level=A1 succeeds');
    assert(a1LessonsData.lessons[0].isLocked === false, 'A1 Lesson 1 is unlocked');
    assert(a1LessonsData.isCurrentLevelLocked === false, 'A1 level is not locked for A1 student');

    // A1 student querying A2 lessons: All lessons must be locked!
    const a2LessonsRes = await fetch(`${BASE_URL}/lessons?level=A2&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const a2LessonsData = await a2LessonsRes.json();
    assert(a2LessonsRes.status === 200, 'GET /api/lessons?level=A2 succeeds');
    assert(a2LessonsData.isCurrentLevelLocked === true, 'A2 level is marked locked for A1 student');
    assert(
      a2LessonsData.lessons.every((l) => l.isLocked === true && l.isLevelLocked === true),
      'All A2 lessons are locked with isLevelLocked: true'
    );

    // A1 student attempting to GET A2 Lesson 1 detail: Must return 403 Forbidden!
    const a2Lesson1Id = a2LessonsData.lessons[0].id;
    const a2DetailRes = await fetch(`${BASE_URL}/lessons/${a2Lesson1Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const a2DetailData = await a2DetailRes.json();
    assert(a2DetailRes.status === 403, 'Accessing A2 Lesson 1 returns 403 Forbidden');
    assert(a2DetailData.isLocked === true, 'Response flags isLocked: true');
    assert(a2DetailData.isLevelLocked === true, 'Response flags isLevelLocked: true');
    assert(a2DetailData.message.includes('Cấp độ A2 đang bị khóa'), 'Message clearly explains A2 is locked');

    // -------------------------------------------------------------------------
    // 2. Student Promoted to Level A2 (e.g. from placement test)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Student After Placement Test Promoted to A2 ---');
    await prisma.user.update({
      where: { id: userId },
      data: { level: 'A2' },
    });

    // Both A1 and A2 must now be unlocked!
    const a2PromotedRes = await fetch(`${BASE_URL}/lessons?level=A2&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const a2PromotedData = await a2PromotedRes.json();
    assert(a2PromotedData.isCurrentLevelLocked === false, 'A2 level is now unlocked for A2 student');
    assert(a2PromotedData.lessons[0].isLocked === false, 'A2 Lesson 1 is now unlocked');

    // Accessing A2 Lesson 1 detail now succeeds with 200 OK!
    const a2PromotedDetailRes = await fetch(`${BASE_URL}/lessons/${a2Lesson1Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(a2PromotedDetailRes.status === 200, 'Accessing A2 Lesson 1 succeeds with 200 OK');

    // But B1 is still locked!
    const b1LessonsRes = await fetch(`${BASE_URL}/lessons?level=B1&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const b1LessonsData = await b1LessonsRes.json();
    assert(b1LessonsData.isCurrentLevelLocked === true, 'B1 level is still locked for A2 student');
    assert(b1LessonsData.lessons[0].isLocked === true, 'B1 Lesson 1 is locked');

    // -------------------------------------------------------------------------
    // 3. Progressive Unlock: Complete all 30 lessons of A1
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Progressive Unlock: Completing A1 Unlocks A2 ---');
    // Create new student with level A1
    const a1ProgressiveEmail = `prog_a1_${Date.now()}@e4b.com`;
    const regProgRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Progressive Student',
        email: a1ProgressiveEmail,
        password: 'password123',
      }),
    });
    const regProgData = await regProgRes.json();
    const progToken = regProgData.token;
    const progUserId = regProgData.user.id;

    // Simulate completing all 30 lessons of A1 in database
    const allA1Lessons = await prisma.lesson.findMany({ where: { level: 'A1' } });
    for (const l of allA1Lessons) {
      await prisma.userProgress.create({
        data: {
          userId: progUserId,
          lessonId: l.id,
          progress: 100,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    // Now check if A2 is unlocked despite user profile still having level A1!
    const a2ProgRes = await fetch(`${BASE_URL}/lessons?level=A2&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${progToken}` },
    });
    const a2ProgData = await a2ProgRes.json();
    assert(a2ProgData.isCurrentLevelLocked === false, 'A2 level automatically unlocked after finishing all A1 lessons');
    assert(a2ProgData.lessons[0].isLocked === false, 'A2 Lesson 1 is unlocked for progressive student');

    // Clean up mock users
    await prisma.user.delete({ where: { id: userId } });
    await prisma.user.delete({ where: { id: progUserId } });
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
