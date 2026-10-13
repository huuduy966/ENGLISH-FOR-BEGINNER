// translationService.js - Robust Multi-Tier Translation Service (EN -> VI)
// Priority:
// 1. Verified Translation Memory (TM - Hand-curated & approved curriculum sentences)
// 2. Contextual Machine Translation (Google Translate Public Endpoint)
// 3. Self-Hosted LibreTranslate (en -> vi, 127.0.0.1:5001)
// 4. MyMemory Translation API (Safety Net)
// 5. In-Memory & Persistent Disk Cache

const fs = require('fs');
const path = require('path');

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'http://127.0.0.1:5001';

// -----------------------------------------------------------------------------
// VERIFIED TRANSLATION MEMORY (TM)
// -----------------------------------------------------------------------------
const TM_FILE = path.join(__dirname, '..', 'data', 'verifiedTranslationMemory.json');
const verifiedTm = new Map();

function normalizeTmKey(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ');
}

function loadVerifiedTm() {
  try {
    if (fs.existsSync(TM_FILE)) {
      const raw = fs.readFileSync(TM_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const entries = parsed.entries || parsed;
      for (const [k, v] of Object.entries(entries)) {
        if (typeof v === 'string') {
          verifiedTm.set(normalizeTmKey(k), v.trim());
        }
      }
    }
  } catch (err) {
    console.warn('Could not load verified translation memory:', err.message);
  }
}

loadVerifiedTm();

function getVerifiedTranslation(text) {
  if (!text || typeof text !== 'string') return null;
  const norm = normalizeTmKey(text);
  if (!norm) return null;

  // 1. Direct normalized match
  if (verifiedTm.has(norm)) {
    return verifiedTm.get(norm);
  }

  // 2. Tolerance for trailing punctuation
  const variations = [
    norm + '?',
    norm + '.',
    norm + '!',
    norm.replace(/[.?!]+$/, ''),
  ];

  for (const v of variations) {
    if (verifiedTm.has(v)) {
      return verifiedTm.get(v);
    }
  }

  return null;
}

function addVerifiedTranslation(sourceText, targetText) {
  if (!sourceText || !targetText) return false;
  const normKey = normalizeTmKey(sourceText);
  const cleanTarget = targetText.trim();
  verifiedTm.set(normKey, cleanTarget);

  try {
    let fileObj = { _metadata: { version: '1.0' }, entries: {} };
    if (fs.existsSync(TM_FILE)) {
      fileObj = JSON.parse(fs.readFileSync(TM_FILE, 'utf-8'));
      if (!fileObj.entries) fileObj.entries = {};
    }
    fileObj.entries[normKey] = cleanTarget;
    fs.writeFileSync(TM_FILE, JSON.stringify(fileObj, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Could not persist verified translation memory:', err.message);
    return false;
  }
}

// -----------------------------------------------------------------------------
// IN-MEMORY & PERSISTENT DISK CACHE FOR MACHINE TRANSLATION
// -----------------------------------------------------------------------------
const memCache = new Map();
const CACHE_FILE = path.join(__dirname, '..', 'data', 'dictTranslationCache.json');

try {
  const dataDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      memCache.set(k.toLowerCase().trim(), v);
    }
  }
} catch (err) {
  console.warn('Could not initialize translation cache file:', err.message);
}

// Debounced cache persistence to avoid heavy disk I/O
let persistTimer = null;
function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const obj = {};
      for (const [k, v] of memCache.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to persist translation cache to disk:', err.message);
    }
  }, 1500);
}

// -----------------------------------------------------------------------------
// TRANSLATION ENGINES
// -----------------------------------------------------------------------------

/**
 * Self-Hosted LibreTranslate API (127.0.0.1:5001)
 */
async function translateWithLibreTranslate(textOrArray, from = 'en', to = 'vi') {
  if (!LIBRETRANSLATE_URL) throw new Error('No LibreTranslate URL configured');
  const res = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: textOrArray,
      source: from,
      target: to,
      format: 'text',
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}`);
  const data = await res.json();
  if (data?.translatedText !== undefined) {
    return data.translatedText;
  }
  throw new Error('Malformed LibreTranslate response');
}

/**
 * Contextual Translation Engine (Google Translate Public Endpoint)
 */
async function translateWithGoogle(text, from = 'en', to = 'vi') {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Google Translate error HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Malformed Google Translate response');
  }
  return data[0].map((item) => item[0]).join('');
}

/**
 * Fallback Translation Engine (MyMemory Translation API)
 */
async function translateWithMyMemory(text, from = 'en', to = 'vi') {
  if (text.length > 400) {
    const chunks = text.split(/(?<=[.!?\n])\s+/).filter(Boolean);
    const translatedChunks = [];
    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const res = await translateWithMyMemory(chunk.trim(), from, to);
      translatedChunks.push(res);
    }
    return translatedChunks.join(' ');
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`MyMemory Translate error HTTP ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || translated.startsWith('MYMEMORY WARNING')) {
    throw new Error('MyMemory invalid or quota exceeded');
  }
  return translated;
}

// -----------------------------------------------------------------------------
// MULTI-TIER TRANSLATION PIPELINE
// -----------------------------------------------------------------------------

/**
 * Translates text with detailed metadata including verification status and source
 * @param {string} text - Source text in English
 * @returns {Promise<{
 *   translatedText: string,
 *   confidence: 'verified' | 'machine',
 *   source: string,
 *   isVerified: boolean,
 *   isUnavailable: boolean
 * }>}
 */
