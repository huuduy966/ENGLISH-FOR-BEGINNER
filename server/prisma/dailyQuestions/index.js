const { generateDailyBankForLevel } = require('./dataGenerator');

/**
 * Generates fresh, level-specific 60-question set for a daily practice session
 * @param {string} level - CEFR level: 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
 * @param {object} [options={}] - { dateStr, recentQuestionIds, seed }
 * @returns {Array} 5 parts containing exactly 60 questions
 */
function getQuestionsForLevel(level = 'A1', options = {}) {
  const normLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level) ? level : 'A1';
  return generateDailyBankForLevel(normLevel, options);
}

module.exports = {
  getQuestionsForLevel,
};
