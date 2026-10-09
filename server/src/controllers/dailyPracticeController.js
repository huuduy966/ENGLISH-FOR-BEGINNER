const prisma = require('../db');
const { getQuestionsForLevel } = require('../../prisma/dailyQuestions');

// Helper to get local date string YYYY-MM-DD
function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getTodayPractice(req, res) {
  try {
    const userId = req.user.id;
    const todayDate = getLocalDateString();
    const userLevel = req.user.level || 'A1';

    // 1. Find or create daily practice record
    let practice = await prisma.dailyPractice.findUnique({
      where: { userId_date: { userId, date: todayDate } },
    });

    if (!practice) {
      // Generate 60 questions in 5 parts strictly for the user's level
      const parts = getQuestionsForLevel(userLevel);

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
    }

    // 2. Parse session data and calculate statistics
    let parts = [];
    try {
      parts = JSON.parse(practice.sessionData);
    } catch {
      parts = getQuestionsForLevel(userLevel);
    }

    let completedCount = 0;
    let totalQuestions = 0;

    const partsSummary = parts.map((p) => {
      const partCompleted = p.questions.filter((q) => q.isCorrect).length;
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

    // Determine current active part and question (first uncompleted)
    let activePartNumber = 1;
    let activeQuestionIndex = 0;
    let foundActive = false;

    for (const p of parts) {
      for (let qIdx = 0; qIdx < p.questions.length; qIdx++) {
        if (!p.questions[qIdx].isCorrect) {
          activePartNumber = p.partNumber;
          activeQuestionIndex = qIdx;
          foundActive = true;
          break;
        }
      }
      if (foundActive) break;
    }

    const isAllCompleted = completedCount >= totalQuestions && totalQuestions > 0;

    // Fetch latest user practiceScore
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { practiceScore: true, xp: true, level: true },
    });

    return res.json({
      session: {
        id: practice.id,
        date: practice.date,
        level: practice.level,
        score: practice.score,
        userPracticeScore: user?.practiceScore || 0,
        userXp: user?.xp || 0,
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
    const todayDate = getLocalDateString();
    const { partNumber, questionIndex, selectedOption } = req.body;

    if (partNumber === undefined || questionIndex === undefined || !selectedOption) {
      return res.status(400).json({ message: 'Dữ liệu nộp câu trả lời không đầy đủ.' });
    }

    // 1. Fetch practice session
    const practice = await prisma.dailyPractice.findUnique({
      where: { userId_date: { userId, date: todayDate } },
    });

    if (!practice) {
      return res.status(404).json({ message: 'Không tìm thấy phiên luyện tập hôm nay.' });
    }

    let parts = JSON.parse(practice.sessionData);
    const part = parts.find((p) => p.partNumber === partNumber);
    const q = part?.questions?.[questionIndex];

    if (!q) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi tương ứng.' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { practiceScore: true },
    });
    const currentPracticeScore = currentUser?.practiceScore || 0;

    // If question was already answered correctly, do not award points again
    if (q.isCorrect) {
      return res.json({
        isCorrect: true,
        pointsDelta: 0,
        newScore: practice.score,
        userPracticeScore: currentPracticeScore,
        explanation: q.explanation,
        alreadyAnswered: true,
      });
    }

    // Compare with correct answer
    const isMatch = selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

    let pointsDelta = 0;
    let newSessionScore = practice.score;
    let newUserScore = currentPracticeScore;

    if (isMatch) {
      q.isCorrect = true;
      q.selectedAnswer = selectedOption;
      pointsDelta = 4;
      newSessionScore += 4;
      newUserScore += 4;
    } else {
      q.wrongAttempts = (q.wrongAttempts || 0) + 1;
      q.selectedAnswer = selectedOption;
      pointsDelta = -2;
      newSessionScore = Math.max(0, newSessionScore - 2);
      newUserScore = Math.max(0, newUserScore - 2);
    }

    // Check if whole day is now complete
    let totalQs = 0;
    let totalCompleted = 0;
    parts.forEach((p) => {
      p.questions.forEach((qu) => {
        totalQs++;
        if (qu.isCorrect) totalCompleted++;
      });
    });
    const isCompleted = totalCompleted >= totalQs;

    // Persist to DB atomically
    await prisma.$transaction([
      prisma.dailyPractice.update({
        where: { id: practice.id },
        data: {
          score: newSessionScore,
          completed: isCompleted,
          sessionData: JSON.stringify(parts),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          practiceScore: newUserScore,
        },
      }),
    ]);

    return res.json({
      isCorrect: isMatch,
      pointsDelta,
      newScore: newSessionScore,
      userPracticeScore: newUserScore,
      explanation: q.explanation,
      isDayCompleted: isCompleted,
    });
  } catch (error) {
    console.error('submitAnswer error:', error);
    return res.status(500).json({ message: 'Lỗi chấm điểm câu trả lời.' });
  }
}

module.exports = {
  getTodayPractice,
  submitAnswer,
};
