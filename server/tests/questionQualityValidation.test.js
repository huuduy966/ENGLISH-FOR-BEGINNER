// questionQualityValidation.test.js - Comprehensive Test Suite for Question & Distractor Quality
const assert = require('assert');

// 1. Banned Distractor Tokens (Irrelevant, absurd, or rude distractors)
const BANNED_DISTRACTOR_PATTERNS = [
  /banana/i,
  /airplane/i,
  /dinosaur/i,
  /refrigerator/i,
  /bus is red/i,
  /see you never/i,
  /hate weekend/i,
  /bothering me/i,
  /không cần thiết/i,
  /bị cấm đoán/i,
  /vô nghĩa/i,
  /aviation/i,
  /cooking technique/i,
  /ten continuous hours/i,
  /no regular practice/i,
  /in daily conversation/i,
  /Students practice using/i,
  /practice using .* during/i,
];

function checkBannedDistractors(options, label = 'question') {
  const violations = [];
  options.forEach((opt, idx) => {
    const optStr = typeof opt === 'string' ? opt : JSON.stringify(opt);
    for (const pattern of BANNED_DISTRACTOR_PATTERNS) {
      if (pattern.test(optStr)) {
        violations.push(`[${label}] Option ${idx + 1} ("${optStr}") matched banned pattern ${pattern}`);
      }
    }
  });
  return violations;
}

function validateMcqQuestion(q, label = 'question') {
  const violations = [];

  // Question text check
  if (q.question) {
    if (/in daily conversation/i.test(q.question)) {
      violations.push(`[${label}] Question text contains banned pattern /in daily conversation/i: "${q.question}"`);
    }
    if (/practice using .* during/i.test(q.question) || /Students practice using/i.test(q.question)) {
      violations.push(`[${label}] Question text contains generic placeholder pattern: "${q.question}"`);
    }
  }
  let parsedOpts = q.options;
  if (typeof parsedOpts === 'string') {
    try {
      parsedOpts = JSON.parse(parsedOpts);
    } catch {
      violations.push(`[${label}] options is not valid JSON array`);
      return violations;
    }
  }

  if (!Array.isArray(parsedOpts)) {
    violations.push(`[${label}] options must be an array`);
    return violations;
  }

  // Rule 1: Exactly 4 options
  if (parsedOpts.length !== 4) {
    violations.push(`[${label}] Expected strictly 4 options, got ${parsedOpts.length}`);
  }

  // Rule 2: No duplicates
  const uniqueOpts = new Set(parsedOpts.map((o) => (typeof o === 'string' ? o.trim().toLowerCase() : o)));
  if (uniqueOpts.size !== parsedOpts.length) {
    violations.push(`[${label}] Duplicate options detected in: ${JSON.stringify(parsedOpts)}`);
  }

  // Rule 3: Correct answer must be present in options
  if (q.correctAnswer) {
    const hasCorrect = parsedOpts.some(
      (o) => (typeof o === 'string' ? o.trim().toLowerCase() : o) === (typeof q.correctAnswer === 'string' ? q.correctAnswer.trim().toLowerCase() : q.correctAnswer)
    );
    if (!hasCorrect) {
      violations.push(`[${label}] correctAnswer "${q.correctAnswer}" is NOT in options: ${JSON.stringify(parsedOpts)}`);
    }
  }

  // Rule 4: No banned distractors
  const banned = checkBannedDistractors(parsedOpts, label);
  violations.push(...banned);

  return violations;
}

