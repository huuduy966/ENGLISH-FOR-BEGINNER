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

module.exports = {
  getVocabulary,
  updateVocabStatus,
};
