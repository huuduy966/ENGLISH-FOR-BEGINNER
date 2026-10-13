const prisma = require('../db');
const { getQuestionsForLevel } = require('../../prisma/dailyQuestions');
const { getVietnamDateString } = require('../utils/vietnamTime');

function isQuestionCompleted(q) {
  return Boolean(q && (q.isAnswered || q.isCorrect || (q.selectedAnswer !== undefined && q.selectedAnswer !== null)));
}

async function getTodayPractice(req, res) {
  try {
    const userId = req.user.id;
    const todayDate = getVietnamDateString();
    const userLevel = req.user.level || 'A1';

    // 1. Find or create daily practice record for Vietnam date
    let practice = await prisma.dailyPractice.findUnique({
      where: { userId_date: { userId, date: todayDate } },
    });

    if (!practice) {
      // Gather recently used question IDs from previous days to prioritize fresh questions
      let recentQuestionIds = new Set();
      try {
        const recentSessions = await prisma.dailyPractice.findMany({
          where: { userId, date: { not: todayDate } },
          orderBy: { date: 'desc' },
          take: 5,
          select: { sessionData: true },
        });

        recentSessions.forEach((s) => {
          try {
            const pData = JSON.parse(s.sessionData);
            pData.forEach((part) => {
              part.questions?.forEach((q) => {
                if (q.id) recentQuestionIds.add(q.id);
              });
            });
          } catch {}
        });
      } catch (err) {
        console.warn('Warning: Could not fetch recent practice history:', err.message);
      }

      // Generate 60 questions in 5 parts strictly for the user's level
      const parts = getQuestionsForLevel(userLevel, {
        dateStr: todayDate,
        recentQuestionIds,
        seed: `${userId}_${todayDate}_${userLevel}`,
      });

      try {
        practice = await prisma.dailyPractice.create({
          data: {
            userId,
            date: todayDate,
            level: userLevel,
            score: 0,
            completed: false,
            currentPart: 1,
            currentQuestionIndex: 0,
            sessionData: JSON.stringify(parts),
          },
        });
      } catch (createErr) {
        // Concurrency guard: if another request created the record at the same moment
        if (createErr.code === 'P2002') {
          practice = await prisma.dailyPractice.findUnique({
            where: { userId_date: { userId, date: todayDate } },
          });
        } else {
          throw createErr;
        }
      }
    } else if (practice.level !== userLevel && practice.score === 0) {
      // User changed level before starting today's session: adapt questions to the new level
      const parts = getQuestionsForLevel(userLevel, {
        dateStr: todayDate,
        seed: `${userId}_${todayDate}_${userLevel}`,
      });
      practice = await prisma.dailyPractice.update({
        where: { id: practice.id },
        data: {
          level: userLevel,
          currentPart: 1,
          currentQuestionIndex: 0,
          sessionData: JSON.stringify(parts),
        },
      });
    }

    // 2. Parse session data and calculate statistics
    let parts = [];
    try {
      parts = JSON.parse(practice.sessionData);
    } catch {
      parts = getQuestionsForLevel(userLevel, { dateStr: todayDate });
    }

    let completedCount = 0;
    let totalQuestions = 0;

    const partsSummary = parts.map((p) => {
      const partCompleted = p.questions.filter(isQuestionCompleted).length;
      completedCount += partCompleted;
      totalQuestions += p.questions.length;

      return {
        partNumber: p.partNumber,
        title: p.title,
        targetCount: p.targetCount || p.questions.length,
        completedCount: partCompleted,
        isCompleted: partCompleted >= (p.targetCount || p.questions.length),
      };
    });

    // Determine current active part and question
    // Prioritize stored cursor (practice.currentPart & practice.currentQuestionIndex)
    let activePartNumber = practice.currentPart || 1;
    let activeQuestionIndex = practice.currentQuestionIndex || 0;

    // Validate bounds
    if (activePartNumber < 1 || activePartNumber > 5) activePartNumber = 1;
    const currentPartObj = parts.find((p) => p.partNumber === activePartNumber) || parts[0];
    const maxIndex = (currentPartObj.questions?.length || 10) - 1;

    if (activeQuestionIndex > maxIndex) {
      if (activePartNumber < 5) {
        activePartNumber += 1;
        activeQuestionIndex = 0;
      } else {
        activeQuestionIndex = maxIndex;
      }
    }

    const isAllCompleted = completedCount >= totalQuestions && totalQuestions > 0;

    // Fetch latest user practiceScore & streak
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { practiceScore: true, streakDays: true, level: true },
    });

    return res.json({
      session: {
        id: practice.id,
        date: practice.date,
        vietnamDate: todayDate,
        level: practice.level,
        score: practice.score, // Today's practice score (starts at 0 each day)
        userPracticeScore: user?.practiceScore || 0, // Lifetime accumulated practice score
        streakDays: user?.streakDays || 0,
        completed: isAllCompleted,
        activePartNumber,
        activeQuestionIndex,
        totalQuestions,
        completedCount,
        remainingCount: Math.max(0, totalQuestions - completedCount),
        partsSummary,
        parts, // Full questions array for practice runner
      },
    });
  } catch (error) {
    console.error('getTodayPractice error:', error);
    return res.status(500).json({ message: 'Lỗi tải phiên luyện tập hôm nay.' });
  }
}

