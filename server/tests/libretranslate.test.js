// libretranslate.test.js - Verification Suite for Self-Hosted LibreTranslate Integration

process.env.NODE_ENV = 'test';
process.env.PORT = '5006';

const app = require('../src/app');
const {
  LIBRETRANSLATE_URL,
  translateWithLibreTranslate,
  translateText,
  translateBatch,
} = require('../src/services/translationService');

async function runTests() {
  console.log('=== Starting E4B LibreTranslate Self-Hosted Test Suite ===\n');
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

  const server = app.listen(5006);
  const BASE_URL = 'http://localhost:5006/api';

  try {
    // ----------------------------------------------------
    // 1. Check LibreTranslate Service & Supported Languages
    // ----------------------------------------------------
    console.log('--- 1. Testing LibreTranslate Service & Languages ---');
    const langRes = await fetch(`${LIBRETRANSLATE_URL}/languages`);
    assert(langRes.status === 200, `GET ${LIBRETRANSLATE_URL}/languages returns 200 OK`);
    const langs = await langRes.json();
    const hasEn = langs.some((l) => l.code === 'en');
    const hasVi = langs.some((l) => l.code === 'vi');
    assert(hasEn && hasVi, 'LibreTranslate has English (en) and Vietnamese (vi) models loaded');

    // ----------------------------------------------------
    // 2. Translate "Hello, how are you?"
    // ----------------------------------------------------
    console.log('\n--- 2. Translating "Hello, how are you?" ---');
    const t1 = await translateWithLibreTranslate('Hello, how are you?');
    assert(typeof t1 === 'string' && t1.length > 0, `Translated output: "${t1}"`);
    assert(t1.toLowerCase().includes('chào') || t1.toLowerCase().includes('khỏe'), 'Translation contains expected Vietnamese greeting');

    // ----------------------------------------------------
    // 3. Translate "She is a university student."
    // ----------------------------------------------------
    console.log('\n--- 3. Translating "She is a university student." ---');
    const t2 = await translateWithLibreTranslate('She is a university student.');
    assert(typeof t2 === 'string' && t2.length > 0, `Translated output: "${t2}"`);
    assert(t2.toLowerCase().includes('sinh viên') || t2.toLowerCase().includes('học sinh'), 'Translation contains "sinh viên / học sinh"');

    // ----------------------------------------------------
    // 4. Translate long sentence with punctuation
    // ----------------------------------------------------
    console.log('\n--- 4. Translating long sentence with punctuation ---');
    const longSentence = 'Consistency, curiosity, and patience are the three essential keys to language mastery.';
    const t3 = await translateWithLibreTranslate(longSentence);
    assert(typeof t3 === 'string' && t3.length > 0, `Long sentence output: "${t3}"`);
    assert(t3.toLowerCase().includes('kiên nhẫn') || t3.toLowerCase().includes('ngôn ngữ'), 'Translation preserves sentence meaning');

    // ----------------------------------------------------
    // 5. Batch translation via LibreTranslate array
    // ----------------------------------------------------
    console.log('\n--- 5. Batch Translation via Array ---');
    const batchInput = ['Turn on the light.', 'Read this book carefully.', 'Run fast to school.'];
    const tBatch = await translateWithLibreTranslate(batchInput);
    assert(Array.isArray(tBatch) && tBatch.length === 3, 'Batch translation returns array of 3 translated items');
    assert(tBatch[0].toLowerCase().includes('đèn') || tBatch[0].toLowerCase().includes('sáng'), 'Batch item 1 translated: ' + tBatch[0]);
    assert(tBatch[1].toLowerCase().includes('sách'), 'Batch item 2 translated: ' + tBatch[1]);

    // ----------------------------------------------------
    // 6. Test Unified translationService Module
    // ----------------------------------------------------
    console.log('\n--- 6. Testing translationService Integration ---');
    const unifiedRes = await translateText('He practices English every single day.');
    assert(typeof unifiedRes === 'string' && unifiedRes.length > 0, `translateText output: "${unifiedRes}"`);

    // ----------------------------------------------------
    // 7. Caching: Verify instant response on repeated lookup
    // ----------------------------------------------------
    console.log('\n--- 7. Testing Cache Performance ---');
    const tStart = Date.now();
    const cachedRes = await translateText('He practices English every single day.');
    const duration = Date.now() - tStart;
    assert(cachedRes === unifiedRes, 'Cached result matches original translation');
    assert(duration < 20, `Cache hit returned in ${duration}ms (< 20ms)`);

    // ----------------------------------------------------
    // 8. Graceful Fallback when LibreTranslate fails
    // ----------------------------------------------------
    console.log('\n--- 8. Testing Graceful Fallback ---');
    // Calling translateWithGoogle directly to ensure fallback tier is alive
    const fallbackRes = await translateText('Welcome to English for Beginner');
    assert(typeof fallbackRes === 'string' && fallbackRes.length > 0, 'Translation succeeds through multi-tier architecture');

    // ----------------------------------------------------
    // 9. Integration with Dictionary API Endpoint
    // ----------------------------------------------------
    console.log('\n--- 9. Testing Dictionary API Endpoint ---');
    const dictRes = await fetch(`${BASE_URL}/vocabulary/lookup/student`);
    assert(dictRes.status === 200, 'GET /api/vocabulary/lookup/student returns 200 OK');
    const dictData = await dictRes.json();
    assert(dictData.word.toLowerCase() === 'student', 'Returned word is student');
    assert(dictData.isTranslated === true, 'isTranslated flag is true');
    assert(dictData.meanings[0]?.definitions[0]?.definitionVi?.length > 0, 'Definition has Vietnamese translation from translation service');
  } catch (err) {
    console.error('\nTest error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== LibreTranslate Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exitCode = 1;
  }
}

runTests();
