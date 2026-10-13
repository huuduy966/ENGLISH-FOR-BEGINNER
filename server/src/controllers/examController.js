// examController.js - Proficiency Exam Controller (60 mins, 40 subjective questions, 10.0 scale)
const prisma = require('../db');
const examModel = require('../models/examModel');
const { getExamSetForLevel, generateRandomExamSet } = require('../data/examCurriculum');
const { evaluateExam } = require('../utils/examGrader');

/**
 * GET /api/exam/intro
 * Returns exam introduction, user level, format overview, and active attempt status
 */
async function getExamIntro(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, level: true, practiceScore: true },
    });

    const userLevel = user?.level || 'A1';
    const examTemplate = getExamSetForLevel(userLevel);

    // Check for active attempt
    const activeAttempt = await examModel.getActiveAttempt(userId);
    let activeSummary = null;

    if (activeAttempt) {
      const now = new Date();
      const expiresAt = new Date(activeAttempt.expiresAt);
      const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

      if (remainingSeconds > 0) {
        activeSummary = {
          attemptId: activeAttempt.id,
          currentPage: activeAttempt.currentPage || 1,
          remainingSeconds,
          startedAt: activeAttempt.startedAt,
          expiresAt: activeAttempt.expiresAt,
        };
      }
    }

    // Past completed attempts count
    const history = await examModel.getUserAttempts(userId);

    return res.json({
      level: userLevel,
      examTitle: examTemplate.title,
      description: examTemplate.description,
      totalQuestions: 40,
      durationMinutes: 60,
      maxScore: 10.0,
      partsOverview: [
        { partNumber: 1, name: 'Điền từ vựng', questionsCount: 10, format: 'Tự luận điền từ/cụm từ', maxScore: 2.5 },
        { partNumber: 2, name: 'Tìm và sửa lỗi sai', questionsCount: 10, format: 'Tự luận xác định lỗi (A/B/C/D) & sửa lại', maxScore: 2.5 },
        { partNumber: 3, name: 'Luyện nghe', questionsCount: 5, format: '1 bài nghe hoàn chỉnh, 5 câu hỏi tự luận chi tiết', maxScore: 1.25 },
        { partNumber: 4, name: 'Đọc hiểu', questionsCount: 10, format: '2 bài đọc riêng biệt (5 câu/bài), tự luận', maxScore: 2.5 },
        { partNumber: 5, name: 'Sắp xếp lại câu', questionsCount: 5, format: '5 câu xáo trộn, tự nhập câu hoàn chỉnh', maxScore: 1.25 },
      ],
      activeAttempt: activeSummary,
      historyCount: history.length,
    });
  } catch (error) {
    console.error('getExamIntro error:', error);
    return res.status(500).json({ message: 'Lỗi tải thông tin bài kiểm tra.' });
  }
}

/**
 * POST /api/exam/start
 * Starts a new exam session or resumes ongoing session
 */
