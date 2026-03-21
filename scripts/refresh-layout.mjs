/**
 * Вставляет partials/header.html и partials/footer.html во все корневые *.html.
 * Проставляет body[data-nav-active] по имени файла.
 * Запуск из корня проекта: node scripts/refresh-layout.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const NAV_ACTIVE_BY_FILE = {
  'index.html': 'home',
  'sorbenty.html': 'directions',
  'energosistemy.html': 'directions',
  'inzhiniring.html': 'directions',
  'vodoochistka.html': 'directions',
  'rza.html': 'directions',
  'nadezhnost.html': 'directions',
  'rukovodstvo.html': 'management',
  'opyt.html': 'experience',
  'licenzii.html': 'licenses',
  'kontakty.html': 'contacts',
};

const headerPath = path.join(root, 'partials', 'header.html');
const footerPath = path.join(root, 'partials', 'footer.html');

function findClosingDivEnd(html, startIdx) {
  let pos = startIdx;
  let depth = 0;
  while (pos < html.length) {
    if (html.startsWith('<div', pos)) {
      depth++;
      const gt = html.indexOf('>', pos);
      if (gt === -1) return -1;
      pos = gt + 1;
    } else if (html.startsWith('</div>', pos)) {
      depth--;
      pos += 6;
      if (depth === 0) return pos;
    } else {
      pos++;
    }
  }
  return -1;
}

function sliceHeaderMobileBlock(html) {
  const openRe = /(?:<!--\s*HEADER\s*-->\s*)*<header class="header">/;
  const m = html.match(openRe);
  if (!m || m.index === undefined) return null;
  const blockStart = m.index;
  const mStart = html.indexOf('<div class="mobile-nav">', blockStart);
  if (mStart === -1) return null;
  const mEnd = findClosingDivEnd(html, mStart);
  if (mEnd === -1) return null;
  return { start: blockStart, end: mEnd };
}

function sliceFooterBlock(html) {
  const openRe = /(?:<!--\s*FOOTER\s*-->\s*)*<footer class="footer">/;
  const m = html.match(openRe);
  if (!m || m.index === undefined) return null;
  const blockStart = m.index;
  const fEnd = html.indexOf('</footer>', blockStart);
  if (fEnd === -1) return null;
  return { start: blockStart, end: fEnd + '</footer>'.length };
}

function ensureBodyNavActive(html, fileName) {
  const key = NAV_ACTIVE_BY_FILE[fileName];
  if (!key) return html;
  return html.replace(/<body([^>]*)>/i, (_match, attrs) => {
    let next = attrs;
    if (/\sdata-nav-active=/.test(next)) {
      next = next.replace(/\sdata-nav-active="[^"]*"/, ` data-nav-active="${key}"`);
    } else {
      next = `${next.trimEnd()} data-nav-active="${key}"`;
    }
    return `<body${next}>`;
  });
}

function main() {
  const header = fs.readFileSync(headerPath, 'utf8');
  const footer = fs.readFileSync(footerPath, 'utf8');
  const files = fs.readdirSync(root).filter((f) => f.endsWith('.html'));

  for (const name of files) {
    if (!NAV_ACTIVE_BY_FILE[name]) continue;

    const filePath = path.join(root, name);
    let html = fs.readFileSync(filePath, 'utf8');

    const hb = sliceHeaderMobileBlock(html);
    if (!hb) {
      console.error(`skip ${name}: no header/mobile block`);
      continue;
    }
    const fb = sliceFooterBlock(html);
    if (!fb) {
      console.error(`skip ${name}: no footer`);
      continue;
    }

    html = html.slice(0, hb.start) + header.trimEnd() + '\n\n' + html.slice(hb.end);
    const fb2 = sliceFooterBlock(html);
    if (!fb2) {
      console.error(`skip ${name}: footer lost after header replace`);
      continue;
    }
    html = html.slice(0, fb2.start) + footer.trimEnd() + '\n\n' + html.slice(fb2.end);

    html = ensureBodyNavActive(html, name);

    fs.writeFileSync(filePath, html, 'utf8');
    console.log('ok', name);
  }
}

main();