async function submitAnswer(req, res) {
  try {
    const userId = req.user.id;
    const todayDate = getVietnamDateString();
    const { sessionId, partNumber, questionIndex, selectedOption } = req.body;

    if (partNumber === undefined || questionIndex === undefined || !selectedOption) {
      return res.status(400).json({ message: 'Dữ liệu nộp câu trả lời không đầy đủ.' });
    }

    // 1. Fetch practice session by ID or fallback to current Vietnam date
    let practice = null;
    if (sessionId) {
      practice = await prisma.dailyPractice.findFirst({
        where: { id: sessionId, userId },
      });
    }
    if (!practice) {
      practice = await prisma.dailyPractice.findUnique({
        where: { userId_date: { userId, date: todayDate } },
      });
    }

    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy phiên luyện tập.' });
    }

    let parts = JSON.parse(practice.sessionData);
    const part = parts.find((p) => p.partNumber === partNumber);
    const q = part?.questions?.[questionIndex];

    if (!q) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi tương ứng.' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { practiceScore: true, streakDays: true, lastStudyDate: true },
    });
    const currentPracticeScore = currentUser?.practiceScore || 0;

    // Daily practice streak calculation:
    // Every day a user does their daily practice, their streak increments by 1
    let newStreakDays = currentUser?.streakDays || 0;
    const lastStudy = currentUser?.lastStudyDate;

    if (lastStudy) {
      const lastStudyVnDate = getVietnamDateString(new Date(lastStudy));
      if (lastStudyVnDate !== todayDate) {
        const nowD = new Date();
        const yesterdayD = new Date(nowD.getTime() - 86400000);
        const yesterdayVn = getVietnamDateString(yesterdayD);
        if (lastStudyVnDate === yesterdayVn) {
          newStreakDays += 1;
        } else {
          // Missed 2+ days: reset streak to 1
          newStreakDays = 1;
        }
      }
    } else {
      if (newStreakDays === 0) {
        newStreakDays = 1;
      }
    }

    // If question was already answered correctly, do not award points again
    if (q.isCorrect) {
      return res.json({
        isCorrect: true,
        pointsDelta: 0,
        newScore: practice.score,
        userPracticeScore: currentPracticeScore,
        streakDays: newStreakDays,
        explanation: q.explanation,
        alreadyAnswered: true,
      });
    }

    // Compare with correct answer
    const isMatch = selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

    let pointsDelta = 0;
    let newSessionScore = practice.score;
    let newUserScore = currentPracticeScore;

    q.isAnswered = true;
    q.selectedAnswer = selectedOption;

    if (isMatch) {
      q.isCorrect = true;
      pointsDelta = 4;
      newSessionScore += 4;
      newUserScore += 4;
    } else {
      q.isCorrect = false;
      q.wrongAttempts = (q.wrongAttempts || 0) + 1;
      pointsDelta = -2;
      newSessionScore = Math.max(0, newSessionScore - 2);
      newUserScore = Math.max(0, newUserScore - 2);
    }

    // Check if whole day is now complete (all questions answered right or wrong)
    let totalQs = 0;
    let totalCompleted = 0;
    parts.forEach((p) => {
      p.questions.forEach((qu) => {
        totalQs++;
        if (isQuestionCompleted(qu)) totalCompleted++;
      });
    });
    const isCompleted = totalCompleted >= totalQs;

    // Advance stored navigation pointers
    let nextPartNum = partNumber;
    let nextQIndex = questionIndex + 1;
    const partQuestionCount = part.questions?.length || 10;
    if (nextQIndex >= partQuestionCount) {
      if (nextPartNum < 5) {
        nextPartNum += 1;
        nextQIndex = 0;
      } else {
        nextQIndex = partQuestionCount - 1;
      }
    }

    // Persist to DB atomically
    await prisma.$transaction([
      prisma.dailyPractice.update({
        where: { id: practice.id },
        data: {
          score: newSessionScore,
          completed: isCompleted,
          currentPart: nextPartNum,
          currentQuestionIndex: nextQIndex,
          sessionData: JSON.stringify(parts),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          practiceScore: newUserScore,
          streakDays: newStreakDays,
          lastStudyDate: new Date(),
        },
      }),
    ]);

    return res.json({
      isCorrect: isMatch,
      pointsDelta,
      newScore: newSessionScore,
      userPracticeScore: newUserScore,
      streakDays: newStreakDays,
      explanation: q.explanation,
      isDayCompleted: isCompleted,
      nextPartNum,
      nextQIndex,
    });
  } catch (error) {
    console.error('submitAnswer error:', error);
    return res.status(500).json({ message: 'Lỗi chấm điểm câu trả lời.' });
  }
}

async function updatePracticeProgress(req, res) {
  try {
    const userId = req.user.id;
    const todayDate = getVietnamDateString();
    const { currentPart, currentQuestionIndex } = req.body;

    if (currentPart === undefined || currentQuestionIndex === undefined) {
      return res.status(400).json({ message: 'Dữ liệu vị trí không hợp lệ.' });
    }

    const partNum = Math.max(1, Math.min(5, parseInt(currentPart, 10)));
    const qIdx = Math.max(0, parseInt(currentQuestionIndex, 10));

    await prisma.dailyPractice.updateMany({
      where: { userId, date: todayDate },
      data: {
        currentPart: partNum,
        currentQuestionIndex: qIdx,
      },
    });

    return res.json({ success: true, currentPart: partNum, currentQuestionIndex: qIdx });
  } catch (err) {
    console.error('updatePracticeProgress error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật tiến trình.' });
  }
}

module.exports = {
  getTodayPractice,
  submitAnswer,
  updatePracticeProgress,
};
