// generator.js - Generates full curriculum for all 6 CEFR levels
const fs = require('fs');
const path = require('path');

// We will write the curriculum generator
const { generateA1 } = require('./generators/genA1');
const { generateA2 } = require('./generators/genA2');
const { generateB1 } = require('./generators/genB1');
const { generateB2 } = require('./generators/genB2');
const { generateC1 } = require('./generators/genC1');
const { generateC2 } = require('./generators/genC2');

const dir = __dirname;

const a1 = generateA1();
const a2 = generateA2();
const b1 = generateB1();
const b2 = generateB2();
const c1 = generateC1();
const c2 = generateC2();

fs.writeFileSync(path.join(dir, 'a1.js'), 'module.exports = ' + JSON.stringify(a1, null, 2) + ';\n');
fs.writeFileSync(path.join(dir, 'a2.js'), 'module.exports = ' + JSON.stringify(a2, null, 2) + ';\n');
fs.writeFileSync(path.join(dir, 'b1.js'), 'module.exports = ' + JSON.stringify(b1, null, 2) + ';\n');
fs.writeFileSync(path.join(dir, 'b2.js'), 'module.exports = ' + JSON.stringify(b2, null, 2) + ';\n');
fs.writeFileSync(path.join(dir, 'c1.js'), 'module.exports = ' + JSON.stringify(c1, null, 2) + ';\n');
fs.writeFileSync(path.join(dir, 'c2.js'), 'module.exports = ' + JSON.stringify(c2, null, 2) + ';\n');

const indexContent = `const a1 = require('./a1');
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
`;

fs.writeFileSync(path.join(dir, 'index.js'), indexContent);
console.log('Successfully generated all 6 CEFR curriculum files!');
console.log('Totals:', {
  A1: a1.length,
  A2: a2.length,
  B1: b1.length,
  B2: b2.length,
  C1: c1.length,
  C2: c2.length,
  total: a1.length + a2.length + b1.length + b2.length + c1.length + c2.length,
});
