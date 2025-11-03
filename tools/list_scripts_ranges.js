const fs = require('fs');
const path = require('path');

const p = process.argv[2] || path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(p, 'utf8');
let re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m;let base=1;let off=0;let i=0;
while((m=re.exec(html))){
  const before = html.slice(off, m.index);
  base += (before.match(/\n/g)||[]).length;
  const lines = (m[1].match(/\n/g)||[]).length;
  console.log(`script#${i} startLine=${base} lines=${lines} endLine=${base+lines}`);
  base += lines;
  off = m.index + m[0].length;
  i++;
}