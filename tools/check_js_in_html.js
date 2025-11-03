const fs = require('fs');
const path = require('path');

function stripStringsComments(code) {
  // Remove template literals cautiously: replace content with ``
  code = code.replace(/`[\s\S]*?`/g, '``');
  // Remove single-line comments
  code = code.replace(/(^|[^:])\/\/.*$/gm, '$1');
  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove regular strings
  code = code.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, '""');
  return code;
}

function checkBraces(code, baseLine = 1) {
  const stripped = stripStringsComments(code);
  let depth = 0;
  let line = baseLine;
  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === '\n') line++;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth < 0) {
        return { ok: false, line, index: i, message: 'Unexpected }', depth };
      }
    }
  }
  if (depth !== 0) {
    return { ok: false, line, message: 'Unbalanced braces at end', depth };
  }
  return { ok: true };
}

function main() {
  const htmlPath = process.argv[2] || path.resolve(__dirname, '..', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let baseLine = 1;
  let offset = 0;
  let foundError = false;
  while ((match = scriptRegex.exec(html)) !== null) {
    const before = html.slice(offset, match.index);
    baseLine += (before.match(/\n/g) || []).length;
    const js = match[1];
    const res = checkBraces(js, baseLine);
    if (!res.ok) {
      console.log(`Brace issue in script block at ~line ${res.line}: ${res.message}`);
      foundError = true;
      break;
    }
    baseLine += (js.match(/\n/g) || []).length;
    offset = match.index + match[0].length;
  }
  if (!foundError) console.log('No obvious brace issues detected in scripts.');
}

if (require.main === module) main();