// examApi.test.js - Automated Test Suite for 40-Question Proficiency Exam
// Tests: 40 questions quota, 5 parts, 60 minutes countdown, state persistence, grading scale 10.0

process.env.NODE_ENV = 'test';
process.env.PORT = '5007';

const app = require('../src/app');

async function runTests() {
  console.log('=== Starting E4B Proficiency Exam (40 Questions) Test Suite ===\n');
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

  const server = app.listen(5007);
  const BASE_URL = 'http://localhost:5007/api';

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
    const userId = loginData.user.id;

    // Clean up any uncompleted mock attempts for fresh test run
    const prisma = require('../src/db');
    await prisma.$executeRawUnsafe('DELETE FROM ExamAttempt WHERE userId = ? AND isCompleted = 0', userId);

    // 2. GET /api/exam/intro
    console.log('\n--- Testing 1: GET /api/exam/intro ---');
    const introRes = await fetch(`${BASE_URL}/exam/intro`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const introData = await introRes.json();
    assert(introRes.status === 200, 'GET /api/exam/intro returns 200 OK');
    assert(introData.totalQuestions === 40, 'Exam total questions is strictly 40');
    assert(introData.durationMinutes === 60, 'Exam duration is strictly 60 minutes');
    assert(introData.maxScore === 10.0, 'Exam max score is 10.0 points');
    assert(introData.partsOverview.length === 5, 'Overview describes 5 parts');

    // 3. POST /api/exam/start
    console.log('\n--- Testing 2: POST /api/exam/start ---');
    const startRes = await fetch(`${BASE_URL}/exam/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const startData = await startRes.json();
    assert(startRes.status === 200, 'POST /api/exam/start returns 200 OK');
    assert(!!startData.attemptId, 'Exam attempt ID is generated');
    assert(startData.remainingSeconds > 3500 && startData.remainingSeconds <= 3600, 'Remaining time is ~3600 seconds (60 mins)');

    // Verify 5 parts & exactly 40 questions
    const parts = startData.parts || [];
    assert(parts.length === 6, 'Exam organized into 6 pages (Part 1, 2, 3, 4.1, 4.2, 5)');
    const totalQs = parts.reduce((acc, p) => acc + p.questions.length, 0);
    assert(totalQs === 40, 'Total questions across all parts is strictly 40 questions');

    // Verify questions quotas: Part 1: 10, Part 2: 10, Part 3: 5, Part 4.1: 5, Part 4.2: 5, Part 5: 5
    assert(parts[0].questions.length === 10, 'Part 1 (Vocabulary Fill-in) has exactly 10 questions');
    assert(parts[1].questions.length === 10, 'Part 2 (Error Correction) has exactly 10 questions');
    assert(parts[2].questions.length === 5, 'Part 3 (Listening) has exactly 5 questions');
    assert(parts[3].questions.length === 5, 'Part 4 - Passage 1 has exactly 5 questions');
    assert(parts[4].questions.length === 5, 'Part 4 - Passage 2 has exactly 5 questions');
    assert(parts[5].questions.length === 5, 'Part 5 (Sentence Reorder) has exactly 5 questions');

    // Verify no answer leakage in client payload
    const q1 = parts[0].questions[0];
    assert(!q1.correctAnswer && !q1.acceptedAnswers, 'Client question payload does NOT leak correctAnswer or acceptedAnswers');

    // 4. POST /api/exam/save-progress
    console.log('\n--- Testing 3: Auto-Save Progress across Pages ---');
    const attemptId = startData.attemptId;

    // Fetch attempt examData from DB to construct answers matching the exact randomized questions
    const attemptRecord = await prisma.$queryRawUnsafe(
      'SELECT examData FROM ExamAttempt WHERE id = ?',
      attemptId
    );
    const dbExam = JSON.parse(attemptRecord[0].examData);
    const allQs = [];
    (dbExam.parts || []).forEach((p) => {
      (p.questions || []).forEach((q) => allQs.push(q));
    });

    const saveQ1 = allQs[0];
    const saveQ2 = allQs[1];
    const saveQ11 = allQs[10];

    const saveRes = await fetch(`${BASE_URL}/exam/save-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attemptId,
        currentPage: 2,
        answers: {
          [saveQ1.id]: saveQ1.correctAnswer || (saveQ1.acceptedAnswers && saveQ1.acceptedAnswers[0]) || 'correct',
          [saveQ2.id]: saveQ2.correctAnswer || (saveQ2.acceptedAnswers && saveQ2.acceptedAnswers[0]) || 'correct',
          [saveQ11.id]: `${saveQ11.errorPart || 'B'} - ${saveQ11.correctCorrection || 'fix'}`,
        },
      }),
    });
    const saveData = await saveRes.json();
    assert(saveRes.status === 200 && saveData.success === true, 'Auto-save progress returns success');

    // 5. GET /api/exam/current (Resume test)
    console.log('\n--- Testing 4: Resume Exam Session on Page Reload ---');
    const currentRes = await fetch(`${BASE_URL}/exam/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const currentData = await currentRes.json();
    assert(currentRes.status === 200, 'GET /api/exam/current returns 200 OK');
    assert(currentData.attemptId === attemptId, 'Attempt ID is preserved on reload');
    assert(currentData.currentPage === 2, 'Current page (Page 2) is restored');
    assert(currentData.answers[saveQ1.id] !== undefined, 'Saved answer for Q1 is preserved');
    assert(currentData.answers[saveQ11.id] !== undefined, 'Saved answer for Q11 is preserved');

    // 6. POST /api/exam/submit
    console.log('\n--- Testing 5: Submit Exam and Grade on Scale 10.0 ---');
    const fullAnswers = {};
    // Answer 32 questions correctly
    for (let i = 0; i < 32; i++) {
      const q = allQs[i];
      if (q.partNumber === 2 || q.errorPart) {
        fullAnswers[q.id] = `${q.errorPart || 'B'} - ${q.correctCorrection || 'fix'}`;
      } else {
        fullAnswers[q.id] = q.correctAnswer || (q.acceptedAnswers && q.acceptedAnswers[0]) || 'correct';
      }
    }
    // Answer 6 questions wrongly
    for (let i = 32; i < 38; i++) {
      const q = allQs[i];
      fullAnswers[q.id] = 'DEFINITELY_WRONG_ANSWER_XYZ';
    }
    // Leave 2 questions unanswered
    fullAnswers[allQs[38].id] = '';
    fullAnswers[allQs[39].id] = '';

    const submitRes = await fetch(`${BASE_URL}/exam/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attemptId,
        answers: fullAnswers,
      }),
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 200, 'POST /api/exam/submit returns 200 OK');
    assert(submitData.success === true, 'Submission success is true');
    assert(submitData.evaluation.totalQuestions === 40, 'Graded 40 questions');
    // Expected: 8 + 8 + 4 + 4 + 4 + 4 = 32 correct. 32 * 0.25 = 8.00 / 10.0
    assert(submitData.evaluation.correctCount === 32, 'Correct count is 32/40 (got: ' + submitData.evaluation.correctCount + ')');
    assert(submitData.evaluation.score === 8.0, 'Final score is 8.0 / 10.0');
    assert(submitData.evaluation.unansweredCount === 2, 'Unanswered count is 2');
    assert(submitData.evaluation.wrongCount === 6, 'Wrong count is 6');

    // 7. Verify attempt is locked after submission
    console.log('\n--- Testing 6: Lock Attempt After Submission ---');
    const tamperRes = await fetch(`${BASE_URL}/exam/save-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attemptId,
        answers: { a1_p1_q1: 'hacked_answer' },
      }),
    });
    assert(tamperRes.status === 400, 'Submitting edits to completed exam is rejected with 400');

    // 8. GET /api/exam/result/:id
    console.log('\n--- Testing 7: GET /api/exam/result/:id ---');
    const resultRes = await fetch(`${BASE_URL}/exam/result/${attemptId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resultData = await resultRes.json();
    assert(resultRes.status === 200, 'GET /api/exam/result/:id returns 200 OK');
    assert(resultData.score === 8.0, 'Result view returns 8.0 score');
    assert(Array.isArray(resultData.evaluation.reviews) && resultData.evaluation.reviews.length === 40, 'Reviews array has 40 detailed question reviews');
  } catch (err) {
    console.error('\nTest execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exitCode = 1;
  }
}

runTests();