async function runQualitySuite() {
  console.log('=== Starting E4B Question & Distractor Quality Test Suite ===\n');
  let totalViolations = 0;

  // --------------------------------------------------------------------------
  // TEST SECTION 1: Placement Test (25 questions)
  // --------------------------------------------------------------------------
  console.log('--- 1. Testing Placement Test Questions Bank ---');
  const placementQuestions = require('../prisma/curriculum/placementQuestions');
  assert(Array.isArray(placementQuestions) && placementQuestions.length === 25, 'Placement test has strictly 25 questions');

  let placementViolations = [];
  placementQuestions.forEach((q, idx) => {
    const v = validateMcqQuestion(q, `Placement Q${idx + 1} (${q.levelTarget || 'N/A'})`);
    placementViolations.push(...v);
  });

  if (placementViolations.length === 0) {
    console.log('  ✔ PASS: Placement test 25 questions meet all quality standards');
  } else {
    console.log(`  ❌ FAIL: Found ${placementViolations.length} violations in placement test:`);
    placementViolations.slice(0, 5).forEach((v) => console.log(`     - ${v}`));
    totalViolations += placementViolations.length;
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 2: Speaking Situations Bank in Daily Practice
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Daily Practice Speaking Situations ---');
  const { ALL_SPEAKING_SITUATIONS } = require('../prisma/dailyQuestions/dataGenerator');
  assert(Array.isArray(ALL_SPEAKING_SITUATIONS) && ALL_SPEAKING_SITUATIONS.length >= 20, 'Speaking situations bank exists');

  let speakingViolations = [];
  ALL_SPEAKING_SITUATIONS.forEach((s, idx) => {
    const qObj = { options: s.opts, correctAnswer: s.ans };
    const v = validateMcqQuestion(qObj, `Speaking Situation ${s.id || idx + 1}`);
    speakingViolations.push(...v);
  });

  if (speakingViolations.length === 0) {
    console.log('  ✔ PASS: All speaking situations have plausible, polite options without rude distractors');
  } else {
    console.log(`  ❌ FAIL: Found ${speakingViolations.length} violations in speaking situations:`);
    speakingViolations.slice(0, 5).forEach((v) => console.log(`     - ${v}`));
    totalViolations += speakingViolations.length;
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 3: Curriculum Generator Helper (Reading, Listening, Quiz)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Curriculum Generator Helper Output ---');
  const { createLesson } = require('../prisma/curriculum/generators/helper');
  const sampleLesson = createLesson({
    level: 'A1',
    orderNumber: 1,
    title: 'Greetings & Introductions',
    category: 'Greetings',
    description: 'Learn greeting basics',
    vocabularies: [
      { word: 'Hello', meaning: 'Xin chào', pronunciation: '/həˈloʊ/', partOfSpeech: 'interjection' },
      { word: 'Goodbye', meaning: 'Tạm biệt', pronunciation: '/ɡʊdˈbaɪ/', partOfSpeech: 'interjection' },
      { word: 'Name', meaning: 'Tên', pronunciation: '/neɪm/', partOfSpeech: 'noun' },
      { word: 'Meet', meaning: 'Gặp gỡ', pronunciation: '/miːt/', partOfSpeech: 'verb' },
    ],
  });

  let helperViolations = [];

  // 3a. Reading questions
  const readingQs = JSON.parse(sampleLesson.readings[0].questions);
  readingQs.forEach((rq, idx) => {
    const v = validateMcqQuestion(rq, `Lesson Reading Q${idx + 1}`);
    helperViolations.push(...v);
  });

  // 3b. Listening questions
  const listeningQs = JSON.parse(sampleLesson.listenings[0].questions);
  listeningQs.forEach((lq, idx) => {
    const v = validateMcqQuestion(lq, `Lesson Listening Q${idx + 1}`);
    helperViolations.push(...v);
  });

  // 3c. Quiz questions
  sampleLesson.quizzes.forEach((quiz, idx) => {
    const v = validateMcqQuestion(quiz, `Lesson Quiz Q${idx + 1}`);
    helperViolations.push(...v);
  });

  // 3d. Fill Blank exercises
  sampleLesson.exercises
    .filter((ex) => ex.type === 'FILL_BLANK' || ex.type === 'LISTEN_CHOOSE')
    .forEach((ex, idx) => {
      const v = validateMcqQuestion(ex, `Lesson Exercise ${ex.type} Q${idx + 1}`);
      helperViolations.push(...v);
    });

  if (helperViolations.length === 0) {
    console.log('  ✔ PASS: Curriculum helper generates valid, on-topic distractors across all sections');
  } else {
    console.log(`  ❌ FAIL: Found ${helperViolations.length} violations in curriculum helper:`);
    helperViolations.slice(0, 10).forEach((v) => console.log(`     - ${v}`));
    totalViolations += helperViolations.length;
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 4: Generated Daily Practice Sets across Levels (60 Questions)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Generated Daily Practice Sets (No Robotic Placeholders) ---');
  const { generateDailyBankForLevel } = require('../prisma/dailyQuestions/dataGenerator');
  let dailyViolations = [];
  ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach((lvl) => {
    const parts = generateDailyBankForLevel(lvl, { dateStr: '2026-10-12', recentQuestionIds: new Set() });
    parts.forEach((p) => {
      p.questions.forEach((q, idx) => {
        const v = validateMcqQuestion(q, `Daily Practice ${lvl} Part ${p.partNumber} Q${idx + 1}`);
        dailyViolations.push(...v);
      });
    });
  });

  if (dailyViolations.length === 0) {
    console.log('  ✔ PASS: All generated daily practice questions across A1-C2 contain 0 robotic/banned sentences');
  } else {
    console.log(`  ❌ FAIL: Found ${dailyViolations.length} violations in generated daily practice:`);
    dailyViolations.slice(0, 10).forEach((v) => console.log(`     - ${v}`));
    totalViolations += dailyViolations.length;
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log(`\n=== Quality Suite Result: ${totalViolations === 0 ? 'ALL PASSED' : totalViolations + ' VIOLATIONS DETECTED'} ===`);
  if (totalViolations > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runQualitySuite().catch((err) => {
    console.error('Quality suite execution error:', err);
    process.exit(1);
  });
}

module.exports = { validateMcqQuestion, checkBannedDistractors };
