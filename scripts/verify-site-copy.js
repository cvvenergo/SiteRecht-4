#!/usr/bin/env node
// NAV-002 guard: legacy “water treatment” nav copy and removed i18n key must not return.
// Scans: js/i18n.js, root *.html only (not partials/, not .cursor).
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** Plain-text fragments that must not appear in scanned sources. */
const FORBIDDEN_SUBSTRINGS = ['Водоподготовка и водоочистка'];

/** Old dropdown key replaced by nav.dd.science — must not appear as an HTML attribute value. */
const BROKEN_I18N_ATTR_RE = /=\s*["']nav\.dd\.water["']/;

/** Legacy translation key line in js/i18n.js */
const LEGACY_KEY_LINE_RE = /^\s*'nav\.dd\.water'\s*:/m;

function listRootHtmlFiles() {
  const names = fs.readdirSync(ROOT);
  return names
    .filter((n) => n.endsWith('.html') && !n.startsWith('.'))
    .map((n) => path.join(ROOT, n));
}

function main() {
  const files = [path.join(ROOT, 'js', 'i18n.js'), ...listRootHtmlFiles()];
  /** @type {{ file: string; detail: string }[]} */
  const hits = [];

  for (const abs of files) {
    let text;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    const isI18n = rel === 'js/i18n.js';
    const isHtml = rel.endsWith('.html');

    for (const s of FORBIDDEN_SUBSTRINGS) {
      if (text.includes(s)) hits.push({ file: rel, detail: `forbidden substring: ${s}` });
    }
    if (isHtml && BROKEN_I18N_ATTR_RE.test(text)) {
      hits.push({ file: rel, detail: 'broken i18n attribute value nav.dd.water' });
    }
    if (isI18n && LEGACY_KEY_LINE_RE.test(text)) {
      hits.push({ file: rel, detail: "legacy key line 'nav.dd.water'" });
    }
  }

  if (hits.length) {
    console.error('verify-site-copy: FAIL');
    for (const h of hits) console.error(`  ${h.file}: ${h.detail}`);
    process.exit(1);
  }
  console.log('verify-site-copy: ok (no forbidden NAV-002 legacy strings in js/i18n.js or root html).');
}

main();
