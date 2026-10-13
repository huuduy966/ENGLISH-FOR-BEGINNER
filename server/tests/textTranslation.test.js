// textTranslation.test.js - Comprehensive Test Suite for Dictionary & Sentence/Paragraph Translation
// Verifies all 8 required scenarios:
// 1. Single word: "hello"
// 2. Phrase: "take care of"
// 3. Short sentence: "I go to school every day."
// 4. Long complex sentence: "Although it was raining, we decided to go out because we had already bought the tickets."
// 5. Multi-sentence paragraph with punctuation and newlines
// 6. Very long text handling and limit checks (up to 5,000 characters and > 5,000 chars rejection)
// 7. Punctuation, quotes (" ' ’ “ ”), and whitespace handling
// 8. Resilient fallback handling

process.env.NODE_ENV = 'test';
process.env.PORT = '5006';

const app = require('../src/app');

async function runTests() {
  console.log('=== Starting E4B Dictionary & Text Translation Test Suite ===\n');
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
    // -------------------------------------------------------------------------
    // Test Case 1: Single Word Dictionary Lookup ("hello")
    // -------------------------------------------------------------------------
    console.log('--- Test Case 1: Single Word ("hello") ---');
    const helloRes = await fetch(`${BASE_URL}/vocabulary/lookup/hello`);
    const helloData = await helloRes.json();
    assert(helloRes.status === 200, 'GET /api/vocabulary/lookup/hello returns 200 OK');
    assert(helloData.word.toLowerCase() === 'hello', 'Word is "hello"');
    assert(!!helloData.phonetic, 'Phonetic IPA is present');
    assert(!!helloData.vietnameseMeaning, 'Vietnamese meaning is present: ' + helloData.vietnameseMeaning);

    // Also test translation endpoint with single word
    const helloTransRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
    const helloTransData = await helloTransRes.json();
    assert(helloTransRes.status === 200, 'POST /api/vocabulary/translate for "hello" returns 200 OK');
    assert(helloTransData.translatedText.toLowerCase().includes('chào'), 'Translation of "hello" contains "chào": ' + helloTransData.translatedText);
    assert(helloTransData.detectedType === 'word', 'Detected type is "word"');

    // -------------------------------------------------------------------------
    // Test Case 2: Phrasal Verb / Idiom ("take care of")
    // -------------------------------------------------------------------------
    console.log('\n--- Test Case 2: Phrase ("take care of") ---');
    const phraseRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'take care of' }),
    });
    const phraseData = await phraseRes.json();
    assert(phraseRes.status === 200, 'POST /api/vocabulary/translate for phrase returns 200 OK');
    assert(phraseData.translatedText.toLowerCase().includes('chăm sóc'), 'Translation of "take care of" is "chăm sóc": ' + phraseData.translatedText);
    assert(phraseData.detectedType === 'phrase', 'Detected type is "phrase"');
    assert(phraseData.wordCount === 3, 'Word count is 3');

    // -------------------------------------------------------------------------
    // Test Case 3: Short Sentence ("I go to school every day.")
    // -------------------------------------------------------------------------
    console.log('\n--- Test Case 3: Short Sentence ("I go to school every day.") ---');
    const shortRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I go to school every day.' }),
    });
    const shortData = await shortRes.json();
    assert(shortRes.status === 200, 'POST /api/vocabulary/translate for short sentence returns 200 OK');
    assert(shortData.translatedText.toLowerCase().includes('đi học'), 'Translation contains "đi học": ' + shortData.translatedText);
    assert(shortData.detectedType === 'sentence', 'Detected type is "sentence"');

    // Also test fallback routing in GET /api/vocabulary/lookup/:word
    const shortLookupRes = await fetch(`${BASE_URL}/vocabulary/lookup/${encodeURIComponent('I go to school every day.')}`);
    const shortLookupData = await shortLookupRes.json();
    assert(shortLookupRes.status === 200, 'GET /api/vocabulary/lookup/ with sentence gracefully translates without 404');
    assert(shortLookupData.vietnameseMeaning.toLowerCase().includes('đi học'), 'Sentence fallback meaning contains "đi học"');

    // -------------------------------------------------------------------------
    // Test Case 4: Long Complex Sentence
    // -------------------------------------------------------------------------
    console.log('\n--- Test Case 4: Long Complex Sentence ---');
    const complexSentence = 'Although it was raining, we decided to go out because we had already bought the tickets.';
    const complexRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: complexSentence }),
    });
    const complexData = await complexRes.json();
    assert(complexRes.status === 200, 'POST /api/vocabulary/translate for complex sentence returns 200 OK');
    assert(complexData.translatedText.toLowerCase().includes('mưa') && complexData.translatedText.toLowerCase().includes('vé'), 'Complex translation preserves full clauses (mưa, vé): ' + complexData.translatedText);
    assert(complexData.wordCount === 16, 'Word count is 16');

    // -------------------------------------------------------------------------
    // Test Case 5: Multi-sentence Paragraph with Punctuation and Newlines
    // -------------------------------------------------------------------------
    console.log('\n--- Test Case 5: Paragraph with Newlines ---');
    const paragraphText = 'English is an essential language for international communication.\nIt helps you connect with friends worldwide and advance your career.\nPractice consistently every day to achieve fluency.';
    const paraRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: paragraphText }),
    });
    const paraData = await paraRes.json();
    assert(paraRes.status === 200, 'POST /api/vocabulary/translate for paragraph returns 200 OK');
    assert(paraData.translatedText.includes('\n'), 'Translated paragraph preserves newlines structure');
    assert(paraData.detectedType === 'paragraph', 'Detected type is "paragraph"');

    // -------------------------------------------------------------------------
    // Test Case 6: Very Long Text & Limit Validation
    // -------------------------------------------------------------------------
    console.log('\n--- Test Case 6: Long Text & Over-limit Validation ---');
    // Sub-test 6a: Valid long text (~1000 characters)
    const longText = 'Learning English as a second language provides enormous advantages in modern life. '.repeat(12);
    const longRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: longText }),
    });
    const longData = await longRes.json();
    assert(longRes.status === 200, 'Translating 1000-character long text succeeds');
    assert(!!longData.translatedText && longData.translatedText.length > 200, 'Long translated text returned in full');

    // Sub-test 6b: Exceeding 5,000 characters rejects with 400 and clear message
    const overLimitText = 'A'.repeat(5001);
    const overLimitRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: overLimitText }),
    });
    const overLimitData = await overLimitRes.json();
    assert(overLimitRes.status === 400, 'Over 5,000 characters is rejected with 400 Bad Request');
    assert(overLimitData.message.includes('5.000 ký tự'), 'Error message clearly specifies 5.000 character limit');

    // -------------------------------------------------------------------------
    // Test Case 7: Punctuation, Quotes (" ' ’ “ ”), and Extra Whitespace
    // -------------------------------------------------------------------------
    console.log('\n--- Test Case 7: Punctuation & Quotes ---');
    const quoteText = '   "Don\'t worry," she said, "everything\'s going to be alright!"   ';
    const quoteRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: quoteText }),
    });
    const quoteData = await quoteRes.json();
    assert(quoteRes.status === 200, 'Translating text with quotes and irregular spaces succeeds');
    assert(quoteData.originalText.startsWith('"Don\'t'), 'Original text whitespace was cleanly trimmed');
    assert(quoteData.translatedText.length > 5, 'Translation produced: ' + quoteData.translatedText);

    // -------------------------------------------------------------------------
    // Test Case 8: Empty text validation
    // -------------------------------------------------------------------------
    console.log('\n--- Test Case 8: Empty Text Validation ---');
    const emptyRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' }),
    });
    assert(emptyRes.status === 400, 'Empty text returns 400 Bad Request');

  } catch (err) {
    console.error('\nUnexpected test error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=== Test Suite Finished: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) process.exitCode = 1;
  }
}

runTests();
