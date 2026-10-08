const prisma = require('../db');

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

    const existing = await prisma.userVocabulary.findUnique({
      where: { userId_vocabularyId: { userId, vocabularyId: vocabId } },
    });

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

    // 1. Look up in local database
    const localWord = await prisma.vocabulary.findFirst({
      where: {
        word: {
          equals: wordParam,
        },
      },
    });

    // 2. Fetch from Free Dictionary API
    let apiData = null;
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordParam.toLowerCase())}`
      );
      if (response.ok) {
        const json = await response.json();
        apiData = json[0];
      }
    } catch (apiErr) {
      console.warn('Free Dictionary API fetch failed:', apiErr.message);
    }

    if (!apiData && !localWord) {
      return res.status(404).json({
        message: `Không tìm thấy từ "${wordParam}" trong từ điển Free Dictionary API.`,
      });
    }

    // Extract native audio url
    let audioUrl = null;
    let phoneticText = apiData?.phonetic || localWord?.pronunciation || '';

    if (apiData?.phonetics && Array.isArray(apiData.phonetics)) {
      for (const p of apiData.phonetics) {
        if (!phoneticText && p.text) phoneticText = p.text;
        if (p.audio && !audioUrl) {
          audioUrl = p.audio;
        }
      }
    }

    const meanings = apiData?.meanings || [
      {
        partOfSpeech: localWord?.partOfSpeech || 'noun',
        definitions: [
          {
            definition: localWord?.meaning || '',
            example: localWord?.example || '',
            synonyms: [],
          },
        ],
      },
    ];

    return res.json({
      word: apiData?.word || localWord?.word || wordParam,
      phonetic: phoneticText,
      audioUrl,
      vietnameseMeaning: localWord?.meaning || null,
      localExample: localWord?.example || null,
      localExampleMeaning: localWord?.exampleMeaning || null,
      meanings,
      source: 'Free Dictionary API',
      isLocallySaved: !!localWord,
    });
  } catch (error) {
    console.error('lookupDictionary error:', error);
    return res.status(500).json({ message: 'Lỗi tra cứu từ điển.' });
  }
}

async function saveCustomVocabulary(req, res) {
  try {
    const userId = req.user.id;
    const { word, meaning, pronunciation, partOfSpeech, example, exampleMeaning } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ message: 'Từ và nghĩa không được để trống.' });
    }

    // Check if vocabulary already exists
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

    // Link to user vocabulary
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
  saveCustomVocabulary,
};
