/**
 * Проверка матрицы контента оркестрации: четыре марки и обязательные строки таблицы
 * (без «Краткое описание» и без строки **TRL** / **TRL / MRL** в таблице — в соответствии с текущей структурой карточек).
 * Запуск из корня репозитория: node scripts/verify-sorbent-matrix.js
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const matrixPath = path.join(
  root,
  '.cursor',
  'workspace',
  'active',
  'orch-2026-04-02-12-00-sorbenty',
  'content-matrix.md'
);

/** Заголовки ## … — точное совпадение строки, без ложных срабатываний на -3А/-35 */
const HEADING_RES = [
  /^## Термоксид-3$/m,
  /^## Термоксид-3А$/m,
  /^## Термоксид-3К$/m,
  /^## Термоксид-35$/m,
];

const PRODUCT_TITLES = [
  'Термоксид-3',
  'Термоксид-3А',
  'Термоксид-3К',
  'Термоксид-35',
];

/** Подстрока в строке таблицы (первая колонка может быть «Задачи (области применения)» — достаточно «Задачи») */
const TABLE_LABEL_SUBSTRINGS = [
  'Задачи',
  'Технические характеристики',
  'Ключевые преимущества',
  'Контакты',
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Тело секции: от строки ## Title до следующего ## или конца файла */
function extractSection(text, title) {
  const re = new RegExp('^## ' + escapeRegExp(title) + '\\s*$', 'm');
  const m = text.match(re);
  if (!m || m.index == null) return null;
  const after = text.slice(m.index + m[0].length);
  const next = after.match(/^## /m);
  return next ? after.slice(0, next.index) : after;
}

function isTableRowLine(line) {
  return /^\s*\|/.test(line);
}

function tableRowIncludesLabel(section, label) {
  for (const line of section.split(/\r?\n/)) {
    if (!isTableRowLine(line)) continue;
    if (line.includes(label)) return true;
  }
  return false;
}

function verifyProductSection(title, body) {
  const problems = [];
  if (!body || !body.trim()) {
    return [`${title}: пустая секция`];
  }
  for (const label of TABLE_LABEL_SUBSTRINGS) {
    if (!tableRowIncludesLabel(body, label)) {
      problems.push(`${title}: в строках таблицы нет метки «${label}»`);
    }
  }
  return problems;
}

if (!fs.existsSync(matrixPath)) {
  console.error('FAIL: файл не найден:', matrixPath);
  process.exit(1);
}

const text = fs.readFileSync(matrixPath, 'utf8');
const missingHeadings = HEADING_RES.filter((re) => !re.test(text)).map((re) => re.source);

if (missingHeadings.length) {
  console.error('FAIL: в матрице нет заголовков (строка ## …):', missingHeadings.join(', '));
  process.exit(1);
}

const allProblems = [];
for (const title of PRODUCT_TITLES) {
  const body = extractSection(text, title);
  if (body === null) {
    allProblems.push(`${title}: не удалось выделить секцию`);
    continue;
  }
  allProblems.push(...verifyProductSection(title, body));
}

if (allProblems.length) {
  console.error('FAIL: проверка строк таблицы по секциям:');
  for (const p of allProblems) console.error('  -', p);
  process.exit(1);
}

console.log(
  'OK: content-matrix.md — четыре марки; в каждой секции: Задачи, Технические характеристики, Ключевые преимущества, Контакты.'
);
