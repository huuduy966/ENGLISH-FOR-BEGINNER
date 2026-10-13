const prisma = require('../db');

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Determines which CEFR levels are unlocked for a user.
 * Rules:
 * 1. Admin has all levels unlocked.
 * 2. Levels up to user.level (from placement test or manual assignment) are unlocked (e.g. tested into A2 -> A1, A2 unlocked).
 * 3. Higher levels unlock when all lessons of the preceding level are completed (e.g. 30/30 of A1 completed -> A2 unlocked).
 */
async function getUnlockedLevelsForUser(userId, userLevel, isAdmin = false) {
  const unlocked = new Set();
  if (isAdmin) {
    CEFR_ORDER.forEach((lvl) => unlocked.add(lvl));
    return unlocked;
  }

  // 1. Current user level from profile (e.g. from placement test or profile setting)
  const currentLvl = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(userLevel) ? userLevel : 'A1';
  const currentIdx = CEFR_ORDER.indexOf(currentLvl);

  // All levels from A1 up to currentLvl are unlocked
  for (let i = 0; i <= currentIdx; i++) {
    unlocked.add(CEFR_ORDER[i]);
  }

  // 2. Progressive unlock: Check if levels beyond currentLvl are unlocked through completing prior levels
  if (userId) {
    for (let i = currentIdx + 1; i < CEFR_ORDER.length; i++) {
      const prevLvl = CEFR_ORDER[i - 1];
      const totalInPrev = await prisma.lesson.count({ where: { level: prevLvl } });
      const completedInPrev = await prisma.userProgress.count({
        where: {
          userId,
          completed: true,
          lesson: { level: prevLvl },
        },
      });

      // If user completed all lessons of previous level (e.g. 30/30), unlock this higher level
      if (totalInPrev > 0 && completedInPrev >= totalInPrev) {
        unlocked.add(CEFR_ORDER[i]);
      } else {
        break; // Progression is strictly sequential across levels
      }
    }
  }

  return unlocked;
}

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

    // Check which CEFR levels are unlocked for this user
    const unlockedLevels = await getUnlockedLevelsForUser(userId, req.user?.level || 'A1', isAdmin);

    // Format and calculate sequential lock status per level & cross-level
    let formatted = allMatchingLessons.map((l) => {
      const up = userProgressMap.get(l.id);
      const isCompleted = up ? up.completed : false;

      // Cross-Level Progression: Is this lesson's level unlocked for the student?
      const isLevelUnlocked = isAdmin || unlockedLevels.has(l.level);

      let isLocked = false;
      let isLevelLocked = false;

      if (!isLevelUnlocked) {
        // Level is locked (e.g. A2 locked because A1 not yet completed and user not assessed A2)
        isLocked = true;
        isLevelLocked = true;
      } else {
        // Level is unlocked. Enforce in-level sequential lock:
        // Lesson 1 is always unlocked.
        // Lesson N (N > 1) is unlocked if Lesson N - 1 in that level was completed.
        const levelSet = completedOrdersByLevel[l.level] || new Set();
        const prevOrderCompleted = l.orderNumber === 1 || levelSet.has(l.orderNumber - 1);
        isLocked = !isAdmin && !prevOrderCompleted;
      }

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
        isLevelLocked,
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
      unlockedLevels: Array.from(unlockedLevels),
      isCurrentLevelLocked: !isAdmin && effectiveLevel !== 'All' && !unlockedLevels.has(effectiveLevel),
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
        readings: true,
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

    // Check progression lock for non-admin students
    if (userId && req.user.role !== 'ADMIN') {
      const unlockedLevels = await getUnlockedLevelsForUser(userId, req.user?.level || 'A1', false);

      // 1. Cross-Level Check: Is this lesson's level unlocked for the student?
      if (!unlockedLevels.has(lesson.level)) {
        const lvlIdx = CEFR_ORDER.indexOf(lesson.level);
        const prevLvl = lvlIdx > 0 ? CEFR_ORDER[lvlIdx - 1] : 'A1';
        const totalInPrev = await prisma.lesson.count({ where: { level: prevLvl } });
        const completedInPrev = await prisma.userProgress.count({
          where: { userId, completed: true, lesson: { level: prevLvl } },
        });

        return res.status(403).json({
          message: `Cấp độ ${lesson.level} đang bị khóa. Bạn cần hoàn thành tất cả ${totalInPrev} bài học của cấp độ ${prevLvl} (hoặc đạt cấp độ ${lesson.level} trong bài kiểm tra đầu vào) để mở khóa cấp độ này.`,
          isLocked: true,
          isLevelLocked: true,
          lockedLevel: lesson.level,
          requiredLevel: prevLvl,
          requiredTotal: totalInPrev,
          currentCompletedInPrev: completedInPrev,
        });
      }

      // 2. In-Level Check: Lesson N (N > 1) requires Lesson N - 1 in that level completed
      if (lesson.orderNumber > 1) {
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
              isLevelLocked: false,
              requiredLessonId: prevLesson.id,
              requiredLessonTitle: prevLesson.title,
              requiredOrderNumber: prevLesson.orderNumber,
              level: lesson.level,
            });
          }
        }
      }
    }

    // Parse JSON fields
    const formattedGrammar = lesson.grammarPoints.map((g) => {
      let parsedExamples = [];
      if (g.examples) {
        try {
          const parsed = typeof g.examples === 'string' ? JSON.parse(g.examples) : g.examples;
          if (Array.isArray(parsed)) {
            parsedExamples = parsed;
          } else if (parsed && typeof parsed === 'object') {
            parsedExamples = parsed.list || [];
          }
        } catch {
          parsedExamples = [];
        }
      }
      return {
        ...g,
        examples: parsedExamples,
        practiceQuestions: [],
      };
    });

    const formattedListening = lesson.listenings.map((l) => ({
      ...l,
      questions: l.questions ? (typeof l.questions === 'string' ? JSON.parse(l.questions) : l.questions) : [],
    }));

    const formattedReadings = (lesson.readings || []).map((r) => ({
      ...r,
      questions: r.questions ? (typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions) : [],
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
        readings: formattedReadings,
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

    return res.json({
      message: 'Hoàn thành bài học thành công! Bài học tiếp theo đã được mở khóa.',
      progress,
    });
  } catch (error) {
    console.error('completeLesson error:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật hoàn thành bài học.' });
  }
}

async function updateProgress(req, res) {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { progress: inputProgress } = req.body;

    if (isNaN(lessonId)) {
      return res.status(400).json({ message: 'ID bài học không hợp lệ.' });
    }

    const progressValue = Math.min(100, Math.max(0, parseInt(inputProgress, 10) || 0));
    const isCompleted = progressValue === 100;

    const existing = await prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    const updated = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        progress: Math.max(existing?.progress || 0, progressValue),
        completed: isCompleted ? true : existing?.completed,
        completedAt: isCompleted ? (existing?.completedAt || new Date()) : existing?.completedAt,
      },
      create: {
        userId,
        lessonId,
        progress: progressValue,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return res.json({
      success: true,
      progress: updated.progress,
      completed: updated.completed,
    });
  } catch (error) {
    console.error('updateProgress error:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật tiến độ bài học.' });
  }
}

module.exports = {
  getLessons,
  getLessonById,
  completeLesson,
  updateProgress,
};
