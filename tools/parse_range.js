const fs = require('fs');
const path = require('path');
const vm = require('vm');

const file = path.resolve(__dirname, '..', 'index.html');
const start = parseInt(process.argv[2] || '1500', 10);
const end = parseInt(process.argv[3] || '1700', 10);

const html = fs.readFileSync(file, 'utf8');
let re = /<script[^>]*>([\s\S]*?)<\/script>/gi; let m; let base=1; let off=0;
let target;
while ((m = re.exec(html))) {
  const before = html.slice(off, m.index);
  base += (before.match(/\n/g)||[]).length;
  const lines = (m[1].match(/\n/g)||[]).length;
  const startLine = base;
  const endLine = base + lines;
  if (start >= startLine && end <= endLine) {
    target = m[1].split(/\n/).slice(start - startLine, end - startLine + 1).join('\n');
    break;
  }
  base = endLine;
  off = m.index + m[0].length;
}

if (!target) {
  console.error('Range not within a script');
  process.exit(2);
}

try {
  new vm.Script(target, { filename: `range-${start}-${end}.js` });
  console.log('Parsed OK');
} catch (e) {
  console.log('Syntax error:', e.message);
  if (e.lineNumber) console.log('At local line:', e.lineNumber);
}