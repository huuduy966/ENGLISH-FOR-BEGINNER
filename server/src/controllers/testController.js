const prisma = require('../db');
const placementQuestionsList = require('../../prisma/curriculum/placementQuestions');

// Level Metadata and Pedagogical Recommendations
const LEVEL_METADATA = {
  A1: {
    title: 'A1 - Beginner (Người mới bắt đầu)',
    shortName: 'A1',
    color: 'blue',
    recommendation: 'Bạn nên bắt đầu học từ cấp độ A1 để xây dựng nền tảng từ vựng đời sống, đại từ, động từ To Be và cấu trúc câu đơn giản.',
  },
  A2: {
    title: 'A2 - Elementary (Sơ cấp)',
    shortName: 'A2',
    color: 'cyan',
    recommendation: 'Bạn đã nắm vững nền tảng A1! Lộ trình A2 sẽ giúp bạn mở rộng ngữ pháp thì quá khứ, tương lai, so sánh và giao tiếp thường ngày tự tin hơn.',
  },
  B1: {
    title: 'B1 - Intermediate (Trung cấp)',
    shortName: 'B1',
    color: 'emerald',
    recommendation: 'Trình độ tiếng Anh của bạn rất khá! Lộ trình B1 sẽ rèn luyện câu phức, thì hoàn thành, cụm động từ và kỹ năng nghe hiểu thông tin chi tiết.',
  },
  B2: {
    title: 'B2 - Upper Intermediate (Trung cao cấp)',
    shortName: 'B2',
    color: 'amber',
    recommendation: 'Năng lực tiếng Anh của bạn vững vàng! Bạn hoàn toàn sẵn sàng học các chủ đề chuyên sâu, thành ngữ và lập luận ngữ pháp ở trình độ B2.',
  },
  C1: {
    title: 'C1 - Advanced (Cao cấp)',
    shortName: 'C1',
    color: 'purple',
    recommendation: 'Năng lực xuất sắc! Cấp độ C1 sẽ tinh chỉnh sắc thái nghĩa nâng cao, ngữ pháp đảo ngữ phức tạp và kỹ năng ngôn ngữ chuyên nghiệp.',
  },
  C2: {
    title: 'C2 - Proficiency (Thành thạo)',
    shortName: 'C2',
    color: 'rose',
    recommendation: 'Năng lực tương đương người bản xứ! Bạn có khả năng cảm thụ ngôn ngữ tinh tế và nắm vững mọi sắc thái văn cảnh phức tạp nhất.',
  },
};

/**
 * GET /api/placement-test
 * Generates and returns a randomized 25-question placement test adhering strictly to CEFR quotas:
 * Part 1 (15 questions: A1: 3, A2: 3, B1: 3, B2: 2, C1: 2, C2: 2)
 * Part 2 (10 questions: A1: 1, A2: 1, B1: 2, B2: 2, C1: 2, C2: 2)
 * Client receives questions with answers sanitized (no cheat leakage).
 */
async function getPlacementTest(req, res) {
  try {
    const rawQuestions = typeof placementQuestionsList.generateRandomizedPlacementTest === 'function'
      ? placementQuestionsList.generateRandomizedPlacementTest()
      : placementQuestionsList;

    const sanitizedQuestions = rawQuestions.map((q, idx) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      } catch {
        parsedOptions = [];
      }

      return {
        id: q.id || `pq_${q.orderNumber || idx + 1}`,
        orderNumber: q.orderNumber || idx + 1,
        partNumber: q.partNumber || ((q.orderNumber || idx + 1) <= 15 ? 1 : 2),
        category: q.category || ((q.orderNumber || idx + 1) <= 15 ? 'FillBlank' : 'Listening'),
        question: q.question,
        options: parsedOptions,
        audioText: q.audioText || null,
      };
    });

    return res.json({
      totalQuestions: sanitizedQuestions.length,
      partsOverview: {
        part1: { name: 'Điền từ vào chỗ trống', count: 15, range: 'Câu 1 – 15' },
        part2: { name: 'Luyện nghe ngắn', count: 10, range: 'Câu 16 – 25' },
      },
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error('getPlacementTest error:', error);
    return res.status(500).json({ message: 'Không thể lấy đề kiểm tra đầu vào.' });
  }
}

