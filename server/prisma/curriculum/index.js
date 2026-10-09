const a1 = require('./a1');
const a2 = require('./a2');
const b1 = require('./b1');
const b2 = require('./b2');
const c1 = require('./c1');
const c2 = require('./c2');

const allLessons = [...a1, ...a2, ...b1, ...b2, ...c1, ...c2];

module.exports = {
  A1: a1,
  A2: a2,
  B1: b1,
  B2: b2,
  C1: c1,
  C2: c2,
  allLessons,
};
