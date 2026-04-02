/**
 * Вставляет partials/header.html и partials/footer.html во все корневые *.html.
 * Проставляет body[data-nav-active] по имени файла.
 * Запуск из корня проекта: node scripts/refresh-layout.mjs
 *
 * Любой пропуск или ошибка по странице из NAV_ACTIVE_BY_FILE → stderr (ERROR …) и код выхода 1.
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
  'nauka-innovacii.html': 'directions',
  'nauka-vodoochistka.html': 'directions',
  'nauka-medicina.html': 'directions',
  'nauka-atom.html': 'directions',
  'rza.html': 'directions',
  'nadezhnost.html': 'directions',
  'rukovodstvo.html': 'management',
  'opyt.html': 'experience',
  'licenzii.html': 'licenses',
  'suot.html': 'none',
  'kontakty.html': 'contacts',
};

const headerPath = path.join(root, 'partials', 'header.html');
const footerPath = path.join(root, 'partials', 'footer.html');

/**
 * @param {string} file
 * @param {string} reason
 * @param {Error | null} [err]
 */
function logError(file, reason, err = null) {
  const parts = ['ERROR', `file=${file}`, `reason=${reason}`];
  if (err?.message) parts.push(`detail=${JSON.stringify(err.message)}`);
  console.error(parts.join(' '));
}

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

/**
 * @param {string} canonicalName key in NAV_ACTIVE_BY_FILE (stable casing for data-nav-active lookup)
 * @param {string} diskFileName actual filename from disk (may differ in case on Windows)
 * @param {string} header
 * @param {string} footer
 * @returns {boolean} true if page updated successfully
 */
function processPage(canonicalName, diskFileName, header, footer) {
  const filePath = path.join(root, diskFileName);
  let html;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    logError(canonicalName, 'read_failed', e instanceof Error ? e : new Error(String(e)));
    return false;
  }

  try {
    const hb = sliceHeaderMobileBlock(html);
    if (!hb) {
      logError(canonicalName, 'no_header_mobile_block');
      return false;
    }
    const fb = sliceFooterBlock(html);
    if (!fb) {
      logError(canonicalName, 'no_footer');
      return false;
    }

    html = html.slice(0, hb.start) + header.trimEnd() + '\n\n' + html.slice(hb.end);
    const fb2 = sliceFooterBlock(html);
    if (!fb2) {
      logError(canonicalName, 'footer_lost_after_header_replace');
      return false;
    }
    html = html.slice(0, fb2.start) + footer.trimEnd() + '\n\n' + html.slice(fb2.end);

    html = ensureBodyNavActive(html, canonicalName);

    fs.writeFileSync(filePath, html, 'utf8');
  } catch (e) {
    logError(canonicalName, 'transform_or_write_failed', e instanceof Error ? e : new Error(String(e)));
    return false;
  }

  console.log('ok', canonicalName);
  return true;
}

function main() {
  let header;
  let footer;
  try {
    header = fs.readFileSync(headerPath, 'utf8');
  } catch (e) {
    logError(path.relative(root, headerPath) || 'partials/header.html', 'read_failed', e instanceof Error ? e : new Error(String(e)));
    process.exit(1);
  }
  try {
    footer = fs.readFileSync(footerPath, 'utf8');
  } catch (e) {
    logError(path.relative(root, footerPath) || 'partials/footer.html', 'read_failed', e instanceof Error ? e : new Error(String(e)));
    process.exit(1);
  }

  /** @type {Map<string, string>} lowercased name → actual filename on disk */
  let rootFilesByLower;
  try {
    rootFilesByLower = new Map();
    for (const entry of fs.readdirSync(root)) {
      rootFilesByLower.set(entry.toLowerCase(), entry);
    }
  } catch (e) {
    logError('.', 'readdir_root_failed', e instanceof Error ? e : new Error(String(e)));
    process.exit(1);
  }

  const pages = Object.keys(NAV_ACTIVE_BY_FILE);
  let failures = 0;

  for (const name of pages) {
    const diskName = rootFilesByLower.get(name.toLowerCase());
    if (diskName === undefined) {
      logError(name, 'page_missing_from_root');
      failures++;
      continue;
    }
    const ok = processPage(name, diskName, header, footer);
    if (!ok) failures++;
  }

  process.exit(failures > 0 ? 1 : 0);
}

main();
