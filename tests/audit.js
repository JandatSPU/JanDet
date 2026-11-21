const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');
const dataJs = fs.readFileSync('js/data.js', 'utf8');
const fbJs = fs.readFileSync('js/firebase-service.js', 'utf8');

const allJs = appJs + '\n' + dataJs + '\n' + fbJs;

// 1. Check getElementById in JS vs index.html
const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
const idMatches = [];
let m;
while ((m = idRegex.exec(allJs)) !== null) {
  idMatches.push(m[1]);
}
const uniqueIds = [...new Set(idMatches)];
const missingIds = uniqueIds.filter(id => {
  // Check if dynamically created or present in index.html
  const presentInHtml = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
  return !presentInHtml;
});
console.log('=== IDs in JS not directly in index.html ===');
console.log(missingIds);

// 2. Check inline event handlers in index.html vs JS declarations
const handlerRegex = /on(click|submit|change|input)="([^"]+)"/g;
const missingHandlers = [];
while ((m = handlerRegex.exec(html)) !== null) {
  const code = m[2].trim();
  const fnMatch = code.match(/^([a-zA-Z0-9_$]+)\s*\(/);
  if (fnMatch) {
    const fn = fnMatch[1];
    const exists = allJs.includes('function ' + fn) ||
                   allJs.includes('window.' + fn) ||
                   allJs.includes(fn + ' = function') ||
                   allJs.includes(fn + ' = (') ||
                   allJs.includes('async function ' + fn);
    if (!exists) {
      missingHandlers.push({ event: m[1], fn, code });
    }
  }
}
console.log('=== Handlers in HTML not found in JS ===');
console.log(missingHandlers);
