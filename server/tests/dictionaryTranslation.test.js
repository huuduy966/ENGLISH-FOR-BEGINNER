// dictionaryTranslation.test.js - Automated Verification of Bilingual Dictionary Translations
// Tests: hello, student, light, book, run, beautiful, caching, error handling, save-to-notebook

process.env.NODE_ENV = 'test';
process.env.PORT = '5005';

const app = require('../src/app');

async function runTests() {
  console.log('=== Starting E4B Bilingual Dictionary Translation Test Suite ===\n');
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

  const server = app.listen(5005);
  const BASE_URL = 'http://localhost:5005/api';

  try {
    // ----------------------------------------------------
    // Test 1: Lookup 'hello' (Curriculum & Standard Greeting)
    // ----------------------------------------------------
    console.log('--- Test 1: Lookup "hello" ---');
    const helloRes = await fetch(`${BASE_URL}/vocabulary/lookup/hello`);
    const helloData = await helloRes.json();
    assert(helloRes.status === 200, 'GET /api/vocabulary/lookup/hello returns 200 OK');
    assert(helloData.word.toLowerCase() === 'hello', 'Word is "hello"');
    assert(!!helloData.phonetic, 'Phonetic IPA is present');
    assert(!!helloData.vietnameseMeaning, 'Vietnamese meaning is present: ' + helloData.vietnameseMeaning);
    assert(Array.isArray(helloData.meanings) && helloData.meanings.length > 0, 'Meanings array is populated');
    const firstHelloDef = helloData.meanings[0].definitions[0];
    assert(!!firstHelloDef.definitionVi, 'Definition has Vietnamese translation: ' + firstHelloDef.definitionVi);

    // ----------------------------------------------------
    // Test 2: Lookup 'student' (Example in Prompt)
    // ----------------------------------------------------
    console.log('\n--- Test 2: Lookup "student" ---');
    const studentRes = await fetch(`${BASE_URL}/vocabulary/lookup/student`);
    const studentData = await studentRes.json();
    assert(studentRes.status === 200, 'GET /api/vocabulary/lookup/student returns 200 OK');
    assert(studentData.word.toLowerCase() === 'student', 'Word is "student"');
    assert(studentData.vietnameseMeaning.toLowerCase().includes('học sinh') || studentData.vietnameseMeaning.toLowerCase().includes('sinh viên'), 'Vietnamese meaning is "Học sinh / sinh viên"');

    const studentNoun = studentData.meanings.find((m) => m.partOfSpeech.includes('noun'));
    assert(!!studentNoun, 'Student has noun part of speech');
    assert(studentNoun.posLabel.includes('danh từ') && studentNoun.posLabel.includes('noun'), 'Part of speech label is bilingual: ' + studentNoun.posLabel);

    const firstStudentDef = studentNoun.definitions[0];
    assert(!!firstStudentDef.definition, 'English definition is present');
    assert(!!firstStudentDef.definitionVi, 'Vietnamese definition translation is present: ' + firstStudentDef.definitionVi);

    if (firstStudentDef.example) {
      assert(!!firstStudentDef.exampleVi, 'Vietnamese example translation is present: ' + firstStudentDef.exampleVi);
    }

    // Verify synonyms with meaningVi
    if (studentData.wordnet?.synonyms?.length > 0) {
      const firstSyn = studentData.wordnet.synonyms[0];
      assert(typeof firstSyn === 'object' && !!firstSyn.word && !!firstSyn.meaningVi, 'WordNet synonym has English word and Vietnamese meaning: ' + firstSyn.word + ' (' + firstSyn.meaningVi + ')');
    }

    // ----------------------------------------------------
    // Test 3: Lookup 'light' (Polysemous word with multiple POS: noun, verb, adj, adv)
    // ----------------------------------------------------
    console.log('\n--- Test 3: Lookup "light" (Multi-POS Context Distinction) ---');
    const lightRes = await fetch(`${BASE_URL}/vocabulary/lookup/light`);
    const lightData = await lightRes.json();
    assert(lightRes.status === 200, 'GET /api/vocabulary/lookup/light returns 200 OK');
    assert(lightData.meanings.length >= 3, 'Light has at least 3 parts of speech (noun, verb, adj)');

    const hasNoun = lightData.meanings.some((m) => m.partOfSpeech.includes('noun'));
    const hasVerb = lightData.meanings.some((m) => m.partOfSpeech.includes('verb'));
    const hasAdj = lightData.meanings.some((m) => m.partOfSpeech.includes('adj'));
    assert(hasNoun && hasVerb && hasAdj, 'Light separates noun, verb, and adjective meanings with distinct contexts');

    // Verify all POS have translated definitions
    lightData.meanings.forEach((m) => {
      const firstDef = m.definitions[0];
      if (firstDef) {
        assert(!!firstDef.definitionVi, `POS "${m.posLabel}" definition is translated to Vietnamese`);
      }
    });

    // ----------------------------------------------------
    // Test 4: Lookup 'book'
    // ----------------------------------------------------
    console.log('\n--- Test 4: Lookup "book" ---');
    const bookRes = await fetch(`${BASE_URL}/vocabulary/lookup/book`);
    const bookData = await bookRes.json();
    assert(bookRes.status === 200, 'GET /api/vocabulary/lookup/book returns 200 OK');
    assert(bookData.word.toLowerCase() === 'book', 'Word is "book"');
    assert(bookData.vietnameseMeaning.toLowerCase().includes('sách'), 'Vietnamese meaning is "Sách"');
    const bookNoun = bookData.meanings.find((m) => m.partOfSpeech.includes('noun'));
    assert(!!bookNoun && !!bookNoun.definitions[0]?.definitionVi, 'Book noun definition is translated');

    // ----------------------------------------------------
    // Test 5: Lookup 'run'
    // ----------------------------------------------------
    console.log('\n--- Test 5: Lookup "run" ---');
    const runRes = await fetch(`${BASE_URL}/vocabulary/lookup/run`);
    const runData = await runRes.json();
    assert(runRes.status === 200, 'GET /api/vocabulary/lookup/run returns 200 OK');
    assert(runData.meanings.length >= 2, 'Run has multiple parts of speech (verb, noun)');
    const runVerb = runData.meanings.find((m) => m.partOfSpeech.includes('verb'));
    assert(!!runVerb && !!runVerb.definitions[0]?.definitionVi, 'Run verb definition is translated to Vietnamese');

    // ----------------------------------------------------
    // Test 6: Lookup 'beautiful' (Antonym test)
    // ----------------------------------------------------
    console.log('\n--- Test 6: Lookup "beautiful" (Synonyms & Antonyms) ---');
    const beautifulRes = await fetch(`${BASE_URL}/vocabulary/lookup/beautiful`);
    const beautifulData = await beautifulRes.json();
    assert(beautifulRes.status === 200, 'GET /api/vocabulary/lookup/beautiful returns 200 OK');
    assert(beautifulData.vietnameseMeaning.toLowerCase().includes('đẹp'), 'Vietnamese meaning is "Xinh đẹp"');
    if (beautifulData.wordnet?.antonyms?.length > 0) {
      const ant = beautifulData.wordnet.antonyms[0];
      assert(ant.word.toLowerCase() === 'ugly' && !!ant.meaningVi, 'Antonym "ugly" has Vietnamese translation: ' + ant.meaningVi);
    }

    // ----------------------------------------------------
    // Test 7: Caching & Instant Response (< 50ms)
    // ----------------------------------------------------
    console.log('\n--- Test 7: Cache Hit & Zero Latency ---');
    const tStart = Date.now();
    const cachedRes = await fetch(`${BASE_URL}/vocabulary/lookup/student`);
    const cachedData = await cachedRes.json();
    const durationMs = Date.now() - tStart;
    assert(cachedRes.status === 200, 'Second lookup returns 200 OK');
    assert(durationMs < 50, `Cache hit response is ultra-fast: ${durationMs}ms (< 50ms)`);
    assert(cachedData.word.toLowerCase() === 'student', 'Cached data is identical and intact');

    // ----------------------------------------------------
    // Test 8: Invalid Word / Typo Rejection (404 with Suggestions)
    // ----------------------------------------------------
    console.log('\n--- Test 8: Spelling Suggestions & Error Handling ---');
    const invalidRes = await fetch(`${BASE_URL}/vocabulary/lookup/gg`);
    assert(invalidRes.status === 404, 'Invalid entry "gg" is rejected with 404 Not Found');

    // ----------------------------------------------------
    // Test 9: Save Custom Word to Notebook
    // ----------------------------------------------------
    console.log('\n--- Test 9: Save Looked-up Word to Notebook ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@e4b.com', password: 'student123' }),
    });
    const { token } = await loginRes.json();

    const saveRes = await fetch(`${BASE_URL}/vocabulary/save-custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        word: 'student',
        meaning: 'Học sinh, sinh viên',
        pronunciation: '/ˈstuːdənt/',
        partOfSpeech: 'noun',
        example: 'She is a student.',
        exampleMeaning: 'Cô ấy là học sinh.',
      }),
    });
    assert(saveRes.status === 200, 'POST /api/vocabulary/save-custom saves word to user notebook');
  } catch (err) {
    console.error('\nTest suite execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exitCode = 1;
  }
}

runTests();
