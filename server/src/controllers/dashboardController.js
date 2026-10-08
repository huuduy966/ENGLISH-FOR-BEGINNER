const prisma = require('../db');

async function getDashboard(req, res) {
  try {
    const userId = req.user.id;

    // Fetch user with latest stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        goal: true,
        xp: true,
        streakDays: true,
      },
    });

    // Fetch all lessons ordered
    const allLessons = await prisma.lesson.findMany({
      orderBy: { orderNumber: 'asc' },
      include: {
        userProgress: {
          where: { userId },
        },
        vocabularies: {
          take: 10,
        },
        grammarPoints: {
          take: 1,
        },
        conversations: {
          take: 1,
        },
      },
    });

    // Find in-progress lesson or next uncompleted lesson
    let continueLesson = null;
    let nextLesson = null;

    for (const l of allLessons) {
      const up = l.userProgress[0];
      if (up && !up.completed && up.progress > 0) {
        continueLesson = {
          id: l.id,
          title: l.title,
          category: l.category,
          orderNumber: l.orderNumber,
          progress: up.progress,
        };
        break;
      }
    }

    for (const l of allLessons) {
      const up = l.userProgress[0];
      if (!up || !up.completed) {
        nextLesson = l;
        break;
      }
    }

    if (!nextLesson && allLessons.length > 0) {
      nextLesson = allLessons[0]; // If all completed, recommend lesson 1 for review
    }

    // Count user mastered / learning words
    const userWordsCount = await prisma.userVocabulary.count({
      where: { userId },
    });

    const completedLessonsCount = await prisma.userProgress.count({
      where: { userId, completed: true },
    });

    // Construct Today's Learning Package
    const todaysPackage = nextLesson ? {
      lessonId: nextLesson.id,
      lessonTitle: nextLesson.title,
      vocabCount: nextLesson.vocabularies.length,
      vocabSample: nextLesson.vocabularies.map((v) => ({
        id: v.id,
        word: v.word,
        meaning: v.meaning,
        pronunciation: v.pronunciation,
      })),
      grammarTitle: nextLesson.grammarPoints[0]?.title || 'Ngữ pháp cơ bản',
      conversationTitle: nextLesson.conversations[0]?.title || 'Hội thoại đời sống',
      estimatedMinutes: nextLesson.durationMinutes,
    } : null;

    // Today's goal mock/calculation
    const todaysGoal = {
      vocabulary: { current: Math.min(userWordsCount, 15), target: 15 },
      grammar: { current: completedLessonsCount > 0 ? 1 : 0, target: 1 },
      listening: { current: completedLessonsCount > 0 ? 1 : 0, target: 1 },
      progressPercent: Math.min(Math.round(((completedLessonsCount ? 50 : 20) + (userWordsCount ? 30 : 0))), 100),
    };

    return res.json({
      user,
      stats: {
        streakDays: user.streakDays,
        xp: user.xp,
        wordsLearned: userWordsCount,
        lessonsCompleted: completedLessonsCount,
        totalLessons: allLessons.length,
      },
      continueLesson,
      todaysPackage,
      todaysGoal,
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    return res.status(500).json({ message: 'Không thể tải thông tin Dashboard.' });
  }
}

async function getProgressStats(req, res) {
  try {
    const userId = req.user.id;

    const completedLessons = await prisma.userProgress.count({
      where: { userId, completed: true },
    });

    const totalLessons = await prisma.lesson.count();

    const wordsLearned = await prisma.userVocabulary.count({
      where: { userId },
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalQuizzes = quizAttempts.length;
    const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
    const avgScore = totalQuizzes > 0
      ? Math.round(quizAttempts.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0) / totalQuizzes)
      : 0;

    // Skill breakdown estimate based on completed lessons
    const vocabScore = Math.min(20 + wordsLearned * 2, 95);
    const grammarScore = Math.min(25 + completedLessons * 15, 90);
    const listeningScore = Math.min(20 + completedLessons * 12, 85);
    const speakingScore = Math.min(15 + completedLessons * 10, 80);

    return res.json({
      overview: {
        totalStudyHours: (completedLessons * 0.4 + 1.2).toFixed(1),
        completedLessons,
        totalLessons,
        wordsLearned,
        totalQuizzes,
        passedQuizzes,
        averageScore: avgScore,
      },
      skills: {
        vocabulary: vocabScore,
        grammar: grammarScore,
        listening: listeningScore,
        speaking: speakingScore,
      },
      recentQuizzes: quizAttempts,
    });
  } catch (error) {
    console.error('getProgressStats error:', error);
    return res.status(500).json({ message: 'Lỗi tải thống kê tiến độ.' });
  }
}

module.exports = {
  getDashboard,
  getProgressStats,
};
