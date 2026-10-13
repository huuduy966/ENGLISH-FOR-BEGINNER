const prisma = require('../db');
const { getVietnamDateString, getMsUntilNextMidnightVN, getPastDateStrings } = require('../utils/vietnamTime');

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
        practiceScore: true,
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

    const completedExamsCount = await prisma.examAttempt.count({
      where: { userId, isCompleted: 1 },
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

    // Fetch today's practice session to synchronize Today's Goal exactly with Today's Learning (60 questions)
    const todayDate = getVietnamDateString();
    const todayPractice = await prisma.dailyPractice.findUnique({
      where: { userId_date: { userId, date: todayDate } },
    });

    let vocabCurrent = 0;
    let speakingCurrent = 0;
    let errorCurrent = 0;
    let listeningCurrent = 0;
    let readingCurrent = 0;
    let totalCompleted = 0;

    if (todayPractice && todayPractice.sessionData) {
      try {
        const parts = JSON.parse(todayPractice.sessionData);
        const p1 = parts.find((p) => p.partNumber === 1);
        const p2 = parts.find((p) => p.partNumber === 2);
        const p3 = parts.find((p) => p.partNumber === 3);
        const p4 = parts.find((p) => p.partNumber === 4);
        const p5 = parts.find((p) => p.partNumber === 5);

        const isQDone = (q) => Boolean(q && (q.isAnswered || q.isCorrect || (q.selectedAnswer !== undefined && q.selectedAnswer !== null)));

        vocabCurrent = p1?.questions?.filter(isQDone)?.length || 0;
        speakingCurrent = p2?.questions?.filter(isQDone)?.length || 0;
        errorCurrent = p3?.questions?.filter(isQDone)?.length || 0;
        listeningCurrent = p4?.questions?.filter(isQDone)?.length || 0;
        readingCurrent = p5?.questions?.filter(isQDone)?.length || 0;
        totalCompleted = vocabCurrent + speakingCurrent + errorCurrent + listeningCurrent + readingCurrent;
      } catch (err) {
        console.warn('Error parsing today practice sessionData:', err.message);
      }
    }

    const todaysGoal = {
      vietnamDate: todayDate,
      vocabulary: { current: vocabCurrent, target: 20 },
      speaking: { current: speakingCurrent, target: 10 },
      errorCorrection: { current: errorCurrent, target: 10 },
      listening: { current: listeningCurrent, target: 10 },
      reading: { current: readingCurrent, target: 10 },
      completedCount: totalCompleted,
      totalQuestions: 60,
      remainingCount: Math.max(0, 60 - totalCompleted),
      progressPercent: Math.min(100, Math.round((totalCompleted / 60) * 100)),
      todayScore: todayPractice?.score || 0,
    };

    return res.json({
      user,
      vietnamTime: {
        date: todayDate,
        msUntilMidnight: getMsUntilNextMidnightVN(),
      },
      stats: {
        streakDays: user.streakDays,
        practiceScore: user.practiceScore || 0,
        wordsLearned: userWordsCount,
        lessonsCompleted: completedLessonsCount,
        totalLessons: allLessons.length,
        examsCompleted: completedExamsCount,
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
    const requestedPeriod = req.query.period || '7_days';
    const period = ['7_days', '30_days', '90_days', 'all_time'].includes(requestedPeriod)
      ? requestedPeriod
      : '7_days';

    // 1. Fetch User profile and lifetime stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        goal: true,
        practiceScore: true,
        streakDays: true,
        lastStudyDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    // Determine day count for the period
    let daysCount = 7;
    if (period === '30_days') daysCount = 30;
    else if (period === '90_days') daysCount = 90;
    else if (period === 'all_time') {
      const userCreated = new Date(user.createdAt);
      const diffDays = Math.ceil((Date.now() - userCreated.getTime()) / (1000 * 60 * 60 * 24));
      daysCount = Math.min(180, Math.max(30, diffDays + 1));
    }

    const dateList = getPastDateStrings(daysCount);
    const startDateStr = dateList[0];
    const endDateStr = dateList[dateList.length - 1];
    const periodDateSet = new Set(dateList);

    // 2. Fetch UserProgress with Lessons
    const allLessons = await prisma.lesson.findMany({
      select: { id: true, title: true, level: true, orderNumber: true, durationMinutes: true, category: true },
    });

    const userProgressList = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: { id: true, title: true, level: true, orderNumber: true, durationMinutes: true, category: true },
        },
      },
    });

    // 3. Fetch DailyPractice history
    const dailyPractices = await prisma.dailyPractice.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    // 4. Fetch ExamAttempts (both completed and detailed)
    const completedExams = await prisma.$queryRawUnsafe(
      `SELECT id, level, examTitle, score, correctCount, wrongCount, unansweredCount, totalQuestions, durationMinutes, startedAt, submittedAt, isCompleted, resultData
       FROM ExamAttempt
       WHERE userId = ? AND isCompleted = 1
       ORDER BY id DESC`,
      userId
    );

    // 5. Fetch UserVocabulary
    const userVocabularies = await prisma.userVocabulary.findMany({
      where: { userId },
      include: {
        vocabulary: {
          select: { id: true, word: true, meaning: true, category: true, level: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // 6. Fetch QuizAttempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // --- COMPUTE LIFETIME METRICS ---
    const completedLessons = userProgressList.filter((up) => up.completed);
    const completedLessonsCount = completedLessons.length;
    const totalLessons = allLessons.length;

    const wordsLearnedTotal = userVocabularies.length;
    const wordsMastered = userVocabularies.filter((uv) => uv.status === 'MASTERED').length;
    const wordsLearning = userVocabularies.filter((uv) => uv.status === 'LEARNING' || !uv.status).length;
    const wordsNeedReview = userVocabularies.filter((uv) => uv.status === 'NEED_REVIEW').length;
    const wordsFavorite = userVocabularies.filter((uv) => uv.isFavorite).length;

    // Study time calculation in minutes
    let totalStudyMinutes = 0;
    userProgressList.forEach((up) => {
      const dur = up.lesson?.durationMinutes || 15;
      if (up.completed) {
        totalStudyMinutes += dur;
      } else if (up.progress > 0) {
        totalStudyMinutes += Math.round((up.progress / 100) * dur);
      }
    });

    dailyPractices.forEach((dp) => {
      if (dp.completed) {
        totalStudyMinutes += 15;
      } else {
        try {
          const parts = JSON.parse(dp.sessionData || '[]');
          let answered = 0;
          parts.forEach((p) => {
            p.questions?.forEach((q) => {
              if (q.isAnswered || q.isCorrect || q.selectedAnswer) answered++;
            });
          });
          totalStudyMinutes += Math.round(answered * 0.4);
        } catch {
          totalStudyMinutes += 5;
        }
      }
    });

    completedExams.forEach((e) => {
      totalStudyMinutes += Math.min(60, e.durationMinutes || 35);
    });

    const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

    // --- BUILD DAY-BY-DAY ACTIVITY FOR REQUESTED PERIOD ---
    const dailyPracticeMap = new Map();
    dailyPractices.forEach((dp) => dailyPracticeMap.set(dp.date, dp));

    const dayOfWeekNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    let periodQuestionsCount = 0;
    let periodCorrectCount = 0;
    let periodWrongCount = 0;
    let periodScoreGained = 0;
    let periodLessonsCompletedCount = 0;
    let periodStudyMinutes = 0;
    let periodExamsCount = 0;

    // Skill counters for detailed breakdown
    const skillCounts = {
      vocabulary: { done: 0, correct: 0 },
      grammar: { done: 0, correct: 0 },
      speaking: { done: 0, correct: 0 },
      listening: { done: 0, correct: 0 },
      reading: { done: 0, correct: 0 },
      sentenceBuilding: { done: 0, correct: 0 },
    };

    // Process daily practices for skill aggregation
    dailyPractices.forEach((dp) => {
      try {
        const parts = JSON.parse(dp.sessionData || '[]');
        parts.forEach((p) => {
          (p.questions || []).forEach((q) => {
            const isDone = Boolean(q.isAnswered || q.isCorrect || q.selectedAnswer);
            if (isDone) {
              const isCor = Boolean(q.isCorrect);
              if (p.partNumber === 1) {
                skillCounts.vocabulary.done++;
                if (isCor) skillCounts.vocabulary.correct++;
              } else if (p.partNumber === 2) {
                skillCounts.speaking.done++;
                if (isCor) skillCounts.speaking.correct++;
              } else if (p.partNumber === 3) {
                skillCounts.grammar.done++;
                if (isCor) skillCounts.grammar.correct++;
              } else if (p.partNumber === 4) {
                skillCounts.listening.done++;
                if (isCor) skillCounts.listening.correct++;
              } else if (p.partNumber === 5) {
                skillCounts.reading.done++;
                if (isCor) skillCounts.reading.correct++;
              }
            }
          });
        });
      } catch {}
    });

    // Process completed exams for skill aggregation
    completedExams.forEach((e) => {
      try {
        const evalData = typeof e.resultData === 'string' ? JSON.parse(e.resultData) : e.resultData;
        (evalData?.reviews || []).forEach((r) => {
          const isDone = !r.isUnanswered;
          if (isDone) {
            const isCor = Boolean(r.isCorrect);
            if (r.partNumber === 1) {
              skillCounts.vocabulary.done++;
              if (isCor) skillCounts.vocabulary.correct++;
            } else if (r.partNumber === 2) {
              skillCounts.grammar.done++;
              if (isCor) skillCounts.grammar.correct++;
            } else if (r.partNumber === 3) {
              skillCounts.listening.done++;
              if (isCor) skillCounts.listening.correct++;
            } else if (r.partNumber === 4) {
              skillCounts.reading.done++;
              if (isCor) skillCounts.reading.correct++;
            } else if (r.partNumber === 5) {
              skillCounts.sentenceBuilding.done++;
              if (isCor) skillCounts.sentenceBuilding.correct++;
            }
          }
        });
      } catch {}
    });

    // Build day-by-day array for chart & calendar
    const dailyActivity = dateList.map((dStr) => {
      const dateObj = new Date(dStr + 'T00:00:00Z');
      const dayOfWeek = dayOfWeekNames[dateObj.getUTCDay()];
      const dateParts = dStr.split('-');
      const displayDate = `${dateParts[2]}/${dateParts[1]}`;

      // 1. Daily practice data on this day
      const dp = dailyPracticeMap.get(dStr);
      let qAnswered = 0;
      let qCorrect = 0;
      let qWrong = 0;
      let dayScore = dp ? dp.score : 0;

      if (dp && dp.sessionData) {
        try {
          const parts = JSON.parse(dp.sessionData);
          parts.forEach((p) => {
            (p.questions || []).forEach((q) => {
              if (q.isAnswered || q.isCorrect || q.selectedAnswer) {
                qAnswered++;
                if (q.isCorrect) qCorrect++;
                else qWrong++;
              }
            });
          });
        } catch {}
      }

      // 2. Lessons completed on this day
      const lessonsOnDay = userProgressList.filter((up) => {
        if (!up.completed || !up.completedAt) return false;
        return getVietnamDateString(new Date(up.completedAt)) === dStr;
      });

      // 3. Exams completed on this day
      const examsOnDay = completedExams.filter((e) => {
        if (!e.submittedAt) return false;
        return getVietnamDateString(new Date(e.submittedAt)) === dStr;
      });

      examsOnDay.forEach((e) => {
        qAnswered += e.totalQuestions || 40;
        qCorrect += e.correctCount || 0;
        qWrong += e.wrongCount || 0;
      });

      // Study minutes on this day
      const dayStudyMinutes =
        lessonsOnDay.length * 15 +
        examsOnDay.length * 35 +
        (dp ? (dp.completed ? 15 : Math.round(qAnswered * 0.4)) : 0);

      // Aggregate in-period totals
      periodQuestionsCount += qAnswered;
      periodCorrectCount += qCorrect;
      periodWrongCount += qWrong;
      periodScoreGained += dayScore;
      periodLessonsCompletedCount += lessonsOnDay.length;
      periodStudyMinutes += dayStudyMinutes;
      periodExamsCount += examsOnDay.length;

      // Activity intensity (0 to 4)
      let intensity = 0;
      if (qAnswered >= 50 || dayStudyMinutes >= 40 || examsOnDay.length > 0 || (dp && dp.completed)) {
        intensity = 4;
      } else if (qAnswered >= 30 || dayStudyMinutes >= 25 || lessonsOnDay.length > 0) {
        intensity = 3;
      } else if (qAnswered >= 15 || dayStudyMinutes >= 12) {
        intensity = 2;
      } else if (qAnswered > 0 || dayStudyMinutes > 0) {
        intensity = 1;
      }

      const hasActivity = intensity > 0;

      return {
        date: dStr,
        displayDate,
        dayOfWeek,
        studyMinutes: dayStudyMinutes,
        questionsCount: qAnswered,
        correctCount: qCorrect,
        wrongCount: qWrong,
        scoreGained: dayScore,
        lessonsCompleted: lessonsOnDay.length,
        examsCompleted: examsOnDay.length,
        hasActivity,
        intensity,
        details: {
          lessons: lessonsOnDay.map((up) => ({
            id: up.lessonId,
            title: up.lesson?.title || `Bài ${up.lesson?.orderNumber}`,
            level: up.lesson?.level || 'A1',
          })),
          exams: examsOnDay.map((e) => ({
            id: e.id,
            title: e.examTitle,
            score: e.score,
          })),
        },
      };
    });

    // --- CEFR ROADMAP BREAKDOWN (A1 to C2) ---
    const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const cefrRoadmap = cefrLevels.map((lvl) => {
      const lessonsInLvl = allLessons.filter((l) => l.level === lvl);
      const totalInLvl = lessonsInLvl.length || 30;
      const completedInLvl = userProgressList.filter(
        (up) => up.completed && up.lesson && up.lesson.level === lvl
      ).length;
      const progressPercent = Math.min(100, Math.round((completedInLvl / totalInLvl) * 100));

      const examsInLvl = completedExams.filter((e) => e.level === lvl);
      const avgExamScore =
        examsInLvl.length > 0
          ? (examsInLvl.reduce((acc, curr) => acc + curr.score, 0) / examsInLvl.length).toFixed(1)
          : null;

      let status = 'NOT_STARTED';
      if (progressPercent === 100) {
        status = 'COMPLETED';
      } else if (progressPercent > 0 || user.level === lvl) {
        status = 'IN_PROGRESS';
      }

      const levelNames = {
        A1: 'A1 - Beginner (Người mới bắt đầu)',
        A2: 'A2 - Elementary (Sơ cấp)',
        B1: 'B1 - Intermediate (Trung cấp)',
        B2: 'B2 - Upper Intermediate (Trung cao cấp)',
        C1: 'C1 - Advanced (Cao cấp)',
        C2: 'C2 - Proficiency (Thành thạo)',
      };

      return {
        level: lvl,
        name: levelNames[lvl] || `${lvl} Level`,
        totalLessons: totalInLvl,
        completedLessons: completedInLvl,
        progressPercent,
        status,
        averageExamScore: avgExamScore ? parseFloat(avgExamScore) : null,
        examsCount: examsInLvl.length,
      };
    });

    // --- SKILLS DETAILED BREAKDOWN ---
    const computeSkillObj = (key, label, totalDone, correct) => {
      const hasData = totalDone > 0;
      const accuracyPercent = hasData ? Math.round((correct / totalDone) * 100) : 0;
      return {
        key,
        label,
        totalQuestions: totalDone,
        correctCount: correct,
        accuracyPercent,
        hasData,
        message: hasData ? null : 'Chưa đủ dữ liệu',
      };
    };

    const skillMetrics = {
      vocabulary: {
        ...computeSkillObj('vocabulary', 'Từ vựng (Vocabulary)', skillCounts.vocabulary.done, skillCounts.vocabulary.correct),
        wordsLearnedTotal,
        wordsMastered,
      },
      grammar: computeSkillObj('grammar', 'Ngữ pháp (Grammar)', skillCounts.grammar.done, skillCounts.grammar.correct),
      speaking: computeSkillObj('speaking', 'Luyện nói & Tình huống (Speaking)', skillCounts.speaking.done, skillCounts.speaking.correct),
      listening: computeSkillObj('listening', 'Luyện nghe (Listening)', skillCounts.listening.done, skillCounts.listening.correct),
      reading: computeSkillObj('reading', 'Đọc hiểu (Reading)', skillCounts.reading.done, skillCounts.reading.correct),
      sentenceBuilding: computeSkillObj('sentenceBuilding', 'Sắp xếp câu & Cấu trúc', skillCounts.sentenceBuilding.done, skillCounts.sentenceBuilding.correct),
      exam: {
        key: 'exam',
        label: 'Bài kiểm tra năng lực (Exam)',
        totalAttempts: completedExams.length,
        averageScore:
          completedExams.length > 0
            ? (completedExams.reduce((acc, curr) => acc + curr.score, 0) / completedExams.length).toFixed(1)
            : null,
        highestScore: completedExams.length > 0 ? Math.max(...completedExams.map((e) => e.score)).toFixed(1) : null,
        latestScore: completedExams.length > 0 ? completedExams[0].score.toFixed(1) : null,
        passRate:
          completedExams.length > 0
            ? Math.round((completedExams.filter((e) => e.score >= 5.0).length / completedExams.length) * 100)
            : null,
        hasData: completedExams.length > 0,
        message: completedExams.length > 0 ? null : 'Chưa có bài kiểm tra hoàn thành',
      },
    };

    // --- CHRONOLOGICAL ACTIVITY FEED ---
    const rawEvents = [];

    // Completed Lessons
    userProgressList.forEach((up) => {
      if (up.completed && up.completedAt) {
        rawEvents.push({
          id: `lesson_${up.id}`,
          type: 'LESSON_COMPLETED',
          title: `Hoàn thành Bài ${up.lesson?.orderNumber}: ${up.lesson?.title || 'Bài học'}`,
          subtitle: `Cấp độ ${up.lesson?.level || 'A1'} • ${up.lesson?.category || 'Cơ bản'}`,
          badge: 'Đã hoàn thành',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          timestamp: up.completedAt,
        });
      }
    });

    // Completed Exams
    completedExams.forEach((e) => {
      if (e.submittedAt) {
        rawEvents.push({
          id: `exam_${e.id}`,
          type: 'EXAM_COMPLETED',
          title: `Nộp bài thi: ${e.examTitle}`,
          subtitle: `Đạt ${e.score}/10.0 điểm (${e.correctCount}/${e.totalQuestions} câu đúng)`,
          badge: 'Hoàn thành bài thi',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          timestamp: e.submittedAt,
        });
      }
    });

    // Active Daily Practices
    dailyPractices.forEach((dp) => {
      if (dp.score > 0 || dp.completed) {
        rawEvents.push({
          id: `dp_${dp.id}`,
          type: 'DAILY_PRACTICE',
          title: `Luyện tập hằng ngày (${dp.date})`,
          subtitle: dp.completed ? 'Hoàn thành trọn gói 60 câu hỏi' : `Ghi được ${dp.score} điểm làm bài`,
          badge: `+${dp.score} điểm`,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          timestamp: dp.updatedAt,
        });
      }
    });

    // Saved Vocabularies
    userVocabularies.slice(0, 15).forEach((uv) => {
      if (uv.updatedAt && uv.vocabulary) {
        rawEvents.push({
          id: `vocab_${uv.id}`,
          type: 'VOCAB_SAVED',
          title: `Sổ tay: "${uv.vocabulary.word}"`,
          subtitle: `${uv.vocabulary.meaning}`,
          badge: uv.status === 'MASTERED' ? 'Đã thuộc' : (uv.status === 'NEED_REVIEW' ? 'Cần ôn' : 'Đang học'),
          badgeColor: uv.status === 'MASTERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200',
          timestamp: uv.updatedAt,
        });
      }
    });

    // Sort descending by timestamp
    rawEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = rawEvents.slice(0, 20);

    // --- OVERVIEW CARDS PAYLOAD ---
    const periodAccuracyPercent =
      periodQuestionsCount > 0 ? Math.round((periodCorrectCount / periodQuestionsCount) * 100) : 0;

    const kpiCards = {
      completedLessons: {
        value: completedLessonsCount,
        total: totalLessons,
        periodValue: periodLessonsCompletedCount,
        label: 'Bài học hoàn thành',
        unit: 'bài',
      },
      practiceScore: {
        value: user.practiceScore || 0,
        periodValue: periodScoreGained,
        label: 'Điểm làm bài tích lũy',
        unit: 'điểm',
      },
      wordsLearned: {
        value: wordsLearnedTotal,
        mastered: wordsMastered,
        learning: wordsLearning,
        needReview: wordsNeedReview,
        label: 'Từ vựng đã lưu',
        unit: 'từ',
      },
      studyTime: {
        value: totalStudyHours,
        periodMinutes: periodStudyMinutes,
        label: 'Thời gian học tập',
        unit: 'giờ',
      },
      streak: {
        value: user.streakDays || 0,
        label: 'Chuỗi ngày liên tục',
        unit: 'ngày',
      },
      accuracy: {
        value: periodAccuracyPercent,
        label: 'Độ chính xác trung bình',
        unit: '%',
      },
    };

    // Calculate backward compatible avg quiz score
    const totalQuizzes = quizAttempts.length;
    const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
    const avgScore =
      totalQuizzes > 0
        ? Math.round(quizAttempts.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0) / totalQuizzes)
        : 0;

    return res.json({
      period,
      daysCount,
      startDate: startDateStr,
      endDate: endDateStr,
      userLevel: user.level || 'A1',
      kpiCards,
      periodSummary: {
        questionsAnswered: periodQuestionsCount,
        correctAnswers: periodCorrectCount,
        wrongAnswers: periodWrongCount,
        accuracyPercent: periodAccuracyPercent,
        scoreGained: periodScoreGained,
        lessonsCompleted: periodLessonsCompletedCount,
        examsCompleted: periodExamsCount,
        studyMinutes: periodStudyMinutes,
        studyHours: (periodStudyMinutes / 60).toFixed(1),
      },
      dailyActivity,
      skillMetrics,
      cefrRoadmap,
      recentActivities,
      // Backward compatible root keys
      overview: {
        totalStudyHours,
        completedLessons: completedLessonsCount,
        totalLessons,
        wordsLearned: wordsLearnedTotal,
        totalQuizzes,
        passedQuizzes,
        averageScore: avgScore,
      },
      skills: {
        vocabulary: skillMetrics.vocabulary.accuracyPercent || 75,
        grammar: skillMetrics.grammar.accuracyPercent || 60,
        listening: skillMetrics.listening.accuracyPercent || 55,
        speaking: skillMetrics.speaking.accuracyPercent || 45,
      },
      recentQuizzes: quizAttempts.slice(0, 10),
    });
  } catch (error) {
    console.error('getProgressStats error:', error);
    return res.status(500).json({ message: 'Lỗi tải thống kê tiến độ học tập.' });
  }
}

module.exports = {
  getDashboard,
  getProgressStats,
};
