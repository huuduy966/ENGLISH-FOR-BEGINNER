const prisma = require('../db');
const { getCambridgeIPA } = require('../utils/ipaHelper');

// In-Memory Cache for Dictionary Lookups
const dictionaryCache = new Map();
const MAX_CACHE_SIZE = 1000;

function setDictCache(key, value) {
  if (dictionaryCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = dictionaryCache.keys().next().value;
    dictionaryCache.delete(oldestKey);
  }
  dictionaryCache.set(key.toLowerCase(), value);
}

function getDictCache(key) {
  return dictionaryCache.get(key.toLowerCase());
}

// Local Database In-Memory Index for Instant 0ms Match
let localVocabMap = new Map();
let isMapInitialized = false;

async function ensureLocalVocabMap() {
  if (isMapInitialized && localVocabMap.size > 0) return;
  try {
    const all = await prisma.vocabulary.findMany();
    const nextMap = new Map();
    for (const v of all) {
      nextMap.set(v.word.toLowerCase().trim(), v);
    }
    localVocabMap = nextMap;
    isMapInitialized = true;
  } catch (err) {
    console.warn('Failed to load local vocabulary index:', err.message);
  }
}

// Run warm-up
ensureLocalVocabMap();

// Irregular Inflection Map for English Learners
const INFLECTION_MAP = {
  // Irregular verbs
  went: { base: 'go', label: "Quá khứ của 'go' (Đi)", pos: 'verb' },
  gone: { base: 'go', label: "Quá khứ phân từ của 'go' (Đi)", pos: 'verb' },
  came: { base: 'come', label: "Quá khứ của 'come' (Đến)", pos: 'verb' },
  did: { base: 'do', label: "Quá khứ của 'do' (Làm)", pos: 'verb' },
  done: { base: 'do', label: "Quá khứ phân từ của 'do' (Làm)", pos: 'verb' },
  had: { base: 'have', label: "Quá khứ của 'have' (Có)", pos: 'verb' },
  was: { base: 'be', label: "Quá khứ số ít của 'be' (Thì, là, ở)", pos: 'verb' },
  were: { base: 'be', label: "Quá khứ số nhiều của 'be' (Thì, là, ở)", pos: 'verb' },
  been: { base: 'be', label: "Quá khứ phân từ của 'be' (Thì, là, ở)", pos: 'verb' },
  made: { base: 'make', label: "Quá khứ của 'make' (Làm, chế tạo)", pos: 'verb' },
  said: { base: 'say', label: "Quá khứ của 'say' (Nói)", pos: 'verb' },
  took: { base: 'take', label: "Quá khứ của 'take' (Lấy, cầm)", pos: 'verb' },
  taken: { base: 'take', label: "Quá khứ phân từ của 'take' (Lấy)", pos: 'verb' },
  saw: { base: 'see', label: "Quá khứ của 'see' (Nhìn thấy)", pos: 'verb' },
  seen: { base: 'see', label: "Quá khứ phân từ của 'see' (Nhìn thấy)", pos: 'verb' },
  knew: { base: 'know', label: "Quá khứ của 'know' (Biết)", pos: 'verb' },
  known: { base: 'know', label: "Quá khứ phân từ của 'know' (Biết)", pos: 'verb' },
  got: { base: 'get', label: "Quá khứ của 'get' (Nhận được)", pos: 'verb' },
  gotten: { base: 'get', label: "Quá khứ phân từ của 'get'", pos: 'verb' },
  gave: { base: 'give', label: "Quá khứ của 'give' (Cho, tặng)", pos: 'verb' },
  given: { base: 'give', label: "Quá khứ phân từ của 'give'", pos: 'verb' },
  found: { base: 'find', label: "Quá khứ của 'find' (Tìm thấy)", pos: 'verb' },
  thought: { base: 'think', label: "Quá khứ của 'think' (Suy nghĩ)", pos: 'verb' },
  told: { base: 'tell', label: "Quá khứ của 'tell' (Kể, bảo)", pos: 'verb' },
  became: { base: 'become', label: "Quá khứ của 'become' (Trở thành)", pos: 'verb' },
  left: { base: 'leave', label: "Quá khứ của 'leave' (Rời đi / Còn lại)", pos: 'verb' },
  felt: { base: 'feel', label: "Quá khứ của 'feel' (Cảm thấy)", pos: 'verb' },
  brought: { base: 'bring', label: "Quá khứ của 'bring' (Mang theo)", pos: 'verb' },
  began: { base: 'begin', label: "Quá khứ của 'begin' (Bắt đầu)", pos: 'verb' },
  begun: { base: 'begin', label: "Quá khứ phân từ của 'begin'", pos: 'verb' },
  kept: { base: 'keep', label: "Quá khứ của 'keep' (Giữ)", pos: 'verb' },
  held: { base: 'hold', label: "Quá khứ của 'hold' (Cầm, nắm, tổ chức)", pos: 'verb' },
  wrote: { base: 'write', label: "Quá khứ của 'write' (Viết)", pos: 'verb' },
  written: { base: 'write', label: "Quá khứ phân từ của 'write'", pos: 'verb' },
  stood: { base: 'stand', label: "Quá khứ của 'stand' (Đứng)", pos: 'verb' },
  heard: { base: 'hear', label: "Quá khứ của 'hear' (Nghe)", pos: 'verb' },
  met: { base: 'meet', label: "Quá khứ của 'meet' (Gặp gỡ)", pos: 'verb' },
  ran: { base: 'run', label: "Quá khứ của 'run' (Chạy)", pos: 'verb' },
  paid: { base: 'pay', label: "Quá khứ của 'pay' (Thanh toán)", pos: 'verb' },
  sat: { base: 'sit', label: "Quá khứ của 'sit' (Ngồi)", pos: 'verb' },
  spoke: { base: 'speak', label: "Quá khứ của 'speak' (Nói)", pos: 'verb' },
  spoken: { base: 'speak', label: "Quá khứ phân từ của 'speak'", pos: 'verb' },
  lost: { base: 'lose', label: "Quá khứ của 'lose' (Đánh mất, thua)", pos: 'verb' },
  fell: { base: 'fall', label: "Quá khứ của 'fall' (Ngã, rơi)", pos: 'verb' },
  fallen: { base: 'fall', label: "Quá khứ phân từ của 'fall'", pos: 'verb' },
  sent: { base: 'send', label: "Quá khứ của 'send' (Gửi)", pos: 'verb' },
  built: { base: 'build', label: "Quá khứ của 'build' (Xây dựng)", pos: 'verb' },
  understood: { base: 'understand', label: "Quá khứ của 'understand' (Hiểu)", pos: 'verb' },
  drew: { base: 'draw', label: "Quá khứ của 'draw' (Vẽ)", pos: 'verb' },
  drawn: { base: 'draw', label: "Quá khứ phân từ của 'draw'", pos: 'verb' },
  broke: { base: 'break', label: "Quá khứ của 'break' (Làm vỡ, hỏng)", pos: 'verb' },
  broken: { base: 'break', label: "Quá khứ phân từ của 'break'", pos: 'verb' },
  spent: { base: 'spend', label: "Quá khứ của 'spend' (Tiêu dùng, dành thời gian)", pos: 'verb' },
  bought: { base: 'buy', label: "Quá khứ của 'buy' (Mua)", pos: 'verb' },
  wore: { base: 'wear', label: "Quá khứ của 'wear' (Mặc)", pos: 'verb' },
  worn: { base: 'wear', label: "Quá khứ phân từ của 'wear'", pos: 'verb' },
  chose: { base: 'choose', label: "Quá khứ của 'choose' (Lựa chọn)", pos: 'verb' },
  chosen: { base: 'choose', label: "Quá khứ phân từ của 'choose'", pos: 'verb' },
  taught: { base: 'teach', label: "Quá khứ của 'teach' (Dạy học)", pos: 'verb' },
  caught: { base: 'catch', label: "Quá khứ của 'catch' (Bắt, đón)", pos: 'verb' },
  ate: { base: 'eat', label: "Quá khứ của 'eat' (Ăn)", pos: 'verb' },
  eaten: { base: 'eat', label: "Quá khứ phân từ của 'eat'", pos: 'verb' },
  drank: { base: 'drink', label: "Quá khứ của 'drink' (Uống)", pos: 'verb' },
  drunk: { base: 'drink', label: "Quá khứ phân từ của 'drink'", pos: 'verb' },
  slept: { base: 'sleep', label: "Quá khứ của 'sleep' (Ngủ)", pos: 'verb' },

  // Irregular comparatives / superlatives
  better: { base: 'good', label: "Dạng so sánh hơn của 'good' (Tốt hơn) / 'well'", pos: 'adjective' },
  best: { base: 'good', label: "Dạng so sánh nhất của 'good' (Tốt nhất) / 'well'", pos: 'adjective' },
  worse: { base: 'bad', label: "Dạng so sánh hơn của 'bad' (Tệ hơn)", pos: 'adjective' },
  worst: { base: 'bad', label: "Dạng so sánh nhất của 'bad' (Tệ nhất)", pos: 'adjective' },
  more: { base: 'many', label: "Dạng so sánh hơn của 'many' / 'much' (Nhiều hơn)", pos: 'determiner' },
  most: { base: 'many', label: "Dạng so sánh nhất của 'many' / 'much' (Nhiều nhất)", pos: 'determiner' },
  less: { base: 'little', label: "Dạng so sánh hơn của 'little' (Ít hơn)", pos: 'determiner' },
  least: { base: 'little', label: "Dạng so sánh nhất của 'little' (Ít nhất)", pos: 'determiner' },

  // Irregular plurals
  children: { base: 'child', label: "Số nhiều của 'child' (Trẻ em)", pos: 'noun' },
  people: { base: 'person', label: "Số nhiều của 'person' (Mọi người)", pos: 'noun' },
  men: { base: 'man', label: "Số nhiều của 'man' (Đàn ông)", pos: 'noun' },
  women: { base: 'woman', label: "Số nhiều của 'woman' (Phụ nữ)", pos: 'noun' },
  teeth: { base: 'tooth', label: "Số nhiều của 'tooth' (Răng)", pos: 'noun' },
  feet: { base: 'foot', label: "Số nhiều của 'foot' (Bàn chân)", pos: 'noun' },
  mice: { base: 'mouse', label: "Số nhiều của 'mouse' (Chuột)", pos: 'noun' },
};

