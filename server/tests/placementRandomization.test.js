// placementRandomization.test.js - Automated Verification for Placement Test Randomization & Difficulty Equivalence
process.env.NODE_ENV = 'test';
process.env.PORT = '5014';

const app = require('../src/app');
const { getQuestionById } = require('../prisma/curriculum/placementQuestions');

async function runTests() {
  console.log('=== Starting E4B Placement Test Randomization & Difficulty Equivalence Suite ===\n');
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

  const server = app.listen(5014);
  const BASE_URL = 'http://localhost:5014/api';

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

    // -------------------------------------------------------------------------
    // Test 1: Fetch Attempt 1 and Verify Exact CEFR Quotas & Structure
    // -------------------------------------------------------------------------
    console.log('\n--- Test 1: Fetch Attempt 1 & Check Structure ---');
    const res1 = await fetch(`${BASE_URL}/placement-test`);
    const data1 = await res1.json();
    assert(res1.status === 200, 'GET /api/placement-test returns 200');
    assert(data1.totalQuestions === 25, 'Attempt 1 has strictly 25 questions');
    assert(data1.questions.length === 25, 'Attempt 1 questions array length is 25');

    const p1_part1 = data1.questions.filter((q) => q.partNumber === 1);
    const p1_part2 = data1.questions.filter((q) => q.partNumber === 2);
    assert(p1_part1.length === 15, 'Attempt 1 has exactly 15 Fill-in-the-blank questions');
    assert(p1_part2.length === 10, 'Attempt 1 has exactly 10 Listening questions');

    // Check tier counts in Attempt 1
    const tierCounts1 = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    data1.questions.forEach((q) => {
      const fullQ = getQuestionById(q.id);
      if (fullQ && fullQ.levelTarget) {
        tierCounts1[fullQ.levelTarget]++;
      }
    });

    assert(tierCounts1.A1 === 4, 'Attempt 1 has exactly 4 A1 questions (3 Fill + 1 Listen)');
    assert(tierCounts1.A2 === 4, 'Attempt 1 has exactly 4 A2 questions (3 Fill + 1 Listen)');
    assert(tierCounts1.B1 === 5, 'Attempt 1 has exactly 5 B1 questions (3 Fill + 2 Listen)');
    assert(tierCounts1.B2 === 4, 'Attempt 1 has exactly 4 B2 questions (2 Fill + 2 Listen)');
    assert(tierCounts1.C1 === 4, 'Attempt 1 has exactly 4 C1 questions (2 Fill + 2 Listen)');
    assert(tierCounts1.C2 === 4, 'Attempt 1 has exactly 4 C2 questions (2 Fill + 2 Listen)');

    // -------------------------------------------------------------------------
    // Test 2: Fetch Attempt 2 and Verify Randomization
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Fetch Attempt 2 & Verify Question Randomization ---');
    const res2 = await fetch(`${BASE_URL}/placement-test`);
    const data2 = await res2.json();
    assert(res2.status === 200, 'Second call to /placement-test succeeds');
    assert(data2.questions.length === 25, 'Attempt 2 has strictly 25 questions');

    const ids1 = new Set(data1.questions.map((q) => q.id));
    const ids2 = new Set(data2.questions.map((q) => q.id));

    const differentQuestionsCount = data2.questions.filter((q) => !ids1.has(q.id)).length;
    console.log(`  [Info] Questions different in Attempt 2: ${differentQuestionsCount} / 25`);
    assert(differentQuestionsCount > 0, 'Attempt 2 questions are randomized from question pools');

    // Check tier counts in Attempt 2 to guarantee exact difficulty equivalence
    const tierCounts2 = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    data2.questions.forEach((q) => {
      const fullQ = getQuestionById(q.id);
      if (fullQ && fullQ.levelTarget) {
        tierCounts2[fullQ.levelTarget]++;
      }
    });

    assert(tierCounts2.A1 === 4, 'Attempt 2 preserves exactly 4 A1 questions');
    assert(tierCounts2.A2 === 4, 'Attempt 2 preserves exactly 4 A2 questions');
    assert(tierCounts2.B1 === 5, 'Attempt 2 preserves exactly 5 B1 questions');
    assert(tierCounts2.B2 === 4, 'Attempt 2 preserves exactly 4 B2 questions');
    assert(tierCounts2.C1 === 4, 'Attempt 2 preserves exactly 4 C1 questions');
    assert(tierCounts2.C2 === 4, 'Attempt 2 preserves exactly 4 C2 questions');

    // -------------------------------------------------------------------------
    // Test 3: Submit Answers to Randomized Test
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Submitting Answers to Randomized Test ---');
    const perfectAnswers = {};
    data1.questions.forEach((q) => {
      const fullQ = getQuestionById(q.id);
      if (fullQ) {
        perfectAnswers[q.id] = fullQ.correctAnswer;
      }
    });

    const submitRes = await fetch(`${BASE_URL}/placement-test/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers: perfectAnswers }),
    });

    const submitData = await submitRes.json();
    assert(submitRes.status === 200, 'POST /placement-test/submit returns 200 OK');
    assert(submitData.correctCount === 25, 'All 25 randomized questions graded with 25 correct');
    assert(submitData.score === 100, 'Score is 100/100 points');
    assert(submitData.assignedLevel === 'C2', 'Assigned level is C2 for 100% score');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n=== Randomization Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
