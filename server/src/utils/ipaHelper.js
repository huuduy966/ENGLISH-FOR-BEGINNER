const fs = require('fs');
const path = require('path');

const ipaDictPath = path.join(__dirname, '../../prisma/curriculum/generators/ipaDictionary.json');
let ipaDictionary = {};
try {
  ipaDictionary = JSON.parse(fs.readFileSync(ipaDictPath, 'utf-8'));
} catch (e) {
  console.warn('Could not load ipaDictionary.json:', e.message);
}

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

// Convert any word or phrase into Cambridge-style IPA
async function getCambridgeIPA(wordOrPhrase) {
  if (!wordOrPhrase) return '';
  const clean = wordOrPhrase.toLowerCase().trim();

  // 1. Direct dictionary match
  if (ipaDictionary[clean]) {
    return ipaDictionary[clean];
  }

  // 2. Multi-word phrase or compound
  const words = clean.split(/\s+/).filter(Boolean);
  const parts = [];

  for (const w of words) {
    if (ipaDictionary[w]) {
      parts.push(ipaDictionary[w].replace(/^\/|\/$/g, ''));
    } else {
      try {
        const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(w)}&md=r&max=1`, {
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].tags) {
            const pronTag = data[0].tags.find((t) => t.startsWith('pron:'));
            if (pronTag) {
              const cmu = pronTag.replace('pron:', '').trim();
              const ipa = cmuToCambridgeIPA(cmu);
              ipaDictionary[w] = `/${ipa}/`;
              parts.push(ipa);
              continue;
            }
          }
        }
      } catch {}
      parts.push(w);
    }
  }

  const result = `/${parts.join(' ')}/`;
  ipaDictionary[clean] = result;
  return result;
}

function getCachedIPA(wordOrPhrase) {
  if (!wordOrPhrase) return '';
  const clean = wordOrPhrase.toLowerCase().trim();
  return ipaDictionary[clean] || null;
}

module.exports = {
  getCambridgeIPA,
  getCachedIPA,
  ipaDictionary,
  cmuToCambridgeIPA,
};