async function translateWithDetails(text) {
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      confidence: 'verified',
      source: 'None',
      isVerified: false,
      isUnavailable: false,
    };
  }

  const clean = text.replace(/\r\n/g, '\n').trim();

  // Tier 1: Check Verified Translation Memory (Highest priority)
  const tmHit = getVerifiedTranslation(clean);
  if (tmHit) {
    return {
      translatedText: tmHit,
      confidence: 'verified',
      source: 'TranslationMemory',
      isVerified: true,
      isUnavailable: false,
    };
  }

  // Tier 2: Check Machine Cache
  const cacheKey = clean.toLowerCase();
  if (memCache.has(cacheKey)) {
    return {
      translatedText: memCache.get(cacheKey),
      confidence: 'machine',
      source: 'Cache',
      isVerified: false,
      isUnavailable: false,
    };
  }

  let translated = '';
  let usedSource = 'None';

  // Tier 3: Contextual Engine (Google Translate)
  try {
    const ggRes = await translateWithGoogle(clean);
    if (ggRes && typeof ggRes === 'string' && ggRes.trim()) {
      translated = ggRes.trim();
      usedSource = 'Google';
    }
  } catch (errGg) {
    // Tier 4: Self-Hosted LibreTranslate (Fallback)
    try {
      const ltRes = await translateWithLibreTranslate(clean);
      if (typeof ltRes === 'string' && ltRes.trim()) {
        translated = ltRes.trim();
        usedSource = 'LibreTranslate';
      }
    } catch (errLt) {
      // Tier 5: MyMemory API (Safety Net)
      try {
        const mmRes = await translateWithMyMemory(clean);
        if (typeof mmRes === 'string' && mmRes.trim()) {
          translated = mmRes.trim();
          usedSource = 'MyMemory';
        }
      } catch (errMm) {
        console.warn(`All translation tiers failed for "${clean.slice(0, 30)}":`, errMm.message);
        return {
          translatedText: clean,
          confidence: 'machine',
          source: 'Fallback',
          isVerified: false,
          isUnavailable: true,
        };
      }
    }
  }

  if (translated && translated.trim()) {
    const finalTrans = translated.trim();
    memCache.set(cacheKey, finalTrans);
    schedulePersist();
    return {
      translatedText: finalTrans,
      confidence: 'machine',
      source: usedSource,
      isVerified: false,
      isUnavailable: false,
    };
  }

  return {
    translatedText: clean,
    confidence: 'machine',
    source: 'Fallback',
    isVerified: false,
    isUnavailable: true,
  };
}

/**
 * Backward-compatible single-string translation
 * @param {string} text - Source text in English
 * @returns {Promise<string>} Translated text in Vietnamese
 */
async function translateText(text) {
  const details = await translateWithDetails(text);
  return details.translatedText;
}

/**
 * Batch translates an array of strings
 * @param {string[]} texts - Array of strings to translate
 * @returns {Promise<string[]>} Array of translated strings
 */
async function translateBatch(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const results = new Array(texts.length).fill('');
  const toTranslateIndices = [];
  const toTranslateTexts = [];

  // Check TM and cache first for individual items
  texts.forEach((txt, idx) => {
    if (!txt || !txt.trim()) {
      results[idx] = '';
      return;
    }
    const clean = txt.trim();

    // Check TM
    const tmHit = getVerifiedTranslation(clean);
    if (tmHit) {
      results[idx] = tmHit;
      return;
    }

    // Check Cache
    const cacheKey = clean.toLowerCase();
    if (memCache.has(cacheKey)) {
      results[idx] = memCache.get(cacheKey);
    } else {
      toTranslateIndices.push(idx);
      toTranslateTexts.push(clean);
    }
  });

  if (toTranslateTexts.length === 0) {
    return results;
  }

  // 1. Try LibreTranslate Native Batching
  let batchTranslated = null;
  try {
    const ltRes = await translateWithLibreTranslate(toTranslateTexts);
    if (Array.isArray(ltRes) && ltRes.length === toTranslateTexts.length) {
      batchTranslated = ltRes;
    }
  } catch (errLt) {
    // 2. Try Google Translate joined batch
    try {
      const SEPARATOR = '\n---E4B_SEP---\n';
      const joinedText = toTranslateTexts.join(SEPARATOR);
      const googleJoined = await translateWithGoogle(joinedText);
      const parts = googleJoined.split(/\s*---E4B_SEP---\s*/);
      if (parts.length === toTranslateTexts.length) {
        batchTranslated = parts;
      }
    } catch (errGg) {
      // Fallback: return original
      for (let i = 0; i < toTranslateTexts.length; i++) {
        results[toTranslateIndices[i]] = toTranslateTexts[i];
      }
      return results;
    }
  }

  if (Array.isArray(batchTranslated)) {
    for (let i = 0; i < toTranslateTexts.length; i++) {
      const orig = toTranslateTexts[i];
      const trans = batchTranslated[i] ? batchTranslated[i].trim() : orig;
      results[toTranslateIndices[i]] = trans;

      if (trans && trans !== orig) {
        memCache.set(orig.toLowerCase(), trans);
      }
    }
    schedulePersist();
  }

  return results;
}

module.exports = {
  LIBRETRANSLATE_URL,
  translateWithLibreTranslate,
  translateWithGoogle,
  translateWithMyMemory,
  translateWithDetails,
  translateText,
  translateBatch,
  getVerifiedTranslation,
  addVerifiedTranslation,
};