async function startExam(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });
    const userLevel = user?.level || 'A1';

    // 1. Check if user already has an active, unexpired session
    const existing = await examModel.getActiveAttempt(userId);
    if (existing && !existing.isExpired) {
      const now = new Date();
      const expiresAt = new Date(existing.expiresAt);
      const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

      let examData = {};
      try {
        examData = JSON.parse(existing.examData);
      } catch {}

      let answers = {};
      try {
        answers = JSON.parse(existing.answers || '{}');
      } catch {}

      // Strip answers and explanations from questions before sending to client
      const sanitizedParts = (examData.parts || []).map((part) => ({
        ...part,
        questions: (part.questions || []).map((q) => {
          const { correctAnswer, correctCorrection, acceptedAnswers, explanation, ...safeQ } = q;
          return safeQ;
        }),
      }));

      return res.json({
        attemptId: existing.id,
        level: existing.level,
        examTitle: existing.examTitle,
        startedAt: existing.startedAt,
        expiresAt: existing.expiresAt,
        remainingSeconds,
        currentPage: existing.currentPage || 1,
        answers,
        parts: sanitizedParts,
        isResumed: true,
      });
    }

    // 2. Query recent attempts to find recently used questions, tracks, and passages
    const pastAttempts = await examModel.getUserAttempts(userId);
    const recentQuestionIds = new Set();
    const recentTrackIds = new Set();
    const recentPassageIds = new Set();

    // Collect from the last 3 attempts
    const recentCompleted = pastAttempts.slice(0, 3);
    for (const a of recentCompleted) {
      try {
        const fullAttempt = await examModel.getAttemptById(a.id, userId);
        if (fullAttempt?.examData) {
          const eData = JSON.parse(fullAttempt.examData);
          (eData.parts || []).forEach((part) => {
            if (part.trackId) recentTrackIds.add(part.trackId);
            if (part.passageId) recentPassageIds.add(part.passageId);
            (part.questions || []).forEach((q) => {
              if (q.id) recentQuestionIds.add(q.id);
            });
          });
        }
      } catch (err) {
        console.warn('Could not parse past attempt examData:', err.message);
      }
    }

    // 3. Generate a fresh, cohesive, randomized exam set avoiding recently seen questions
    const examSet = generateRandomExamSet({
      level: userLevel,
      recentQuestionIds,
      recentTrackIds,
      recentPassageIds,
    });

    const newAttempt = await examModel.createAttempt({
      userId,
      level: userLevel,
      examTitle: examSet.title,
      examData: examSet,
      durationMinutes: 60,
    });

    const now = new Date();
    const expiresAt = new Date(newAttempt.expiresAt);
    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    // Strip answers from questions
    const sanitizedParts = (examSet.parts || []).map((part) => ({
      ...part,
      questions: (part.questions || []).map((q) => {
        const { correctAnswer, correctCorrection, acceptedAnswers, explanation, ...safeQ } = q;
        return safeQ;
      }),
    }));

    return res.json({
      attemptId: newAttempt.id,
      level: newAttempt.level,
      examTitle: newAttempt.examTitle,
      startedAt: newAttempt.startedAt,
      expiresAt: newAttempt.expiresAt,
      remainingSeconds,
      currentPage: 1,
      answers: {},
      parts: sanitizedParts,
      isResumed: false,
    });
  } catch (error) {
    console.error('startExam error:', error);
    return res.status(500).json({ message: 'Lỗi bắt đầu bài thi.' });
  }
}

/**
 * GET /api/exam/current
 * Returns active attempt status and remaining time
 */
async function getCurrentExam(req, res) {
  try {
    const userId = req.user.id;
    const attempt = await examModel.getActiveAttempt(userId);

    if (!attempt) {
      return res.status(404).json({ message: 'Không có bài thi nào đang diễn ra.' });
    }

    const now = new Date();
    const expiresAt = new Date(attempt.expiresAt);
    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    let examData = {};
    try {
      examData = JSON.parse(attempt.examData);
    } catch {}

    let answers = {};
    try {
      answers = JSON.parse(attempt.answers || '{}');
    } catch {}

    // If time has expired, auto-finalize the exam
    if (remainingSeconds <= 0) {
      const evaluation = evaluateExam(answers, examData);
      await examModel.completeAttempt(attempt.id, userId, {
        answers,
        score: evaluation.score,
        correctCount: evaluation.correctCount,
        wrongCount: evaluation.wrongCount,
        unansweredCount: evaluation.unansweredCount,
        resultData: evaluation,
      });

      return res.json({
        isExpired: true,
        attemptId: attempt.id,
        isCompleted: true,
        evaluation,
      });
    }

    // Strip answers from questions
    const sanitizedParts = (examData.parts || []).map((part) => ({
      ...part,
      questions: (part.questions || []).map((q) => {
        const { correctAnswer, correctCorrection, acceptedAnswers, explanation, ...safeQ } = q;
        return safeQ;
      }),
    }));

    return res.json({
      attemptId: attempt.id,
      level: attempt.level,
      examTitle: attempt.examTitle,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      remainingSeconds,
      currentPage: attempt.currentPage || 1,
      answers,
      parts: sanitizedParts,
    });
  } catch (error) {
    console.error('getCurrentExam error:', error);
    return res.status(500).json({ message: 'Lỗi lấy thông tin bài thi hiện tại.' });
  }
}

