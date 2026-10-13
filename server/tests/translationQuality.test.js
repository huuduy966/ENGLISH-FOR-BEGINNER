// translationQuality.test.js - Quality & Semantic Verification Suite for English-Vietnamese Translation
// Tests:
// 1. "How old is he?" -> "Anh ấy bao nhiêu tuổi?" (Strictly verified, never "Nó bao nhiêu tuổi?")
// 2. "How old is she?" -> "Cô ấy bao nhiêu tuổi?"
// 3. "He is my brother." -> Brother relationship without inventing age details
// 4. "It is raining heavily." -> Natural rain expression (mưa to / mưa rất to)
// 5. "I don't think he is right." -> Preserves negation and pronoun
// 6. "Although it was raining, we decided to go out." -> Preserves concessive clause relationship
// 7. "She has been working here for five years." -> Preserves duration (5 years)
// 8. Multi-sentence paragraph with pronouns, punctuation, and clause relationships
// 9. Verified badge & metadata integrity (confidence, isVerified, wordCount, charCount)

process.env.NODE_ENV = 'test';
process.env.PORT = '5008';

const app = require('../src/app');

async function runTests() {
  console.log('=== Starting E4B Translation Quality & Naturalness Test Suite ===\n');
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

  const server = app.listen(5008);
  const BASE_URL = 'http://localhost:5008/api';

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: "How old is he?" -> "Anh ấy bao nhiêu tuổi?"
    // -------------------------------------------------------------------------
    console.log('--- Scenario 1: "How old is he?" ---');
    const res1 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'How old is he?' }),
    });
    const data1 = await res1.json();
    assert(res1.status === 200, 'POST /api/vocabulary/translate returns 200');
    assert(data1.translatedText === 'Anh ấy bao nhiêu tuổi?', `Translated output is exact: "${data1.translatedText}"`);
    assert(!data1.translatedText.toLowerCase().includes('nó'), 'Does NOT translate "he" pejoratively as "nó"');
    assert(data1.isVerified === true, 'Flagged as isVerified: true (from Translation Memory)');
    assert(data1.confidence === 'verified', 'Confidence level is "verified"');
    assert(data1.confidenceLabel === 'Bản dịch đã xác nhận', 'Confidence label is "Bản dịch đã xác nhận"');

    // Also test case-insensitive without trailing punctuation
    const res1b = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'how old is he' }),
    });
    const data1b = await res1b.json();
    assert(data1b.translatedText === 'Anh ấy bao nhiêu tuổi?', `Case & punctuation tolerant lookup: "${data1b.translatedText}"`);
    assert(data1b.isVerified === true, 'Punctuation-tolerant lookup retains verified status');

    // -------------------------------------------------------------------------
    // Scenario 2: "How old is she?" -> "Cô ấy bao nhiêu tuổi?"
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 2: "How old is she?" ---');
    const res2 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'How old is she?' }),
    });
    const data2 = await res2.json();
    assert(res2.status === 200, 'POST /api/vocabulary/translate returns 200');
    assert(data2.translatedText === 'Cô ấy bao nhiêu tuổi?', `Translated output is exact: "${data2.translatedText}"`);
    assert(data2.isVerified === true, 'Flagged as isVerified: true');

    // -------------------------------------------------------------------------
    // Scenario 3: "He is my brother."
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 3: "He is my brother." ---');
    const res3 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'He is my brother.' }),
    });
    const data3 = await res3.json();
    const t3 = data3.translatedText.toLowerCase();
    assert(res3.status === 200, 'POST /api/vocabulary/translate returns 200');
    assert(t3.includes('anh') || t3.includes('em trai'), `Translated output conveys brother relation: "${data3.translatedText}"`);
    assert(!t3.includes('nó'), 'Does NOT use "nó" for brother');
    assert(data3.isVerified === true, 'Verified TM entry used');

    // -------------------------------------------------------------------------
    // Scenario 4: "It is raining heavily."
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: "It is raining heavily." ---');
    const res4 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'It is raining heavily.' }),
    });
    const data4 = await res4.json();
    const t4 = data4.translatedText.toLowerCase();
    assert(res4.status === 200, 'POST /api/vocabulary/translate returns 200');
    assert(t4.includes('mưa to') || t4.includes('mưa rất to'), `Natural rain description: "${data4.translatedText}"`);
    assert(t4.includes('trời') || t4.includes('đang mưa'), 'Proper weather context subject');

    // -------------------------------------------------------------------------
    // Scenario 5: "I don't think he is right." (Negation & Pronoun)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: "I don\'t think he is right." ---');
    const res5 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "I don't think he is right." }),
    });
    const data5 = await res5.json();
    const t5 = data5.translatedText.toLowerCase();
    assert(res5.status === 200, 'POST /api/vocabulary/translate returns 200');
    assert(t5.includes('không nghĩ') || t5.includes('không cho rằng'), `Preserves negation: "${data5.translatedText}"`);
    assert(t5.includes('anh ấy đúng') || t5.includes('ông ấy đúng'), 'Preserves correct pronoun and meaning');

    // -------------------------------------------------------------------------
    // Scenario 6: "Although it was raining, we decided to go out." (Concessive Clause)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 6: "Although it was raining, we decided to go out." ---');
    const res6 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Although it was raining, we decided to go out.' }),
    });
    const data6 = await res6.json();
    const t6 = data6.translatedText.toLowerCase();
    assert(res6.status === 200, 'POST /api/vocabulary/translate returns 200');
    assert(t6.includes('mặc dù') || t6.includes('dù'), `Preserves concessive relationship (mặc dù / dù): "${data6.translatedText}"`);
    assert(t6.includes('quyết định') || t6.includes('ra ngoài') || t6.includes('đi chơi'), 'Preserves action clause');

    // -------------------------------------------------------------------------
    // Scenario 7: "She has been working here for five years." (Duration)
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 7: "She has been working here for five years." ---');
    const res7 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'She has been working here for five years.' }),
    });
    const data7 = await res7.json();
    const t7 = data7.translatedText.toLowerCase();
    assert(res7.status === 200, 'POST /api/vocabulary/translate returns 200');
    assert(t7.includes('cô ấy'), 'Refers politely as cô ấy');
    assert(t7.includes('làm việc ở đây') || t7.includes('làm việc tại đây'), 'Preserves location and action');
    assert(t7.includes('5 năm') || t7.includes('năm năm'), `Preserves 5-year duration: "${data7.translatedText}"`);

    // -------------------------------------------------------------------------
    // Scenario 8: Multi-sentence Paragraph with Pronouns and Newlines
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Multi-sentence Paragraph ---');
    const paragraphText =
      'My name is Nam and I am a university student.\nHe is my teacher and she is a nurse.\nWe enjoy learning English together every morning.';
    const res8 = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: paragraphText }),
    });
    const data8 = await res8.json();
    assert(res8.status === 200, 'POST /api/vocabulary/translate for paragraph returns 200');
    assert(data8.translatedText.includes('\n'), 'Preserves newline formatting across paragraphs');
    assert(data8.detectedType === 'paragraph', 'Detected type is "paragraph"');
    assert(data8.wordCount > 15, `Word count calculated: ${data8.wordCount}`);

    // -------------------------------------------------------------------------
    // Scenario 9: Dictionary Lookup Fallback with Sentence
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Dictionary Lookup Fallback for "How old is he?" ---');
    const res9 = await fetch(`${BASE_URL}/vocabulary/lookup/${encodeURIComponent('How old is he?')}`);
    const data9 = await res9.json();
    assert(res9.status === 200, 'GET /api/vocabulary/lookup/ with "How old is he?" returns 200');
    assert(data9.vietnameseMeaning === 'Anh ấy bao nhiêu tuổi?', `Lookup returns verified meaning: "${data9.vietnameseMeaning}"`);
    assert(data9.isVerified === true, 'Lookup metadata flags isVerified: true');
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