/**
 * POST /api/placement-test/submit
 * Evaluates the 25 placement questions, calculates tier pass rates, and applies strict sequential tier progression
 */
async function submitPlacementTest(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { answers } = req.body; // Map: { [questionId or orderNumber]: "selectedOption" }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Dữ liệu nộp bài test không hợp lệ.' });
    }

    let correctCount = 0;
    let fillBlankCorrect = 0;
    let listeningCorrect = 0;

    const tierStats = {
      A1: { total: 0, correct: 0 },
      A2: { total: 0, correct: 0 },
      B1: { total: 0, correct: 0 },
      B2: { total: 0, correct: 0 },
      C1: { total: 0, correct: 0 },
      C2: { total: 0, correct: 0 },
    };

    const details = [];

    // 1. Resolve submitted questions from the master question pool
    const resolvedItems = [];
    const seenIds = new Set();
    const answerKeys = Object.keys(answers);

    answerKeys.forEach((key) => {
      const q = typeof placementQuestionsList.getQuestionById === 'function'
        ? placementQuestionsList.getQuestionById(key)
        : null;
      if (q && !seenIds.has(q.id)) {
        seenIds.add(q.id);
        resolvedItems.push({
          question: q,
          userAns: answers[key],
        });
      }
    });

    // 2. Fallback / legacy support: complete set up to 25 from canonical list if needed
    if (resolvedItems.length < 25) {
      placementQuestionsList.forEach((q) => {
        const qId = `pq_${q.orderNumber}`;
        const key = answers[q.id] !== undefined
          ? q.id
          : (answers[qId] !== undefined ? qId : (answers[q.orderNumber] !== undefined ? q.orderNumber : String(q.orderNumber)));

        if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          resolvedItems.push({
            question: q,
            userAns: answers[key] !== undefined ? answers[key] : null,
          });
        }
      });
    }

    resolvedItems.slice(0, 25).forEach((item, idx) => {
      const q = item.question;
      const userAns = item.userAns;
      const isCorrect = userAns !== null && typeof userAns === 'string' &&
        userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        correctCount++;
        if (q.partNumber === 2 || q.category === 'Listening') {
          listeningCorrect++;
        } else {
          fillBlankCorrect++;
        }
      }

      const lvl = q.levelTarget || 'A1';
      if (tierStats[lvl]) {
        tierStats[lvl].total++;
        if (isCorrect) tierStats[lvl].correct++;
      }

      details.push({
        id: q.id || `pq_${idx + 1}`,
        orderNumber: idx + 1,
        partNumber: q.partNumber || (idx + 1 <= 15 ? 1 : 2),
        levelTarget: q.levelTarget,
        question: q.question,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        isCorrect,
      });
    });

    const totalQuestions = resolvedItems.length || 25;
    const totalScore = correctCount * 4; // 25 questions x 4 pts = 100 maximum
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Compute tier breakdown & 75% pass threshold per tier
    const tierBreakdown = {};
    const tiersList = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    tiersList.forEach((lvl) => {
      const stat = tierStats[lvl];
      const tierPercent = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      const passed = tierPercent >= 75;
      tierBreakdown[lvl] = {
        correct: stat.correct,
        total: stat.total,
        percentage: tierPercent,
        passed,
      };
    });

    // --- SEQUENTIAL PROGRESSION DETERMINATION ---
    // Start evaluating from A1. Tier N is only reached if all prior tiers achieved >= 75%
    let recommendedLevel = 'A1';

    if (tierBreakdown.A1.passed) {
      if (tierBreakdown.A2.passed) {
        if (tierBreakdown.B1.passed) {
          if (tierBreakdown.B2.passed) {
            if (tierBreakdown.C1.passed) {
              if (tierBreakdown.C2.passed) {
                recommendedLevel = 'C2';
              } else {
                recommendedLevel = 'C1';
              }
            } else {
              recommendedLevel = 'B2';
            }
          } else {
            recommendedLevel = 'B1';
          }
        } else {
          recommendedLevel = 'A2';
        }
      } else {
        recommendedLevel = 'A1';
      }
    } else {
      recommendedLevel = 'A1';
    }

    const meta = LEVEL_METADATA[recommendedLevel] || LEVEL_METADATA.A1;

    // Detailed feedback analysis
    let strengths = [];
    let weaknesses = [];

    if (fillBlankCorrect >= 12) {
      strengths.push('Nền tảng từ vựng và ngữ pháp điền từ tốt');
    } else if (fillBlankCorrect < 8) {
      weaknesses.push('Cần bổ sung vốn từ vựng và cấu trúc ngữ pháp');
    }

    if (listeningCorrect >= 8) {
      strengths.push('Khả năng nghe bắt thông tin tiếng Anh nhạy bén');
    } else if (listeningCorrect < 5) {
      weaknesses.push('Cần luyện nghe các ngữ cảnh hội thoại thực tế thường xuyên hơn');
    }

    if (strengths.length === 0) strengths.push('Có tinh thần học tập và cầu tiến tốt');
    if (weaknesses.length === 0) weaknesses.push('Tiếp tục duy trì thói quen luyện tập để đạt độ hoàn hảo');

    const resultPayload = {
      score: totalScore,
      correctCount,
      totalQuestions,
      percentage,
      recommendedLevel,
      assignedLevel: recommendedLevel,
      levelTitle: meta.title,
      recommendation: meta.recommendation,
      partScores: {
        fillBlank: {
          correct: fillBlankCorrect,
          total: 15,
          score: fillBlankCorrect * 4,
          maxScore: 60,
          percentage: Math.round((fillBlankCorrect / 15) * 100),
        },
        listening: {
          correct: listeningCorrect,
          total: 10,
          score: listeningCorrect * 4,
          maxScore: 40,
          percentage: Math.round((listeningCorrect / 10) * 100),
        },
      },
      tierBreakdown,
      strengths,
      weaknesses,
      details,
    };

    // Update user profile in database if logged in
    if (userId) {
      await prisma.$executeRawUnsafe(
        `UPDATE User
         SET level = ?, placementStatus = 'ASSESSED', placementScore = ?, placementDetails = ?, updatedAt = datetime('now')
         WHERE id = ?`,
        recommendedLevel,
        totalScore,
        JSON.stringify(resultPayload),
        userId
      );
    }

    return res.json(resultPayload);
  } catch (error) {
    console.error('submitPlacementTest error:', error);
    return res.status(500).json({ message: 'Lỗi khi chấm điểm bài kiểm tra đầu vào.' });
  }
}

