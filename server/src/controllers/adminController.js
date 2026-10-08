const prisma = require('../db');

async function getAdminStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    const totalLessons = await prisma.lesson.count();
    const totalVocabulary = await prisma.vocabulary.count();
    const totalQuizAttempts = await prisma.quizAttempt.count();

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        createdAt: true,
      },
    });

    return res.json({
      counts: {
        totalUsers,
        totalLessons,
        totalVocabulary,
        totalQuizAttempts,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({ message: 'Không thể lấy thống kê Admin.' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        goal: true,
        xp: true,
        streakDays: true,
        createdAt: true,
      },
    });
    return res.json({ users });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Lỗi tải danh sách người dùng.' });
  }
}

async function createLesson(req, res) {
  try {
    const { title, description, level, category, orderNumber, durationMinutes } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tiêu đề và mô tả bài học.' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        level: level || 'A1',
        category: category || 'General',
        orderNumber: orderNumber ? parseInt(orderNumber, 10) : 99,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 15,
      },
    });

    return res.status(201).json({ message: 'Đã tạo bài học mới thành công!', lesson });
  } catch (error) {
    console.error('createLesson error:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo bài học.' });
  }
}

async function updateLesson(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, level, category, orderNumber, durationMinutes } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        description,
        level,
        category,
        orderNumber: orderNumber ? parseInt(orderNumber, 10) : undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
      },
    });

    return res.json({ message: 'Cập nhật bài học thành công!', lesson });
  } catch (error) {
    console.error('updateLesson error:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật bài học.' });
  }
}

async function deleteLesson(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.lesson.delete({
      where: { id },
    });
    return res.json({ message: 'Đã xóa bài học thành công.' });
  } catch (error) {
    console.error('deleteLesson error:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa bài học.' });
  }
}

async function createVocabulary(req, res) {
  try {
    const { word, meaning, pronunciation, partOfSpeech, example, exampleMeaning, category, level, lessonId } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ message: 'Vui lòng nhập từ tiếng Anh và nghĩa tiếng Việt.' });
    }

    const vocab = await prisma.vocabulary.create({
      data: {
        word,
        meaning,
        pronunciation: pronunciation || '',
        partOfSpeech: partOfSpeech || 'noun',
        example: example || '',
        exampleMeaning: exampleMeaning || '',
        category: category || 'General',
        level: level || 'A1',
        lessonId: lessonId ? parseInt(lessonId, 10) : null,
      },
    });

    return res.status(201).json({ message: 'Đã thêm từ vựng mới!', vocab });
  } catch (error) {
    console.error('createVocabulary error:', error);
    return res.status(500).json({ message: 'Lỗi khi thêm từ vựng.' });
  }
}

async function deleteVocabulary(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.vocabulary.delete({
      where: { id },
    });
    return res.json({ message: 'Đã xóa từ vựng thành công.' });
  } catch (error) {
    console.error('deleteVocabulary error:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa từ vựng.' });
  }
}

module.exports = {
  getAdminStats,
  getUsers,
  createLesson,
  updateLesson,
  deleteLesson,
  createVocabulary,
  deleteVocabulary,
};