// Fetch primary entry from Free Dictionary API (Strict Exact Match)
async function fetchFreeDictionary(cleanWord) {
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(2800),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Verify exact or inflectional match
    const matchingEntry =
      data.find((entry) => entry.word && entry.word.toLowerCase() === cleanWord) || data[0];
    if (!matchingEntry || !matchingEntry.word) {
      return null;
    }

    // If API returned a completely different word that does not match
    if (matchingEntry.word.toLowerCase() !== cleanWord && !cleanWord.includes(matchingEntry.word.toLowerCase())) {
      return null;
    }

    let phoneticText = matchingEntry.phonetic || '';
    let audioUrl = '';

    if (Array.isArray(matchingEntry.phonetics)) {
      for (const p of matchingEntry.phonetics) {
        if (!phoneticText && p.text) {
          phoneticText = p.text;
        }
        if (!audioUrl && p.audio && p.audio.startsWith('http')) {
          audioUrl = p.audio;
        }
      }
    }

    const meanings = [];
    if (Array.isArray(matchingEntry.meanings)) {
      for (const m of matchingEntry.meanings) {
        const pos = m.partOfSpeech || 'general';
        const defs = [];
        if (Array.isArray(m.definitions)) {
          for (const d of m.definitions) {
            if (d.definition) {
              defs.push({
                definition: d.definition,
                example: d.example || '',
                synonyms: Array.isArray(d.synonyms) ? d.synonyms.slice(0, 4) : [],
                antonyms: Array.isArray(d.antonyms) ? d.antonyms.slice(0, 4) : [],
              });
            }
          }
        }
        if (defs.length > 0) {
          meanings.push({
            partOfSpeech: pos,
            definitions: defs.slice(0, 5),
            synonyms: Array.isArray(m.synonyms) ? m.synonyms.slice(0, 6) : [],
            antonyms: Array.isArray(m.antonyms) ? m.antonyms.slice(0, 6) : [],
          });
        }
      }
    }

    if (meanings.length === 0) {
      return null;
    }

    return {
      word: matchingEntry.word,
      phonetic: phoneticText,
      audioUrl,
      meanings,
      sourceUrls: matchingEntry.sourceUrls || [],
    };
  } catch {
    return null;
  }
}

