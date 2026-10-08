const prisma = require('../db');

async function getLessons(req, res) {
  try {
    const userId = req.user ? req.user.id : null;

    const lessons = await prisma.lesson.findMany({
      orderBy: { orderNumber: 'asc' },
      include: {
        _count: {
          select: {
            vocabularies: true,
            grammarPoints: true,
            exercises: true,
            quizzes: true,
          },
        },
        userProgress: userId ? {
          where: { userId },
          select: {
            progress: true,
            completed: true,
            score: true,
          },
        } : false,
      },
    });

    const formatted = lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      level: l.level,
      category: l.category,
      orderNumber: l.orderNumber,
      durationMinutes: l.durationMinutes,
      counts: l._count,
      progress: l.userProgress && l.userProgress[0] ? l.userProgress[0].progress : 0,
      completed: l.userProgress && l.userProgress[0] ? l.userProgress[0].completed : false,
      score: l.userProgress && l.userProgress[0] ? l.userProgress[0].score : 0,
    }));

    return res.json({ lessons: formatted });
  } catch (error) {
    console.error('getLessons error:', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách bài học.' });
  }
}

async function getLessonById(req, res) {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const userId = req.user ? req.user.id : null;

    if (isNaN(lessonId)) {
      return res.status(400).json({ message: 'ID bài học không hợp lệ.' });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        vocabularies: true,
        grammarPoints: true,
        listenings: true,
        conversations: true,
        exercises: true,
        quizzes: true,
        userProgress: userId ? {
          where: { userId },
        } : false,
      },
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Không tìm thấy bài học.' });
    }

    // Parse JSON fields
    const formattedGrammar = lesson.grammarPoints.map((g) => ({
      ...g,
      examples: g.examples ? JSON.parse(g.examples) : [],
    }));

    const formattedListening = lesson.listenings.map((l) => ({
      ...l,
      questions: l.questions ? JSON.parse(l.questions) : [],
    }));

    const formattedConversations = lesson.conversations.map((c) => ({
      ...c,
      dialogue: c.dialogue ? JSON.parse(c.dialogue) : [],
    }));

    const formattedExercises = lesson.exercises.map((e) => ({
      ...e,
      options: e.options ? JSON.parse(e.options) : null,
    }));

    const formattedQuizzes = lesson.quizzes.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options ? JSON.parse(q.options) : [],
      explanation: q.explanation,
    }));

    // Attach user saved words
    let userWordMap = {};
    if (userId) {
      const userWords = await prisma.userVocabulary.findMany({
        where: { userId, vocabularyId: { in: lesson.vocabularies.map((v) => v.id) } },
      });
      userWords.forEach((uw) => {
        userWordMap[uw.vocabularyId] = uw;
      });
    }

    const vocabulariesWithStatus = lesson.vocabularies.map((v) => ({
      ...v,
      isFavorite: userWordMap[v.id]?.isFavorite || false,
      status: userWordMap[v.id]?.status || 'NEW',
    }));

    return res.json({
      lesson: {
        ...lesson,
        vocabularies: vocabulariesWithStatus,
        grammarPoints: formattedGrammar,
        listenings: formattedListening,
        conversations: formattedConversations,
        exercises: formattedExercises,
        quizzes: formattedQuizzes,
        userProgress: lesson.userProgress && lesson.userProgress[0] ? lesson.userProgress[0] : null,
      },
    });
  } catch (error) {
    console.error('getLessonById error:', error);
    return res.status(500).json({ message: 'Lỗi khi tải chi tiết bài học.' });
  }
}

async function completeLesson(req, res) {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    const wasCompleted = existingProgress && existingProgress.completed;

    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        progress: 100,
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        progress: 100,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Reward XP if first time completed
    let xpGained = 0;
    if (!wasCompleted) {
      xpGained = 20;
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpGained },
        },
      });
    }

    return res.json({
      message: 'Hoàn thành bài học thành công!',
      progress,
      xpGained,
    });
  } catch (error) {
    console.error('completeLesson error:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật hoàn thành bài học.' });
  }
}

module.exports = {
  getLessons,
  getLessonById,
  completeLesson,
};
