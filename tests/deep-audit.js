const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');
const dataJs = fs.readFileSync('js/data.js', 'utf8');

console.log('=== Deep Code Audit ===');

// Check 1: All onclick, onsubmit, onchange, oninput in index.html
const allHandlers = [];
const handlerRegex = /on(click|submit|change|input)="([^"]+)"/g;
let m;
while ((m = handlerRegex.exec(html)) !== null) {
  allHandlers.push({ type: m[1], raw: m[2] });
}

console.log('Total inline event handlers in index.html:', allHandlers.length);

// Check 2: Check all document.querySelector in app.js
const qsaRegex = /querySelector(?:All)?\(['"]([^'"]+)['"]\)/g;
const selectors = [];
while ((m = qsaRegex.exec(appJs)) !== null) {
  selectors.push(m[1]);
}
console.log('Total querySelectors in app.js:', selectors.length);

// Check 3: Check modal IDs in openModal and closeModal calls in HTML and JS
const modalOpenCalls = [...(html + appJs).matchAll(/openModal\(['"]([^'"]+)['"]\)/g)].map(x => x[1]);
const modalCloseCalls = [...(html + appJs).matchAll(/closeModal\(['"]([^'"]+)['"]\)/g)].map(x => x[1]);
const allModalIds = [...new Set([...modalOpenCalls, ...modalCloseCalls])];

allModalIds.forEach(id => {
  const exists = html.includes(`id="${id}"`);
  if (!exists) {
    console.warn('⚠️ Modal ID does not exist in HTML:', id);
  } else {
    // Check if it has modal-backdrop class
    if (!html.includes(`id="${id}" class="modal-backdrop`) && !html.includes(`class="modal-backdrop" id="${id}"`)) {
      console.warn('⚠️ Modal might not have modal-backdrop class:', id);
    }
  }
});
console.log('Modals checked:', allModalIds.length);

// Check 4: Check localStorage keys used
const lsKeys = [...(appJs + dataJs).matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(['"]([^'"]+)['"]\)/g)].map(x => x[1]);
console.log('Unique LocalStorage keys used:', [...new Set(lsKeys)]);

// Check 5: Check all image assets referenced in HTML, data.js, app.js
const assetRegex = /assets\/[a-zA-Z0-9_\-\.\/]+/g;
const assetMatches = [...new Set([...(html + dataJs + appJs).match(assetRegex) || []])];
console.log('Checking referenced assets:');
assetMatches.forEach(asset => {
  const p = asset.split('?')[0].split('#')[0];
  if (!fs.existsSync(p)) {
    console.warn('⚠️ Asset does not exist on disk:', p);
  }
});

console.log('=== Deep Code Audit Complete ===');
