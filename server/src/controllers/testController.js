const prisma = require('../db');

// --- PLACEMENT TEST ---
async function getPlacementTest(req, res) {
  try {
    const questions = await prisma.placementQuestion.findMany({
      orderBy: { orderNumber: 'asc' },
      select: {
        id: true,
        orderNumber: true,
        levelTarget: true,
        category: true,
        question: true,
        options: true,
      },
    });

    const formatted = questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    }));

    return res.json({ questions: formatted });
  } catch (error) {
    console.error('getPlacementTest error:', error);
    return res.status(500).json({ message: 'Không thể lấy đề kiểm tra đầu vào.' });
  }
}

async function submitPlacementTest(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { answers } = req.body; // Map: { [questionId]: "selectedOption" }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Dữ liệu bài nộp không hợp lệ.' });
    }

    const allQuestions = await prisma.placementQuestion.findMany({
      orderBy: { orderNumber: 'asc' },
    });

    let correctCount = 0;
    const details = [];

    allQuestions.forEach((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      details.push({
        id: q.id,
        question: q.question,
        userAnswer: userAnswer || null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        levelTarget: q.levelTarget,
      });
    });

    // Percentage-based Level determination logic:
    const totalQuestions = allQuestions.length || 1;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    let assignedLevel = 'A1';
    let levelTitle = 'A1 - Beginner (Người mới bắt đầu)';
    let recommendation = 'Bạn nên bắt đầu với các bài học cơ bản: Chào hỏi, Đại từ & Động từ To Be, Từ vựng đời sống thường ngày.';

    if (percentage >= 80) {
      assignedLevel = 'B1';
      levelTitle = 'B1 - Intermediate (Trung cấp)';
      recommendation = 'Nền tảng của bạn khá tốt! Bạn có thể bắt đầu với các chủ đề mở rộng và luyện phản xạ hội thoại nâng cao.';
    } else if (percentage >= 50) {
      assignedLevel = 'A2';
      levelTitle = 'A2 - Elementary (Sơ cấp)';
      recommendation = 'Bạn đã có ngữ pháp nền tảng. Hãy tập trung nâng cao phản xạ nghe và mở rộng vốn từ vựng thực tế.';
    }

    // Update user level and give bonus XP if logged in
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          level: assignedLevel,
          xp: { increment: 50 },
        },
      });
    }

    return res.json({
      score: correctCount,
      total: allQuestions.length,
      percentage: Math.round((correctCount / allQuestions.length) * 100),
      assignedLevel,
      levelTitle,
      recommendation,
      details,
    });
  } catch (error) {
    console.error('submitPlacementTest error:', error);
    return res.status(500).json({ message: 'Lỗi khi chấm điểm bài kiểm tra.' });
  }
}

// --- LESSON QUIZ SUBMISSION ---
async function submitLessonQuiz(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const { answers } = req.body; // { [quizId]: "selectedOption" }

    if (isNaN(lessonId) || !answers) {
      return res.status(400).json({ message: 'Dữ liệu nộp quiz không hợp lệ.' });
    }

    const quizQuestions = await prisma.quizQuestion.findMany({
      where: { lessonId },
    });

    if (quizQuestions.length === 0) {
      return res.status(404).json({ message: 'Bài học này chưa có câu hỏi quiz.' });
    }

    let correctCount = 0;
    const review = [];

    quizQuestions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;

      review.push({
        id: q.id,
        question: q.question,
        selectedAnswer: selected || null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
      });
    });

    const total = quizQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= 80;

    // Save attempt
    await prisma.quizAttempt.create({
      data: {
        userId,
        lessonId,
        score: correctCount,
        total,
        passed,
      },
    });

    // Award XP and complete lesson if passed
    let xpGained = 0;
    if (passed) {
      xpGained = 30;

      // Update progress
      await prisma.userProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {
          progress: 100,
          completed: true,
          score: percentage,
          completedAt: new Date(),
        },
        create: {
          userId,
          lessonId,
          progress: 100,
          completed: true,
          score: percentage,
          completedAt: new Date(),
        },
      });

      // Update User XP
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpGained },
        },
      });
    }

    return res.json({
      score: correctCount,
      total,
      percentage,
      passed,
      xpGained,
      review,
      message: passed
        ? `🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc bài kiểm tra với ${percentage}% điểm!`
        : `Bạn đạt ${percentage}%. Cần đạt tối thiểu 80% để vượt qua. Hãy xem lại các lỗi và thử lại nhé!`,
    });
  } catch (error) {
    console.error('submitLessonQuiz error:', error);
    return res.status(500).json({ message: 'Lỗi xử lý nộp bài quiz.' });
  }
}

module.exports = {
  getPlacementTest,
  submitPlacementTest,
  submitLessonQuiz,
};
