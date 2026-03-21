# Remediation: orch-audit-2026-03-21

**Дата**: 2026-03-21  
**Тип**: develop / пост-аудит (оркестрация)

## Ссылка на аудит

Полный отчёт с нумерацией находок A\*/S\*/Q\*:

- [Отчёт аудита 2026-03-21](audits/2026-03-21-full-project-audit.md)

План работ и формулировки задач: `.cursor/workspace/active/orch-audit-2026-03-21/plan.md`.

## Выполненные задачи (TASK-1 … TASK-8)

| ID | Кратко | Основные зоны |
|----|--------|----------------|
| TASK-1 | SRI + `crossorigin`, pinning CDN | Корневые `*.html` (Font Awesome, Google Fonts как `<link>` без SRI), `opyt.html` (MapLibre 4.7.1 + integrity) |
| TASK-2 | Устойчивость `refresh-layout.mjs` | `scripts/refresh-layout.mjs` — ошибки в stderr, код выхода ≠ 0 при сбое |
| TASK-3 | Безопасная активация табов по hash | `js/script.js` — allowlist ID панелей |
| TASK-4 | `localStorage` в i18n | `js/i18n.js` — предупреждения в консоль при сбое чтения/записи языка |
| TASK-5 | Карта: ошибки и fallback | `js/pages/opyt-map.js`, `opyt.html`, ключи в `js/i18n.js` |
| TASK-6 | ~~Честная заглушка формы~~ **откат** (2026-03-21): прежнее UX «сообщение отправлено» без бэкенда; тексты в `js/i18n.js` и `kontakty.html` синхронизированы, скрипт — `js/pages/kontakty.js` |
| TASK-7 | Вынесение inline-скриптов | `js/pages/licenzii.js`, `kontakty.js`, `opyt-map.js` + подключения в HTML |
| TASK-8 | Документация и трек оркестрации | `README.md`, этот файл, обновление отчёта аудита, `tasks.json` / `progress.json` |

## Остаточный бэклог (кратко)

Не входили в объём восьми задач или закрыты лишь частично: монолитный `js/i18n.js` **[A1]**, CSP и политика `innerHTML` **[S2/S3]**, мета description при смене языка **[Q2]**, дальнейшее разбиение CSS/архитектуры и т.д. — см. раздел **«Remediation (orch-audit-2026-03-21)»** и **«Остаётся»** в файле аудита.
