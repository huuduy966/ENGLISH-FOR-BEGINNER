const fs = require('fs');
const path = require('path');

const a1 = require('../a1');
const a2 = require('../a2');
const b1 = require('../b1');
const b2 = require('../b2');
const c1 = require('../c1');
const c2 = require('../c2');

const PHONEME_MAP = {
  AA0: 'ɑː', AA1: 'ɑː', AA2: 'ɑː',
  AE0: 'æ', AE1: 'æ', AE2: 'æ',
  AH0: 'ə', AH1: 'ʌ', AH2: 'ʌ',
  AO0: 'ɔː', AO1: 'ɔː', AO2: 'ɔː',
  AW0: 'aʊ', AW1: 'aʊ', AW2: 'aʊ',
  AY0: 'aɪ', AY1: 'aɪ', AY2: 'aɪ',
  EH0: 'e', EH1: 'e', EH2: 'e',
  ER0: 'ər', ER1: 'ɜːr', ER2: 'ɜːr',
  EY0: 'eɪ', EY1: 'eɪ', EY2: 'eɪ',
  IH0: 'ɪ', IH1: 'ɪ', IH2: 'ɪ',
  IY0: 'i', IY1: 'iː', IY2: 'iː',
  OW0: 'oʊ', OW1: 'oʊ', OW2: 'oʊ',
  OY0: 'ɔɪ', OY1: 'ɔɪ', OY2: 'ɔɪ',
  UH0: 'ʊ', UH1: 'ʊ', UH2: 'ʊ',
  UW0: 'u', UW1: 'uː', UW2: 'uː',

  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð',
  F: 'f', G: 'ɡ', HH: 'h', JH: 'dʒ',
  K: 'k', L: 'l', M: 'm', N: 'n',
  NG: 'ŋ', P: 'p', R: 'r', S: 's',
  SH: 'ʃ', T: 't', TH: 'θ', V: 'v',
  W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ'
};

function cmuToCambridgeIPA(cmuString) {
  if (!cmuString) return '';
  const tokens = cmuString.trim().split(/\s+/);
  const isVowel = (tok) => /[012]$/.test(tok);

  const vowelIndices = [];
  tokens.forEach((t, i) => { if (isVowel(t)) vowelIndices.push(i); });

  if (vowelIndices.length <= 1) {
    let text = '';
    const hasPrimary = tokens.some(t => t.endsWith('1'));
    if (hasPrimary) text += 'ˈ';
    tokens.forEach(t => { text += PHONEME_MAP[t] || t.toLowerCase(); });
    return text;
  }

  const syllables = [];
  for (let s = 0; s < vowelIndices.length; s++) {
    const vIdx = vowelIndices[s];
    const prevVIdx = s > 0 ? vowelIndices[s - 1] : -1;
    const nextVIdx = s < vowelIndices.length - 1 ? vowelIndices[s + 1] : -1;

    let start = 0;
    if (s === 0) {
      start = 0;
    } else {
      const between = tokens.slice(prevVIdx + 1, vIdx);
      if (between.length === 0) start = vIdx;
      else if (between.length === 1) start = vIdx - 1;
      else if (between.length === 2) {
        const cluster = between.join(' ');
        if (['P R', 'B R', 'T R', 'D R', 'K R', 'G R', 'F R', 'TH R', 'S T', 'S P', 'S K'].includes(cluster)) {
          start = prevVIdx + 1;
        } else {
          start = prevVIdx + 2;
        }
      } else {
        start = prevVIdx + 1 + Math.floor(between.length / 2);
      }
    }

    let end = tokens.length;
    if (nextVIdx !== -1) {
      const between = tokens.slice(vIdx + 1, nextVIdx);
      if (between.length === 0) end = vIdx + 1;
      else if (between.length === 1) end = vIdx + 1;
      else if (between.length === 2) {
        const cluster = between.join(' ');
        if (['P R', 'B R', 'T R', 'D R', 'K R', 'G R', 'F R', 'TH R', 'S T', 'S P', 'S K'].includes(cluster)) {
          end = vIdx + 1;
        } else {
          end = vIdx + 2;
        }
      } else {
        end = vIdx + 1 + Math.floor(between.length / 2);
      }
    }

    syllables.push(tokens.slice(start, end));
  }

  let result = '';
  const hasPrimary = syllables.some(s => s.some(t => t.endsWith('1')));

  for (let i = 0; i < syllables.length; i++) {
    const syl = syllables[i];
    const isPrimary = syl.some(t => t.endsWith('1'));
    const isSecondary = syl.some(t => t.endsWith('2'));

    const markSecondary = isSecondary || (i === 0 && !isPrimary && syllables.length >= 3 && hasPrimary);

    let prefix = '';
    if (isPrimary) {
      prefix = 'ˈ';
    } else if (markSecondary) {
      prefix = 'ˌ';
    } else if (i > 0) {
      prefix = '.';
    }

    result += prefix;
    for (const tok of syl) {
      result += PHONEME_MAP[tok] || tok.toLowerCase();
    }
  }

  return result;
}