/**
 * POST /api/exam/save-progress
 * Auto-saves student answers and current page
 */
async function saveProgress(req, res) {
  try {
    const userId = req.user.id;
    const { attemptId, answers, currentPage } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: 'Thiếu mã bài thi (attemptId).' });
    }

    const attempt = await examModel.getAttemptById(attemptId, userId);
    if (!attempt) {
      return res.status(404).json({ message: 'Không tìm thấy bài thi.' });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({ message: 'Bài thi này đã nộp, không thể chỉnh sửa.' });
    }

    const now = new Date();
    const expiresAt = new Date(attempt.expiresAt);
    if (expiresAt.getTime() <= now.getTime()) {
      return res.status(400).json({ message: 'Thời gian làm bài đã kết thúc.' });
    }

    await examModel.updateProgress(attemptId, userId, {
      answers: answers || {},
      currentPage: currentPage || 1,
    });

    return res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('saveProgress error:', error);
    return res.status(500).json({ message: 'Lỗi lưu bài làm.' });
  }
}

/**
 * POST /api/exam/submit
 * Submits the exam, scores on 10.0 scale, awards XP, and stores result
 */
async function submitExam(req, res) {
  try {
    const userId = req.user.id;
    const { attemptId, answers } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: 'Thiếu mã bài thi (attemptId).' });
    }

    const attempt = await examModel.getAttemptById(attemptId, userId);
    if (!attempt) {
      return res.status(404).json({ message: 'Không tìm thấy bài thi.' });
    }

    if (attempt.isCompleted) {
      let pastResult = null;
      try {
        pastResult = JSON.parse(attempt.resultData);
      } catch {}
      return res.json({
        alreadySubmitted: true,
        attemptId: attempt.id,
        score: attempt.score,
        evaluation: pastResult,
      });
    }

    let examData = {};
    try {
      examData = JSON.parse(attempt.examData);
    } catch {}

    const submittedAnswers = answers || JSON.parse(attempt.answers || '{}');
    const evaluation = evaluateExam(submittedAnswers, examData);

    // Finalize attempt in database
    await examModel.completeAttempt(attempt.id, userId, {
      answers: submittedAnswers,
      score: evaluation.score,
      correctCount: evaluation.correctCount,
      wrongCount: evaluation.wrongCount,
      unansweredCount: evaluation.unansweredCount,
      resultData: evaluation,
    });

    return res.json({
      success: true,
      attemptId: attempt.id,
      score: evaluation.score,
      evaluation,
    });
  } catch (error) {
    console.error('submitExam error:', error);
    return res.status(500).json({ message: 'Lỗi nộp bài thi.' });
  }
}

/**
 * GET /api/exam/result/:id
 * Retrieves results and review for a completed exam attempt
 */
async function getExamResult(req, res) {
  try {
    const userId = req.user.id;
    const attemptId = parseInt(req.params.id, 10);

    const attempt = await examModel.getAttemptById(attemptId, userId);
    if (!attempt) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả bài thi.' });
    }

    let evaluation = null;
    try {
      evaluation = JSON.parse(attempt.resultData);
    } catch {}

    return res.json({
      attemptId: attempt.id,
      level: attempt.level,
      examTitle: attempt.examTitle,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      score: attempt.score,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      unansweredCount: attempt.unansweredCount,
      evaluation,
    });
  } catch (error) {
    console.error('getExamResult error:', error);
    return res.status(500).json({ message: 'Lỗi tải kết quả bài thi.' });
  }
}

/**
 * GET /api/exam/history
 * Returns user's completed exam history
 */
async function getExamHistory(req, res) {
  try {
    const userId = req.user.id;
    const history = await examModel.getUserAttempts(userId);
    return res.json({ history });
  } catch (error) {
    console.error('getExamHistory error:', error);
    return res.status(500).json({ message: 'Lỗi tải lịch sử thi.' });
  }
}

module.exports = {
  getExamIntro,
  startExam,
  getCurrentExam,
  saveProgress,
  submitExam,
  getExamResult,
  getExamHistory,
};
