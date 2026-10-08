const prisma = require('../db');

// High-speed In-Memory Cache for Dictionary & WordNet Lookups
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

// Regex to detect if Datamuse definition is flagging a typo/misspelling
const MISSPELLING_REGEX = /(?:Misspelling|Obsolete spelling|Pronunciation spelling|Alternative spelling) of ([a-zA-Z\-]+)/i;

// Fetch structured word definitions, synonyms, and Princeton WordNet relations
async function fetchDatamuseEntry(cleanWord) {
  try {
    const wordUrl = `https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}&md=dpf&max=1`;
    const synUrl = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=6`;
    const antUrl = `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(cleanWord)}&max=6`;
    const genUrl = `https://api.datamuse.com/words?rel_gen=${encodeURIComponent(cleanWord)}&max=5`;
    const spcUrl = `https://api.datamuse.com/words?rel_spc=${encodeURIComponent(cleanWord)}&max=5`;

    const [wordRes, synRes, antRes, genRes, spcRes] = await Promise.all([
      fetch(wordUrl, { signal: AbortSignal.timeout(2000) })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(synUrl, { signal: AbortSignal.timeout(2000) })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(antUrl, { signal: AbortSignal.timeout(2000) })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(genUrl, { signal: AbortSignal.timeout(2000) })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(spcUrl, { signal: AbortSignal.timeout(2000) })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]);

    const exact = Array.isArray(wordRes)
      ? wordRes.find((x) => x.word.toLowerCase() === cleanWord)
      : null;

    if (!exact || !exact.defs || exact.defs.length === 0) {
      return null;
    }

    // Check if Datamuse definition itself indicates this is a misspelling of another word
    for (const rawDef of exact.defs) {
      const match = rawDef.match(MISSPELLING_REGEX);
      if (match && match[1] && match[1].toLowerCase() !== cleanWord) {
        return {
          isMisspelling: true,
          correctWord: match[1].toLowerCase(),
        };
      }
    }

    const posMap = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', u: 'general' };
    const grouped = {};

    for (const rawDef of exact.defs) {
      const parts = rawDef.split('\t', 2);
      const posCode = parts.length > 1 ? parts[0].trim() : 'n';
      const pos = posMap[posCode] || posCode;
      const text = parts.length > 1 ? parts[1].trim() : rawDef.trim();

      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push({
        definition: text,
        example: `Common usage in daily conversation.`,
        synonyms: [],
      });
    }

    const synonymsList = Array.isArray(synRes) ? synRes.map((s) => s.word) : [];
    const antonymsList = Array.isArray(antRes) ? antRes.map((a) => a.word) : [];
    const hypernymsList = Array.isArray(genRes) ? genRes.map((g) => g.word) : [];
    const hyponymsList = Array.isArray(spcRes) ? spcRes.map((s) => s.word) : [];

    const meanings = Object.keys(grouped).map((pos) => ({
      partOfSpeech: pos,
      definitions: grouped[pos].slice(0, 4),
      synonyms: synonymsList.slice(0, 5),
    }));

    // Princeton WordNet Lexical Semantic Network
    const wordnet = {
      synonyms: synonymsList,
      antonyms: antonymsList,
      hypernyms: hypernymsList,
      hyponyms: hyponymsList,
    };

    return {
      word: exact.word,
      meanings,
      synonyms: synonymsList,
      wordnet,
    };
  } catch (err) {
    console.warn('Datamuse entry fetch error:', err.message);
    return null;
  }
}