// Memory cache to avoid redundant API calls
const singleWordCache = new Map();

async function fetchDatamuseSingleWord(word) {
  const clean = word.toLowerCase().trim().replace(/[^a-z'-]/g, '');
  if (!clean) return null;
  if (singleWordCache.has(clean)) return singleWordCache.get(clean);

  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(clean)}&md=r&max=1`, {
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data[0] && data[0].tags) {
      const pronTag = data[0].tags.find(t => t.startsWith('pron:'));
      if (pronTag) {
        const cmu = pronTag.replace('pron:', '').trim();
        singleWordCache.set(clean, cmu);
        return cmu;
      }
    }
  } catch {
    // Timeout or network error
  }
  return null;
}

async function getCambridgeIPAForPhrase(phrase) {
  const cleanPhrase = phrase.trim();
  const words = cleanPhrase.split(/\s+/).filter(Boolean);

  const ipaParts = [];
  for (const w of words) {
    const cmu = await fetchDatamuseSingleWord(w);
    if (cmu) {
      const ipa = cmuToCambridgeIPA(cmu);
      ipaParts.push(ipa);
    } else {
      // Fallback
      ipaParts.push(w.toLowerCase());
    }
  }

  return `/${ipaParts.join(' ')}/`;
}

async function buildAll() {
  console.log('=== Building Cambridge Standard IPA Dictionary for All Curriculum Words ===');

  const all = [...a1, ...a2, ...b1, ...b2, ...c1, ...c2];
  const uniqueWords = new Set();
  all.forEach(l => {
    l.vocabularies.forEach(v => {
      uniqueWords.add(v.word.trim());
    });
  });

  // Also include dictatorially
  uniqueWords.add('dictatorially');

  const wordList = Array.from(uniqueWords);
  console.log(`Total unique vocabulary words and expressions to process: ${wordList.length}`);

  const dictResult = {};
  const batchSize = 12;

  for (let i = 0; i < wordList.length; i += batchSize) {
    const batch = wordList.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (word) => {
        try {
          const ipa = await getCambridgeIPAForPhrase(word);
          dictResult[word.toLowerCase().trim()] = ipa;
        } catch (e) {
          console.error(`Error on word "${word}":`, e.message);
          dictResult[word.toLowerCase().trim()] = `/${word.toLowerCase().trim()}/`;
        }
      })
    );

    if ((i + batchSize) % 120 === 0 || i + batchSize >= wordList.length) {
      console.log(`Processed ${Math.min(i + batchSize, wordList.length)} / ${wordList.length} words...`);
    }
  }

  // Ensure dictatorially is specifically mapped
  dictResult['dictatorially'] = '/ˌdɪk.təˈtɔː.ri.ə.li/';

  const outputPath = path.join(__dirname, 'ipaDictionary.json');
  fs.writeFileSync(outputPath, JSON.stringify(dictResult, null, 2), 'utf-8');
  console.log(`Successfully saved ${Object.keys(dictResult).length} words to ${outputPath}`);
}

buildAll();
