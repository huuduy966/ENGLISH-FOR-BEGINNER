const { generateDailyBankForLevel } = require('./dataGenerator');

const cache = new Map();

function getQuestionsForLevel(level = 'A1') {
  const normLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level) ? level : 'A1';

  if (!cache.has(normLevel)) {
    const parts = generateDailyBankForLevel(normLevel);
    cache.set(normLevel, parts);
  }

  // Return a cloned copy so sessions can mutate independently
  return JSON.parse(JSON.stringify(cache.get(normLevel)));
}

module.exports = {
  getQuestionsForLevel,
};