// Fetch spelling and phonetic suggestions when a word is misspelled
async function getSpellingSuggestions(word) {
  const clean = word.trim().toLowerCase();
  const suggestionsSet = new Set();

  try {
    const spPromise = fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(clean)}&max=6`,
      { signal: AbortSignal.timeout(1800) }
    ).then((r) => (r.ok ? r.json() : [])).catch(() => []);

    const slPromise = fetch(
      `https://api.datamuse.com/words?sl=${encodeURIComponent(clean)}&max=6`,
      { signal: AbortSignal.timeout(1800) }
    ).then((r) => (r.ok ? r.json() : [])).catch(() => []);

    const [spList, slList] = await Promise.all([spPromise, slPromise]);

    if (Array.isArray(spList)) {
      for (const item of spList) {
        if (item.word && item.word.toLowerCase() !== clean) {
          suggestionsSet.add(item.word.toLowerCase());
        }
      }
    }

    if (Array.isArray(slList)) {
      for (const item of slList) {
        if (item.word && item.word.toLowerCase() !== clean) {
          suggestionsSet.add(item.word.toLowerCase());
        }
      }
    }
  } catch (err) {
    console.warn('Spelling suggestion fetch error:', err.message);
  }

  // Also query local curriculum database for partial match
  try {
    const prefix = clean.slice(0, Math.max(3, clean.length - 2));
    const localMatches = await prisma.vocabulary.findMany({
      where: {
        word: { contains: prefix },
      },
      take: 4,
    });
    for (const lm of localMatches) {
      if (lm.word.toLowerCase() !== clean) {
        suggestionsSet.add(lm.word.toLowerCase());
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

async function lookupDictionary(req, res) {
  try {
    const wordParam = req.params.word.trim();
    if (!wordParam) {
      return res.status(400).json({ message: 'Vui lòng cung cấp từ cần tra.' });
    }

    const cleanWord = wordParam.toLowerCase();

    // 1. Instant Cache Hit (Sub-millisecond response)
    const cached = getDictCache(cleanWord);
    if (cached) {
      return res.json(cached);
    }

    // 2. Parallel Fast Fetch: Local Database (Case-Insensitive) & Datamuse WordNet Engine
    const [allLocals, datamuseData] = await Promise.all([
      prisma.vocabulary.findMany().catch(() => []),
      fetchDatamuseEntry(cleanWord),
    ]);

    const localWord = allLocals.find((v) => v.word.toLowerCase() === cleanWord);

    // 3. Handle Misspelling Detection from Datamuse (e.g. "extention" -> "extension")
    if (datamuseData && datamuseData.isMisspelling && datamuseData.correctWord) {
      const correct = datamuseData.correctWord;
      const { suggestions } = await getSpellingSuggestions(cleanWord);
      const fullList = [correct, ...suggestions.filter((s) => s !== correct)].slice(0, 5);

      return res.status(404).json({
        message: `Từ "${wordParam}" có thể bị viết sai chính tả.`,
        didYouMean: correct,
        suggestions: fullList,
      });
    }

    // 4. If word not found in either source, compute smart spelling suggestions via Datamuse
    if (!datamuseData && !localWord) {
      const { didYouMean, suggestions } = await getSpellingSuggestions(cleanWord);

      return res.status(404).json({
        message: `Không tìm thấy từ "${wordParam}" trong từ điển.`,
        didYouMean,
        suggestions,
      });
    }

    const phoneticText = localWord?.pronunciation || '';
    const meanings = datamuseData?.meanings || [
      {
        partOfSpeech: localWord?.partOfSpeech || 'noun',
        definitions: [
          {
            definition: localWord?.meaning || '',
            example: localWord?.example || '',
            synonyms: [],
          },
        ],
        synonyms: [],
      },
    ];

    const wordnet = datamuseData?.wordnet || {
      synonyms: datamuseData?.synonyms || [],
      antonyms: [],
      hypernyms: [],
      hyponyms: [],
    };

    const payload = {
      word: datamuseData?.word || localWord?.word || wordParam,
      phonetic: phoneticText,
      vietnameseMeaning: localWord?.meaning || null,
      localExample: localWord?.example || null,
      localExampleMeaning: localWord?.exampleMeaning || null,
      meanings,
      synonyms: datamuseData?.synonyms || [],
      wordnet,
      isLocallySaved: !!localWord,
    };

    // Store in cache for blazing fast subsequent lookups
    setDictCache(cleanWord, payload);

    return res.json(payload);
  } catch (error) {
    console.error('lookupDictionary error:', error);
    return res.status(500).json({ message: 'Lỗi tra cứu từ điển.' });
  }
}

// Dedicated WordNet endpoint to query lexical semantic relations
async function getWordNetRelations(req, res) {
  try {
    const wordParam = req.params.word.trim().toLowerCase();
    if (!wordParam) {
      return res.status(400).json({ message: 'Vui lòng nhập từ cần tra cứu WordNet.' });
    }

    const synUrl = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(wordParam)}&max=6`;
    const antUrl = `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(wordParam)}&max=6`;
    const genUrl = `https://api.datamuse.com/words?rel_gen=${encodeURIComponent(wordParam)}&max=5`;
    const spcUrl = `https://api.datamuse.com/words?rel_spc=${encodeURIComponent(wordParam)}&max=5`;

    const [s, a, g, sp] = await Promise.all([
      fetch(synUrl, { signal: AbortSignal.timeout(2000) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(antUrl, { signal: AbortSignal.timeout(2000) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(genUrl, { signal: AbortSignal.timeout(2000) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(spcUrl, { signal: AbortSignal.timeout(2000) }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]);

    const wordnet = {
      synonyms: s.map((x) => x.word),
      antonyms: a.map((x) => x.word),
      hypernyms: g.map((x) => x.word),
      hyponyms: sp.map((x) => x.word),
    };

    return res.json({
      word: wordParam,
      wordnet,
    });
  } catch (error) {
    console.error('getWordNetRelations error:', error);
    return res.status(500).json({ message: 'Lỗi truy vấn WordNet.' });
  }
}

async function saveCustomVocabulary(req, res) {
  try {
    const userId = req.user.id;
    const { word, meaning, pronunciation, partOfSpeech, example, exampleMeaning } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ message: 'Từ và nghĩa không được để trống.' });
    }

    let vocab = await prisma.vocabulary.findFirst({
      where: { word: { equals: word.trim() } },
    });

    if (!vocab) {
      vocab = await prisma.vocabulary.create({
        data: {
          word: word.trim(),
          meaning: meaning.trim(),
          pronunciation: pronunciation || '',
          partOfSpeech: partOfSpeech || 'noun',
          example: example || '',
          exampleMeaning: exampleMeaning || '',
          category: 'Sổ tay cá nhân',
          level: 'A1',
        },
      });
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
  getWordNetRelations,
  saveCustomVocabulary,
};
