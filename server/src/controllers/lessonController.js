const prisma = require('../db');

async function getLessons(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.role === 'ADMIN' : false;

    // Parse query params
    const levelQuery = req.query.level;
    const effectiveLevel = levelQuery && levelQuery !== 'All' ? levelQuery : (levelQuery === 'All' ? 'All' : (req.user?.level || 'A1'));
    const categoryQuery = req.query.category;
    const searchQuery = req.query.search ? req.query.search.trim() : null;
    const statusQuery = req.query.status;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 12);

    // 1. Fetch user progress to map completed orderNumbers per level
    const userProgressList = userId
      ? await prisma.userProgress.findMany({
          where: { userId },
          include: {
            lesson: {
              select: { id: true, level: true, orderNumber: true },
            },
          },
        })
      : [];

    const userProgressMap = new Map();
    const completedOrdersByLevel = {
      A1: new Set(),
      A2: new Set(),
      B1: new Set(),
      B2: new Set(),
      C1: new Set(),
      C2: new Set(),
    };

    userProgressList.forEach((up) => {
      userProgressMap.set(up.lessonId, up);
      if (up.completed && up.lesson) {
        if (!completedOrdersByLevel[up.lesson.level]) {
          completedOrdersByLevel[up.lesson.level] = new Set();
        }
        completedOrdersByLevel[up.lesson.level].add(up.lesson.orderNumber);
      }
    });

    // 2. Build where filter for DB query
    const where = {};
    if (effectiveLevel !== 'All') {
      where.level = effectiveLevel;
    }
    if (categoryQuery && categoryQuery !== 'All') {
      where.category = categoryQuery;
    }
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
      ];
    }

    // 3. Level-specific Categories & Level-specific KPI Stats
    const levelStatsWhere = effectiveLevel !== 'All' ? { level: effectiveLevel } : {};

    // Total lessons in current level
    const totalInLevel = await prisma.lesson.count({ where: levelStatsWhere });

    // Completed in current level
    const completedInLevel = userProgressList.filter(
      (up) => up.completed && up.lesson && (effectiveLevel === 'All' || up.lesson.level === effectiveLevel)
    ).length;

    // Learning in current level
    const learningInLevel = userProgressList.filter(
      (up) => !up.completed && up.progress > 0 && up.lesson && (effectiveLevel === 'All' || up.lesson.level === effectiveLevel)
    ).length;

    // Available categories in current level
    const distinctCatRecords = await prisma.lesson.findMany({
      where: levelStatsWhere,
      select: { category: true },
      distinct: ['category'],
    });
    const categories = distinctCatRecords.map((c) => c.category).sort();

    // 4. Fetch lessons matching filters
    const allMatchingLessons = await prisma.lesson.findMany({
      where,
      orderBy: [
        { level: 'asc' },
        { orderNumber: 'asc' },
      ],
      include: {
        _count: {
          select: {
            vocabularies: true,
            grammarPoints: true,
            exercises: true,
            quizzes: true,
          },
        },
      },
    });

    // Format and calculate sequential lock status per level
    let formatted = allMatchingLessons.map((l) => {
      const up = userProgressMap.get(l.id);
      const isCompleted = up ? up.completed : false;

      // Independent Per-Level Sequential Progression:
      // Lesson 1 of any level is never locked.
      // Lesson N (N > 1) is unlocked if Lesson N - 1 in THAT SAME level is completed.
      const levelSet = completedOrdersByLevel[l.level] || new Set();
      const prevOrderCompleted = l.orderNumber === 1 || levelSet.has(l.orderNumber - 1);
      const isLocked = !isAdmin && !prevOrderCompleted;
      const isCurrentActive = !isCompleted && !isLocked;

      return {
        id: l.id,
        title: l.title,
        description: l.description,
        level: l.level,
        category: l.category,
        orderNumber: l.orderNumber,
        durationMinutes: l.durationMinutes,
        counts: l._count,
        progress: up ? up.progress : 0,
        completed: isCompleted,
        score: up ? up.score : 0,
        isLocked,
        isCurrentActive,
      };
    });

    // Filter by status if requested
    if (statusQuery && statusQuery !== 'all') {
      if (statusQuery === 'completed') {
        formatted = formatted.filter((l) => l.completed);
      } else if (statusQuery === 'learning') {
        formatted = formatted.filter((l) => !l.completed && l.progress > 0);
      } else if (statusQuery === 'not_started') {
        formatted = formatted.filter((l) => !l.completed && l.progress === 0);
      }
    }

    // 5. Pagination
    const totalMatching = formatted.length;
    const totalPages = Math.ceil(totalMatching / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedLessons = formatted.slice(startIndex, startIndex + limit);

    return res.json({
      lessons: paginatedLessons,
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalPages,
      },
      stats: {
        totalInLevel,
        completedInLevel,
        learningInLevel,
      },
      categories,
    });
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

    // Check sequential progression lock for non-admin students within the same level
    if (userId && req.user.role !== 'ADMIN' && lesson.orderNumber > 1) {
      const prevLesson = await prisma.lesson.findFirst({
        where: { level: lesson.level, orderNumber: lesson.orderNumber - 1 },
      });
      if (prevLesson) {
        const prevProgress = await prisma.userProgress.findUnique({
          where: { userId_lessonId: { userId, lessonId: prevLesson.id } },
        });
        if (!prevProgress || !prevProgress.completed) {
          return res.status(403).json({
            message: `Bài học này đang bị khóa. Bạn cần hoàn thành Bài ${prevLesson.orderNumber}: "${prevLesson.title}" của cấp độ ${lesson.level} theo thứ tự trước.`,
            isLocked: true,
            requiredLessonId: prevLesson.id,
            requiredLessonTitle: prevLesson.title,
            requiredOrderNumber: prevLesson.orderNumber,
            level: lesson.level,
          });
        }
      }
    }

    // Parse JSON fields
    const formattedGrammar = lesson.grammarPoints.map((g) => {
      let parsedExamples = [];
      let practiceQuestions = [];
      if (g.examples) {
        try {
          const parsed = typeof g.examples === 'string' ? JSON.parse(g.examples) : g.examples;
          if (Array.isArray(parsed)) {
            parsedExamples = parsed;
          } else if (parsed && typeof parsed === 'object') {
            parsedExamples = parsed.list || [];
            practiceQuestions = parsed.questions || [];
          }
        } catch {
          parsedExamples = [];
        }
      }
      return {
        ...g,
        examples: parsedExamples,
        practiceQuestions,
      };
    });

    const formattedListening = lesson.listenings.map((l) => ({
      ...l,
      questions: l.questions ? (typeof l.questions === 'string' ? JSON.parse(l.questions) : l.questions) : [],
    }));

    const formattedConversations = lesson.conversations.map((c) => ({
      ...c,
      dialogue: c.dialogue ? (typeof c.dialogue === 'string' ? JSON.parse(c.dialogue) : c.dialogue) : [],
    }));

    const formattedExercises = lesson.exercises.map((e) => ({
      ...e,
      options: e.options ? (typeof e.options === 'string' ? JSON.parse(e.options) : e.options) : null,
    }));

    const formattedQuizzes = lesson.quizzes.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
      correctAnswer: q.correctAnswer,
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
      message: 'Hoàn thành bài học thành công! Bài học tiếp theo đã được mở khóa.',
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
