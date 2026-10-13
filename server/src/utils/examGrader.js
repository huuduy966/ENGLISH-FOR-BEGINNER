// examGrader.js - Comprehensive Evaluation and Grading for 40-Question Proficiency Exam
// 40 questions x 0.25 pts = 10.0 points maximum scale

function normalize(str) {
  if (!str) return '';
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"'’“”\(\)]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Grade Part 1: Vocabulary Fill-in-the-blank
 */
function gradeVocabulary(userAns, question) {
  const normUser = normalize(userAns);
  if (!normUser) return false;
  const accepted = [question.correctAnswer, ...(question.acceptedAnswers || [])].filter(Boolean).map(normalize);
  return accepted.includes(normUser);
}

/**
 * Grade Part 2: Error Identification & Correction
 * Expects formats like "A - doesn't", "A: doesn't", "A, doesn't", "(A) doesn't", "A doesn't"
 */
function gradeErrorCorrection(userAns, question) {
  if (!userAns || !userAns.trim()) return false;
  const raw = userAns.trim();
  const match =
    raw.match(/^\s*\(?([A-Da-d])\)?\s*[-:–—\/>,\s]\s*(.+)$/) ||
    raw.match(/^\s*\(?([A-Da-d])\)?\s+(.+)$/);

  if (!match) return false;

  const userPart = match[1].toUpperCase();
  const userCorr = normalize(match[2]);

  const expectedPart = (question.errorPart || 'A').toUpperCase();
  const accepted = [question.correctCorrection, ...(question.acceptedAnswers || [])].filter(Boolean).map(normalize);

  return userPart === expectedPart && accepted.includes(userCorr);
}

/**
 * Grade Part 3: Listening Comprehension
 */
function gradeListening(userAns, question) {
  const normUser = normalize(userAns);
  if (!normUser) return false;
  const accepted = [question.correctAnswer, ...(question.acceptedAnswers || [])].filter(Boolean).map(normalize);
  return accepted.includes(normUser);
}

/**
 * Grade Part 4: Reading Comprehension
 */
function gradeReading(userAns, question) {
  const normUser = normalize(userAns);
  if (!normUser) return false;
  const accepted = [question.correctAnswer, ...(question.acceptedAnswers || [])].filter(Boolean).map(normalize);
  return accepted.includes(normUser);
}

/**
 * Grade Part 5: Sentence Reordering
 */
function gradeReordering(userAns, question) {
  const normUser = normalize(userAns);
  if (!normUser) return false;
  const accepted = [question.correctAnswer, ...(question.acceptedAnswers || [])].filter(Boolean).map(normalize);
  return accepted.includes(normUser);
}

/**
 * Grade a single question based on its part number
 */
function gradeSingleQuestion(userAns, question) {
  const ans = (userAns || '').trim();
  if (!ans) {
    return { isCorrect: false, isUnanswered: true };
  }

  let isCorrect = false;
  switch (question.partNumber) {
    case 1:
      isCorrect = gradeVocabulary(ans, question);
      break;
    case 2:
      isCorrect = gradeErrorCorrection(ans, question);
      break;
    case 3:
      isCorrect = gradeListening(ans, question);
      break;
    case 4:
      isCorrect = gradeReading(ans, question);
      break;
    case 5:
      isCorrect = gradeReordering(ans, question);
      break;
    default:
      isCorrect = gradeVocabulary(ans, question);
  }

  return { isCorrect, isUnanswered: false };
}

/**
 * Full Exam Evaluation
 * @param {object} answersMap - { [questionId]: "userAnswer" }
 * @param {object} examData - Structure with all 5 parts & 40 questions
 * @returns {object} Full results with scores, question reviews, weak areas
 */
function evaluateExam(answersMap = {}, examData) {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const partScores = {
    part1: { name: 'Điền từ vựng', total: 10, correct: 0, score: 0, maxScore: 2.5 },
    part2: { name: 'Tìm và sửa lỗi sai', total: 10, correct: 0, score: 0, maxScore: 2.5 },
    part3: { name: 'Luyện nghe', total: 5, correct: 0, score: 0, maxScore: 1.25 },
    part4: { name: 'Đọc hiểu', total: 10, correct: 0, score: 0, maxScore: 2.5 },
    part5: { name: 'Sắp xếp lại câu', total: 5, correct: 0, score: 0, maxScore: 1.25 },
  };

  const reviews = [];

  // Flatten all 40 questions from examData
  const allQuestions = [];
  (examData.parts || []).forEach((part) => {
    (part.questions || []).forEach((q) => {
      allQuestions.push({ ...q, partNumber: part.partNumber });
    });
  });

  allQuestions.forEach((q) => {
    const userAns = (answersMap[q.id] || '').trim();
    const { isCorrect, isUnanswered } = gradeSingleQuestion(userAns, q);

    if (isUnanswered) {
      unansweredCount++;
    } else if (isCorrect) {
      correctCount++;
      const key = `part${q.partNumber}`;
      if (partScores[key]) {
        partScores[key].correct++;
      }
    } else {
      wrongCount++;
    }

    reviews.push({
      id: q.id,
      partNumber: q.partNumber,
      orderNumber: q.orderNumber,
      prompt: q.prompt || q.question || '',
      userAnswer: userAns || null,
      correctAnswer: q.correctAnswer || q.correctCorrection || '',
      errorPart: q.errorPart || null,
      acceptedAnswers: q.acceptedAnswers || [],
      explanation: q.explanation || '',
      isCorrect,
      isUnanswered,
    });
  });

  // Calculate scores per part and overall
  Object.keys(partScores).forEach((k) => {
    partScores[k].score = Math.round(partScores[k].correct * 0.25 * 100) / 100;
  });

  const rawScore = correctCount * 0.25;
  const finalScore = Math.round(rawScore * 100) / 100; // Round to 2 decimals, scale of 10.0

  // Determine Grade & Feedback
  let gradeTier = 'Cần cố gắng';
  let badgeColor = 'text-rose-600 bg-rose-50 border-rose-200';
  let recommendation = 'Bạn cần dành thêm thời gian ôn tập lại từ vựng nền tảng và ngữ pháp cơ bản trước khi làm lại bài kiểm tra.';

  if (finalScore >= 8.5) {
    gradeTier = 'Xuất sắc';
    badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    recommendation = 'Năng lực tiếng Anh của bạn vượt trội! Bạn hoàn toàn tự tin để nâng cấp lên các cấp độ cao hơn.';
  } else if (finalScore >= 7.0) {
    gradeTier = 'Giỏi';
    badgeColor = 'text-blue-700 bg-blue-50 border-blue-200';
    recommendation = 'Kết quả rất ấn tượng! Bạn đã nắm vững phần lớn cấu trúc và từ vựng nâng cao.';
  } else if (finalScore >= 5.0) {
    gradeTier = 'Khá';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    recommendation = 'Bạn có nền tảng khá tốt nhưng cần chú ý các lỗi sai ngữ pháp và luyện thêm kỹ năng đọc hiểu sâu.';
  }

  // Identify Weak Areas
  const weakAreas = [];
  if (partScores.part1.correct < 6) weakAreas.push('Mở rộng vốn từ vựng và trau dồi cách dùng từ theo ngữ cảnh (Phần 1)');
  if (partScores.part2.correct < 6) weakAreas.push('Nhận diện và sửa các lỗi sai ngữ pháp, thì động từ và cụm từ cố định (Phần 2)');
  if (partScores.part3.correct < 3) weakAreas.push('Luyện nghe thông tin chi tiết và số liệu trong đoạn hội thoại (Phần 3)');
  if (partScores.part4.correct < 6) weakAreas.push('Kỹ năng đọc hiểu suy luận và xác định thông tin quan trọng (Phần 4)');
  if (partScores.part5.correct < 3) weakAreas.push('Cấu trúc trật tự từ và ngữ pháp câu hoàn chỉnh (Phần 5)');

  return {
    score: finalScore,
    maxScore: 10.0,
    totalQuestions: allQuestions.length,
    correctCount,
    wrongCount,
    unansweredCount,
    gradeTier,
    badgeColor,
    recommendation,
    weakAreas,
    partScores,
    reviews,
  };
}

module.exports = {
  normalize,
  gradeSingleQuestion,
  evaluateExam,
};
