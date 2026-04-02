#!/usr/bin/env node
// NAV-001 guard: fail if deprecated contact email appears in site sources.
// Scans: all .html (except skipped dirs), .js under js/, all files under partials/.
'use strict';

const fs = require('fs');
const path = require('path');

const FORBIDDEN = 'info@raecht.ru';
const ROOT = path.resolve(__dirname, '..');

/** Directory names to never enter (any depth). */
const SKIP_DIR_NAMES = new Set(['.git', '.cursor', 'node_modules']);

function shouldScanFile(relPosix, absPath) {
  const ext = path.extname(absPath).toLowerCase();
  if (ext === '.html') return true;
  if (relPosix.startsWith('js/') && ext === '.js') return true;
  if (relPosix.startsWith('partials/')) return true;
  return false;
}

function collectFiles(dir, baseRel, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (SKIP_DIR_NAMES.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    const rel = baseRel ? `${baseRel}/${ent.name}` : ent.name;
    const relPosix = rel.split(path.sep).join('/');
    if (ent.isDirectory()) {
      collectFiles(abs, rel, acc);
    } else if (shouldScanFile(relPosix, abs)) {
      acc.push(abs);
    }
  }
}

function main() {
  const files = [];
  collectFiles(ROOT, '', files);
  const hits = [];
  for (const abs of files) {
    let text;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    if (text.includes(FORBIDDEN)) {
      hits.push(path.relative(ROOT, abs));
    }
  }
  if (hits.length) {
    console.error(`verify-email: forbidden substring "${FORBIDDEN}" found in:\n  ${hits.join('\n  ')}`);
    process.exit(1);
  }
  console.log('verify-email: ok (no forbidden contact email in html/js/partials sources).');
}

main();
