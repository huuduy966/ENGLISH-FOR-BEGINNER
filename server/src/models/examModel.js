// examModel.js - SQLite Data Access for ExamAttempt
const prisma = require('../db');

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ExamAttempt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      level TEXT NOT NULL,
      examTitle TEXT NOT NULL,
      totalQuestions INTEGER DEFAULT 40,
      durationMinutes INTEGER DEFAULT 60,
      startedAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      submittedAt TEXT,
      isCompleted INTEGER DEFAULT 0,
      score REAL DEFAULT 0,
      correctCount INTEGER DEFAULT 0,
      wrongCount INTEGER DEFAULT 0,
      unansweredCount INTEGER DEFAULT 0,
      currentPage INTEGER DEFAULT 1,
      answers TEXT DEFAULT '{}',
      examData TEXT NOT NULL,
      resultData TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Run table initialization
ensureTable().catch((err) => console.warn('ExamAttempt init error:', err.message));

async function createAttempt({ userId, level, examTitle, examData, durationMinutes = 60 }) {
  await ensureTable();
  const now = new Date();
  const startedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT INTO ExamAttempt (userId, level, examTitle, totalQuestions, durationMinutes, startedAt, expiresAt, isCompleted, score, currentPage, answers, examData, createdAt, updatedAt)
     VALUES (?, ?, ?, 40, ?, ?, ?, 0, 0, 1, '{}', ?, ?, ?)`,
    userId,
    level,
    examTitle,
    durationMinutes,
    startedAt,
    expiresAt,
    JSON.stringify(examData),
    startedAt,
    startedAt
  );

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ExamAttempt WHERE userId = ? ORDER BY id DESC LIMIT 1`,
    userId
  );
  return rows[0] || null;
}

async function getActiveAttempt(userId) {
  await ensureTable();
  const nowIso = new Date().toISOString();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ExamAttempt WHERE userId = ? AND isCompleted = 0 ORDER BY id DESC LIMIT 1`,
    userId
  );
  if (!rows || rows.length === 0) return null;
  const attempt = rows[0];

  // If expired, automatically mark as expired in DB
  if (attempt.expiresAt && attempt.expiresAt <= nowIso) {
    return { ...attempt, isExpired: true };
  }

  return attempt;
}

async function getAttemptById(id, userId) {
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ExamAttempt WHERE id = ? AND userId = ? LIMIT 1`,
    id,
    userId
  );
  return rows[0] || null;
}

async function updateProgress(id, userId, { answers, currentPage }) {
  await ensureTable();
  const nowIso = new Date().toISOString();
  await prisma.$executeRawUnsafe(
    `UPDATE ExamAttempt
     SET answers = ?, currentPage = ?, updatedAt = ?
     WHERE id = ? AND userId = ? AND isCompleted = 0`,
    typeof answers === 'string' ? answers : JSON.stringify(answers || {}),
    currentPage || 1,
    nowIso,
    id,
    userId
  );
}

async function completeAttempt(id, userId, { answers, score, correctCount, wrongCount, unansweredCount, resultData }) {
  await ensureTable();
  const nowIso = new Date().toISOString();
  await prisma.$executeRawUnsafe(
    `UPDATE ExamAttempt
     SET isCompleted = 1,
         submittedAt = ?,
         answers = ?,
         score = ?,
         correctCount = ?,
         wrongCount = ?,
         unansweredCount = ?,
         resultData = ?,
         updatedAt = ?
     WHERE id = ? AND userId = ?`,
    nowIso,
    typeof answers === 'string' ? answers : JSON.stringify(answers || {}),
    score,
    correctCount,
    wrongCount,
    unansweredCount,
    typeof resultData === 'string' ? resultData : JSON.stringify(resultData || {}),
    nowIso,
    id,
    userId
  );

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ExamAttempt WHERE id = ? AND userId = ? LIMIT 1`,
    id,
    userId
  );
  return rows[0] || null;
}

async function getUserAttempts(userId) {
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, level, examTitle, score, correctCount, totalQuestions, startedAt, submittedAt, isCompleted, createdAt
     FROM ExamAttempt
     WHERE userId = ?
     ORDER BY id DESC LIMIT 20`,
    userId
  );
  return rows || [];
}

module.exports = {
  createAttempt,
  getActiveAttempt,
  getAttemptById,
  updateProgress,
  completeAttempt,
  getUserAttempts,
};
