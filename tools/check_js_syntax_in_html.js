const fs = require('fs');
const path = require('path');
const vm = require('vm');

function extractScripts(html) {
  const scripts = [];
  const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match; let lastIndex = 0; let baseLine = 1;
  while ((match = regex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    baseLine += (before.match(/\n/g) || []).length;
    scripts.push({ code: match[1], baseLine });
    baseLine += (match[1].match(/\n/g) || []).length;
    lastIndex = match.index + match[0].length;
  }
  return scripts;
}

function main() {
  const htmlPath = process.argv[2] || path.resolve(__dirname, '..', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const scripts = extractScripts(html);
  let ok = true;
  scripts.forEach((s, i) => {
    try {
      new vm.Script(s.code, { filename: `inline-script-${i}.js` });
    } catch (e) {
      ok = false;
      const line = (e && e.lineNumber) ? (s.baseLine + e.lineNumber - 1) : s.baseLine;
      console.log(`Syntax error in script #${i} around HTML line ${line}: ${e.message}`);
    }
  });
  if (ok) console.log('All inline scripts parsed without syntax errors.');
}

if (require.main === module) main();