const COMMON_SHORT_WORDS = new Set([
  'a', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'hi', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we'
]);

// Valid WordNet Fallback strictly for genuine lexical words (Never for abbreviations/slang like gg)
async function fetchValidWordNetFallback(cleanWord) {
  if (cleanWord.length <= 2 && !COMMON_SHORT_WORDS.has(cleanWord)) return null;

  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}&md=dpf&max=1`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const exact = data[0];
    if (!exact || !exact.word || exact.word.toLowerCase() !== cleanWord || !exact.defs || exact.defs.length === 0) {
      return null;
    }

    // Filter out abbreviations, acronyms, or initialisms
    const validDefs = exact.defs.filter((d) => {
      const text = d.includes('\t') ? d.split('\t')[1] : d;
      const lower = text.toLowerCase().trim();
      return (
        !lower.startsWith('abbreviation of') &&
        !lower.startsWith('initialism of') &&
        !lower.startsWith('acronym of') &&
        !lower.includes('misspelling of') &&
        !lower.includes('pornography') &&
        !lower.includes('slang')
      );
    });

    if (validDefs.length === 0) return null;

    const posMap = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', u: 'general' };
    const grouped = {};

    for (const rawDef of validDefs) {
      const parts = rawDef.split('\t', 2);
      const posCode = parts.length > 1 ? parts[0].trim() : 'n';
      const pos = posMap[posCode] || posCode;
      const text = parts.length > 1 ? parts[1].trim() : rawDef.trim();

      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push({
        definition: text,
        example: '',
        synonyms: [],
        antonyms: [],
      });
    }

    const meanings = Object.keys(grouped).map((pos) => ({
      partOfSpeech: pos,
      definitions: grouped[pos].slice(0, 4),
      synonyms: [],
      antonyms: [],
    }));

    return {
      word: exact.word,
      meanings,
    };
  } catch {
    return null;
  }
}

// Fetch WordNet Lexical Semantic Relations (Synonyms, Antonyms, Hypernyms, Hyponyms)
async function fetchWordNetRelations(cleanWord) {
  try {
    const synUrl = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=6`;
    const antUrl = `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(cleanWord)}&max=6`;
    const genUrl = `https://api.datamuse.com/words?rel_gen=${encodeURIComponent(cleanWord)}&max=5`;
    const spcUrl = `https://api.datamuse.com/words?rel_spc=${encodeURIComponent(cleanWord)}&max=5`;

    const [synRes, antRes, genRes, spcRes] = await Promise.all([
      fetch(synUrl, { signal: AbortSignal.timeout(1800) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(antUrl, { signal: AbortSignal.timeout(1800) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(genUrl, { signal: AbortSignal.timeout(1800) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(spcUrl, { signal: AbortSignal.timeout(1800) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]);

    return {
      synonyms: Array.isArray(synRes) ? synRes.map((s) => s.word) : [],
      antonyms: Array.isArray(antRes) ? antRes.map((a) => a.word) : [],
      hypernyms: Array.isArray(genRes) ? genRes.map((g) => g.word) : [],
      hyponyms: Array.isArray(spcRes) ? spcRes.map((s) => s.word) : [],
    };
  } catch {
    return { synonyms: [], antonyms: [], hypernyms: [], hyponyms: [] };
  }
}

// Fetch Spelling and Phonetic Suggestions when a query does not match any dictionary entry
async function getSpellingSuggestions(cleanWord) {
  const suggestionsSet = new Set();

  try {
    const [spList, slList, sugList] = await Promise.all([
      fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}*&max=6`, {
        signal: AbortSignal.timeout(1500),
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`https://api.datamuse.com/words?sl=${encodeURIComponent(cleanWord)}&max=6`, {
        signal: AbortSignal.timeout(1500),
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(cleanWord)}&max=6`, {
        signal: AbortSignal.timeout(1500),
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]);

    for (const item of [...sugList, ...spList, ...slList]) {
      if (item && item.word) {
        const w = item.word.toLowerCase().trim();
        if (w !== cleanWord && w.length >= 2 && /^[a-zA-Z\s-]+$/.test(w)) {
          suggestionsSet.add(w);
        }
      }
    }
  } catch {
    // ignore
  }

  // Also search local curriculum database
  try {
    await ensureLocalVocabMap();
    const localKeys = Array.from(localVocabMap.keys());
    for (const k of localKeys) {
      if (k !== cleanWord && (k.startsWith(cleanWord) || (cleanWord.length >= 3 && k.includes(cleanWord)))) {
        suggestionsSet.add(k);
        if (suggestionsSet.size >= 8) break;
      }
    }
  } catch {
    // ignore
  }

  const list = Array.from(suggestionsSet);
  return {
    didYouMean: list.length > 0 ? list[0] : null,
    suggestions: list.slice(0, 5),
  };
}

// Lookup Dictionary Entry
async function lookupDictionary(req, res) {
  try {
    const rawParam = (req.params.word || '').trim();
    if (!rawParam) {
      return res.status(400).json({ message: 'Vui lòng cung cấp từ cần tra.' });
    }

    // 1. Query Normalization
    const cleanWord = rawParam.toLowerCase().replace(/\s+/g, ' ');

    // 2. Check Instant Cache
    const cached = getDictCache(cleanWord);
    if (cached) {
      return res.json(cached);
    }

    await ensureLocalVocabMap();

    // 3. Check Local Database & Inflections
    let localWord = localVocabMap.get(cleanWord);
    if (!localWord) {
      const dbMatch = await prisma.vocabulary.findFirst({
        where: {
          OR: [
            { word: cleanWord },
            { word: cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1) },
          ],
        },
      });
      if (dbMatch) {
        localWord = dbMatch;
        localVocabMap.set(cleanWord, dbMatch);
      }
    }

    let inflectionInfo = null;
    let baseWordEntry = null;

    if (INFLECTION_MAP[cleanWord]) {
      inflectionInfo = INFLECTION_MAP[cleanWord];
      baseWordEntry = localVocabMap.get(inflectionInfo.base);
    } else if (cleanWord.endsWith('s') && cleanWord.length > 3) {
      const singular = cleanWord.endsWith('es') ? cleanWord.slice(0, -2) : cleanWord.slice(0, -1);
      const singularMatch = localVocabMap.get(singular);
      if (singularMatch) {
        inflectionInfo = {
          base: singular,
          label: `Số nhiều của '${singular}' (${singularMatch.meaning})`,
          pos: 'noun',
        };
        baseWordEntry = singularMatch;
      }
    }

    // 4. Query Primary Free Dictionary API & WordNet Relations in parallel
    const [freeDictData, wordnetData] = await Promise.all([
      fetchFreeDictionary(cleanWord),
      fetchWordNetRelations(cleanWord),
    ]);

    // Check verified WordNet fallback if Free Dictionary API is unavailable/timed out
    let wordNetFallback = null;
    if (!freeDictData && !localWord && !inflectionInfo) {
      wordNetFallback = await fetchValidWordNetFallback(cleanWord);
    }

    // 5. Evaluation: Is there a valid dictionary entry?
    const hasFreeDict = freeDictData !== null;
    const hasWordNetFallback = wordNetFallback !== null;
    const hasLocal = localWord !== undefined || (inflectionInfo !== null && baseWordEntry !== undefined);

    // If neither Free Dictionary nor Local Database nor verified WordNet has a matching entry:
    // (This strictly rejects invalid words, abbreviations like "gg", random typos like "zzzxq")
    if (!hasFreeDict && !hasLocal && !hasWordNetFallback) {
      const { didYouMean, suggestions } = await getSpellingSuggestions(cleanWord);
      return res.status(404).json({
        message: 'Không tìm thấy định nghĩa phù hợp cho từ này.',
        didYouMean,
        suggestions,
      });
    }

    // 6. Build High-Quality Lexicographical Result
    let displayWord = rawParam;
    if (localWord?.word) {
      displayWord = localWord.word;
    } else if (freeDictData?.word) {
      displayWord = freeDictData.word;
    } else if (wordNetFallback?.word) {
      displayWord = wordNetFallback.word;
    }

    // Determine Phonetic IPA with priority for Cambridge standard IPA
    const cambridgeIpa = await getCambridgeIPA(cleanWord);
    let phonetic = '';
    if (cambridgeIpa) {
      phonetic = cambridgeIpa;
    } else if (localWord?.pronunciation && !localWord.pronunciation.includes('...')) {
      phonetic = localWord.pronunciation;
    } else if (freeDictData?.phonetic) {
      phonetic = freeDictData.phonetic;
    } else if (baseWordEntry?.pronunciation) {
      phonetic = baseWordEntry.pronunciation;
    }

    // Determine Audio URL
    const audioUrl = freeDictData?.audioUrl || null;

    // Determine Vietnamese Meaning
    let vietnameseMeaning = null;
    let localExample = null;
    let localExampleMeaning = null;

    if (localWord) {
      vietnameseMeaning = localWord.meaning;
      localExample = localWord.example;
      localExampleMeaning = localWord.exampleMeaning;
    } else if (inflectionInfo) {
      vietnameseMeaning = inflectionInfo.label;
      if (baseWordEntry) {
        localExample = baseWordEntry.example;
        localExampleMeaning = baseWordEntry.exampleMeaning;
      }
    }

    // Determine Meanings and Definitions
    let meanings = [];
    if (freeDictData?.meanings && freeDictData.meanings.length > 0) {
      meanings = freeDictData.meanings;
    } else if (wordNetFallback?.meanings && wordNetFallback.meanings.length > 0) {
      meanings = wordNetFallback.meanings;
    } else if (localWord) {
      meanings = [
        {
          partOfSpeech: localWord.partOfSpeech || 'noun',
          definitions: [
            {
              definition: localWord.meaning,
              example: localWord.example || '',
              synonyms: [],
              antonyms: [],
            },
          ],
          synonyms: wordnetData.synonyms.slice(0, 5),
          antonyms: wordnetData.antonyms.slice(0, 5),
        },
      ];
    } else if (inflectionInfo) {
      meanings = [
        {
          partOfSpeech: inflectionInfo.pos || 'general',
          definitions: [
            {
              definition: inflectionInfo.label,
              example: baseWordEntry?.example || '',
              synonyms: [],
              antonyms: [],
            },
          ],
          synonyms: [],
          antonyms: [],
        },
      ];
    }

    // Clean source attribution
    const sources = [];
    if (hasFreeDict) sources.push('Free Dictionary API');
    if (hasWordNetFallback) sources.push('Princeton WordNet');
    if (localWord) sources.push('E4B Curriculum Database');
    if (inflectionInfo) sources.push('E4B Lemmatization Engine');
    const sourceLabel = sources.join(' & ');

    const payload = {
      word: displayWord,
      phonetic,
      audioUrl,
      vietnameseMeaning, // null if no reliable Vietnamese meaning, UI will show "Chưa có bản dịch tiếng Việt"
      localExample,
      localExampleMeaning,
      meanings,
      wordnet: wordnetData,
      isLocallySaved: !!localWord,
      source: sourceLabel,
    };

    setDictCache(cleanWord, payload);
    return res.json(payload);
  } catch (error) {
    console.error('lookupDictionary error:', error);
    return res.status(500).json({ message: 'Lỗi tra cứu từ điển.' });
  }
}

// Autocomplete / Search Suggestions Endpoint
async function suggestVocabulary(req, res) {
  try {
    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json({ suggestions: [] });
    }

    await ensureLocalVocabMap();
    const suggestionsSet = new Set();

    // 1. Match local curriculum database (high priority)
    for (const [key, v] of localVocabMap.entries()) {
      if (key.startsWith(query)) {
        suggestionsSet.add(v.word);
        if (suggestionsSet.size >= 5) break;
      }
    }

    // 2. Query Datamuse Autocomplete API
    try {
      const dmRes = await fetch(
        `https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=8`,
        { signal: AbortSignal.timeout(1200) }
      );
      if (dmRes.ok) {
        const list = await dmRes.json();
        for (const item of list) {
          if (item && item.word && /^[a-zA-Z\s-]+$/.test(item.word)) {
            suggestionsSet.add(item.word);
            if (suggestionsSet.size >= 8) break;
          }
        }
      }
    } catch {
      // ignore
    }

    return res.json({ suggestions: Array.from(suggestionsSet).slice(0, 8) });
  } catch (error) {
    console.error('suggestVocabulary error:', error);
    return res.json({ suggestions: [] });
  }
}

// Topic Vocabulary Endpoint (Dynamic from Database)
async function getTopicVocabulary(req, res) {
  try {
    const topicConfigs = [
      { label: 'Chào hỏi & Giao tiếp', cats: ['Greetings', 'Communication'] },
      { label: 'Đời sống & Du lịch', cats: ['Travel', 'Transportation', 'Food'] },
      { label: 'Trường học & Học tập', cats: ['School', 'Milestone', 'Linguistics'] },
      { label: 'Công sở & Nghề nghiệp', cats: ['Workplace', 'Business', 'Jobs'] },
      { label: 'Gia đình & Nhà cửa', cats: ['Family', 'Home', 'Shopping'] },
    ];

    const topics = [];
    for (const config of topicConfigs) {
      const records = await prisma.vocabulary.findMany({
        where: { category: { in: config.cats } },
        take: 6,
        select: { word: true },
      });
      if (records.length > 0) {
        topics.push({
          topic: config.label,
          words: records.map((r) => r.word),
        });
      }
    }

    return res.json({ topics });
  } catch (error) {
    console.error('getTopicVocabulary error:', error);
    return res.status(500).json({ message: 'Lỗi tải danh mục từ vựng theo chủ đề.' });
  }
}

// Dedicated WordNet endpoint
async function getWordNetRelations(req, res) {
  try {
    const wordParam = (req.params.word || '').trim().toLowerCase();
    if (!wordParam) {
      return res.status(400).json({ message: 'Vui lòng nhập từ cần tra cứu WordNet.' });
    }
    const relations = await fetchWordNetRelations(wordParam);
    return res.json(relations);
  } catch (error) {
    console.error('getWordNetRelations error:', error);
    return res.status(500).json({ message: 'Lỗi truy vấn WordNet.' });
  }
}

// Get Vocabulary list for Vocabulary page
async function getVocabulary(req, res) {
  try {
    const userId = req.user.id;
    const { category, level, search, filter } = req.query;

    const where = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (level && level !== 'All') {
      where.level = level;
    }
    if (search) {
      where.OR = [
        { word: { contains: search } },
        { meaning: { contains: search } },
      ];
    }

    const vocabularies = await prisma.vocabulary.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    const userVocabs = await prisma.userVocabulary.findMany({
      where: { userId },
    });

    const userVocabMap = {};
    userVocabs.forEach((uv) => {
      userVocabMap[uv.vocabularyId] = uv;
    });

    let result = vocabularies.map((v) => ({
      ...v,
      isFavorite: userVocabMap[v.id]?.isFavorite || false,
      status: userVocabMap[v.id]?.status || 'NEW',
    }));

    if (filter === 'favorites') {
      result = result.filter((v) => v.isFavorite);
    } else if (filter === 'need_review') {
      result = result.filter((v) => v.status === 'NEED_REVIEW');
    } else if (filter === 'mastered') {
      result = result.filter((v) => v.status === 'MASTERED');
    }

    return res.json({ vocabulary: result });
  } catch (error) {
    console.error('getVocabulary error:', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách từ vựng.' });
  }
}

// Update Vocabulary Status
async function updateVocabStatus(req, res) {
  try {
    const vocabId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { isFavorite, status } = req.body;

    const updateData = {};
    if (typeof isFavorite === 'boolean') updateData.isFavorite = isFavorite;
    if (status) updateData.status = status;

    const userVocab = await prisma.userVocabulary.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId: vocabId } },
      update: updateData,
      create: {
        userId,
        vocabularyId: vocabId,
        isFavorite: isFavorite || false,
        status: status || 'LEARNING',
      },
    });

    return res.json({ message: 'Đã cập nhật trạng thái từ vựng.', userVocab });
  } catch (error) {
    console.error('updateVocabStatus error:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái từ vựng.' });
  }
}

// Save Custom Vocabulary to user notebook
async function saveCustomVocabulary(req, res) {
  try {
    const userId = req.user.id;
    const { word, meaning, pronunciation, partOfSpeech, example, exampleMeaning } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ message: 'Từ và nghĩa không được để trống.' });
    }

    const cleanWord = word.trim();
    let vocab = await prisma.vocabulary.findFirst({
      where: { word: cleanWord },
    });

    if (!vocab) {
      vocab = await prisma.vocabulary.create({
        data: {
          word: cleanWord,
          meaning: meaning.trim(),
          pronunciation: pronunciation || '',
          partOfSpeech: partOfSpeech || 'noun',
          example: example || '',
          exampleMeaning: exampleMeaning || '',
          category: 'Sổ tay cá nhân',
          level: 'A1',
        },
      });
      // Update local in-memory map
      localVocabMap.set(cleanWord.toLowerCase(), vocab);
    }

    const userVocab = await prisma.userVocabulary.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId: vocab.id } },
      update: {
        status: 'LEARNING',
      },
      create: {
        userId,
        vocabularyId: vocab.id,
        status: 'LEARNING',
      },
    });

    return res.json({ message: 'Đã lưu từ vào sổ tay từ vựng!', vocab, userVocab });
  } catch (error) {
    console.error('saveCustomVocabulary error:', error);
    return res.status(500).json({ message: 'Lỗi khi lưu từ vựng.' });
  }
}

module.exports = {
  getVocabulary,
  updateVocabStatus,
  lookupDictionary,
  suggestVocabulary,
  getTopicVocabulary,
  getWordNetRelations,
  saveCustomVocabulary,
};