/**
 * POST /api/placement-test/skip
 * Handles "Phương án 2 – Học từ đầu":
 * Skips the test, sets level to A1 with status "UNASSESSED", and guides user to A1 curriculum
 */
async function skipPlacementTest(req, res) {
  try {
    const userId = req.user ? req.user.id : null;

    if (userId) {
      await prisma.$executeRawUnsafe(
        `UPDATE User
         SET level = 'A1', placementStatus = 'UNASSESSED', updatedAt = datetime('now')
         WHERE id = ?`,
        userId
      );
    }

    return res.json({
      success: true,
      level: 'A1',
      placementStatus: 'UNASSESSED',
      message: 'Đã thiết lập lộ trình học từ đầu cấp độ A1.',
    });
  } catch (error) {
    console.error('skipPlacementTest error:', error);
    return res.status(500).json({ message: 'Lỗi khi bỏ qua bài kiểm tra.' });
  }
}

/**
 * POST /api/quiz/:lessonId/submit
 * Lesson Quiz submission
 */
async function submitLessonQuiz(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const userId = req.user.id;
    const { answers } = req.body;

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

    return res.json({
      score: correctCount,
      total,
      percentage,
      passed,
      review,
    });
  } catch (error) {
    console.error('submitLessonQuiz error:', error);
    return res.status(500).json({ message: 'Lỗi nộp bài quiz.' });
  }
}

module.exports = {
  getPlacementTest,
  submitPlacementTest,
  skipPlacementTest,
  submitLessonQuiz,
};
