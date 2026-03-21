/**
 * Подставляет общие partials/header.html и partials/footer.html во все *.html в корне проекта.
 * Запуск: node scripts/refresh-layout.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const partialsDir = path.join(root, 'partials');

const NAV_ACTIVE_BY_FILE = {
  'index.html': 'home',
  'sorbenty.html': 'directions',
  'energosistemy.html': 'directions',
  'inzhiniring.html': 'directions',
  'vodoochistka.html': 'directions',
  'nadezhnost.html': 'directions',
  'rza.html': 'directions',
  'rukovodstvo.html': 'rukovodstvo',
  'opyt.html': 'opyt',
  'licenzii.html': 'licenses',
  'kontakty.html': 'contacts',
};

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

function endOfDivTree(html, divOpenStart) {
  const gt = html.indexOf('>', divOpenStart);
  if (gt === -1) throw new Error('Malformed <div');
  let i = gt + 1;
  let depth = 1;
  while (depth > 0) {
    const open = html.indexOf('<div', i);
    const close = html.indexOf('</div>', i);
    if (close === -1) throw new Error('Unclosed <div class="mobile-nav">');
    if (open !== -1 && open < close) {
      depth++;
      const nextGt = html.indexOf('>', open);
      if (nextGt === -1) throw new Error('Malformed nested <div');
      i = nextGt + 1;
    } else {
      depth--;
      i = close + 6;
    }
  }
  return i;
}

function replaceHeaderBlock(html, headerPartial) {
  let hStart = html.indexOf('<!-- HEADER -->');
  if (hStart === -1) {
    hStart = html.indexOf('<header class="header">');
  }
  if (hStart === -1) {
    throw new Error('No header block found');
  }
  const mobileStart = html.indexOf('<div class="mobile-nav">', hStart);
  if (mobileStart === -1) {
    throw new Error('No mobile-nav found after header');
  }
  const mobileEnd = endOfDivTree(html, mobileStart);
  return html.slice(0, hStart) + headerPartial + '\n\n' + html.slice(mobileEnd);
}

function replaceFooterBlock(html, footerPartial) {
  const fStart = html.indexOf('<!-- FOOTER -->');
  if (fStart === -1) {
    throw new Error('No <!-- FOOTER --> marker');
  }
  const footStart = html.indexOf('<footer class="footer">', fStart);
  if (footStart === -1) {
    throw new Error('No <footer class="footer"> after marker');
  }
  const footEnd = html.indexOf('</footer>', footStart);
  if (footEnd === -1) {
    throw new Error('Unclosed footer');
  }
  const end = footEnd + '</footer>'.length;
  return html.slice(0, fStart) + footerPartial.trimEnd() + '\n\n' + html.slice(end);
}

function ensureNavActive(html, filename) {
  const nav = NAV_ACTIVE_BY_FILE[filename];
  if (!nav) return html;
  return html.replace(/<body([^>]*)>/, (full, attrs) => {
    if (/\bdata-nav-active=/.test(attrs)) {
      return full.replace(
        /\bdata-nav-active="[^"]*"/,
        `data-nav-active="${nav}"`
      );
    }
    const trimmed = attrs.endsWith(' ') ? attrs : attrs + ' ';
    return `<body${trimmed}data-nav-active="${nav}">`;
  });
}

const headerPartial = readUtf8(path.join(partialsDir, 'header.html')).trimEnd();
const footerPartial = readUtf8(path.join(partialsDir, 'footer.html')).trimEnd();

const htmlFiles = fs
  .readdirSync(root)
  .filter((f) => f.endsWith('.html') && fs.statSync(path.join(root, f)).isFile());

for (const file of htmlFiles) {
  const fp = path.join(root, file);
  let html = readUtf8(fp);
  html = replaceHeaderBlock(html, headerPartial);
  html = replaceFooterBlock(html, footerPartial);
  html = ensureNavActive(html, file);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('OK', file);
}
