/**
 * compare-chart.js
 * Reusable Free vs PRO comparison chart module.
 *
 * Usage:
 *   import { renderCompareChart } from '/js/compare-chart.js';
 *   renderCompareChart('#compare-wrap', COMPARE_FEATURES);
 *
 * Or inline via <script type="module"> in any HTML page.
 */

/** SVG icon library keyed by name */
const ICONS = {
  tasks: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  palette: `<i class="fa-solid fa-palette"></i>`,
  rollover: `<i class="fa-solid fa-arrows-rotate"></i>`,
  category: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>`,
  keywords: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
  export: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  cloud: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>`,
  stats: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
};

/**
 * Default feature set for the Free vs PRO comparison.
 * Each row:
 *   icon     – key from ICONS
 *   name     – English display name
 *   nameJa   – Japanese display name
 *   desc     – English subtitle
 *   descJa   – Japanese subtitle
 *   free     – string value shown in Free column, true for ✓, false for —
 *   pro      – string value shown in PRO column, true for ✓, false for —
 */
export const COMPARE_FEATURES = [
  {
    icon: 'tasks',
    name: 'Tasks',           nameJa: 'タスク数',
    desc: 'Total number of tasks', descJa: 'タスクの合計数',
    free: '30', pro: '∞',
  },
  {
    icon: 'palette',
    name: 'Colour palettes', nameJa: 'カラーパレット',
    desc: 'App theme colours',     descJa: 'アプリテーマカラー',
    free: '2',  pro: '13',
  },
  {
    icon: 'rollover',
    name: 'Task rollover',   nameJa: 'タスク繰越',
    desc: 'Carry unfinished tasks forward', descJa: '未完了タスクを翌日へ繰越',
    free: true, pro: true,
  },
  {
    icon: 'category',
    name: 'Customise Category', nameJa: 'カテゴリのカスタマイズ',
    desc: 'Rename Work, Home, etc.', descJa: '仕事、家など名前を変更',
    free: false, pro: true,
  },
  {
    icon: 'keywords',
    name: 'Custom keywords', nameJa: 'カスタムキーワード',
    desc: 'Save keywords for better categorisation', descJa: 'キーワードを保存してより正確に分類',
    free: false, pro: true,
  },
  {
    icon: 'export',
    name: 'Export tasks',    nameJa: 'タスクのエクスポート',
    desc: 'Download your list to paste', descJa: 'リストをダウンロードして貼り付け',
    free: false, pro: true,
  },
  {
    icon: 'cloud',
    name: 'Cloud sync',      nameJa: 'クラウド同期',
    desc: 'Sync across all devices', descJa: 'すべてのデバイスで同期',
    free: false, pro: true,
  },
  {
    icon: 'stats',
    name: 'Weekly stats',    nameJa: '週間統計',
    desc: 'Productivity breakdown (coming soon)', descJa: '生産性の内訳（近日公開）',
    free: false, pro: true,
  },
];

/** Render a single column value cell */
function renderVal(value, isPro) {
  if (value === true)  return `<div class="compare-val"><span class="val-check">✓</span></div>`;
  if (value === false) return `<div class="compare-val"><span class="val-dash">—</span></div>`;
  const cls = isPro ? 'val-pro' : 'val-free';
  return `<div class="compare-val"><span class="${cls}">${value}</span></div>`;
}

/** Build the full inner HTML for a .compare-wrap element */
function buildChartHTML(features, lang = 'en') {
  const t = (en, ja) => lang === 'ja' ? ja : en;

  const headerHTML = `
    <div class="compare-header">
      <div class="compare-header-label" data-en="Feature" data-ja="機能">${t('Feature', '機能')}</div>
      <div class="compare-col-head">
        <div class="col-plan-name" data-en="Free" data-ja="無料">${t('Free', '無料')}</div>
      </div>
      <div class="compare-col-head">
        <div class="col-plan-name col-plan-pro" data-en="PRO" data-ja="PRO">PRO</div>
      </div>
    </div>`;

  const rowsHTML = features.map(f => `
    <div class="compare-row">
      <div class="feat-row-left">
        <div class="feat-icon">${ICONS[f.icon] || ''}</div>
        <div class="feat-info">
          <div class="feat-name" data-en="${f.name}" data-ja="${f.nameJa}">${t(f.name, f.nameJa)}</div>
          <div class="feat-desc-small" data-en="${f.desc}" data-ja="${f.descJa}">${t(f.desc, f.descJa)}</div>
        </div>
      </div>
      ${renderVal(f.free, false)}
      ${renderVal(f.pro, true)}
    </div>`).join('');

  return headerHTML + rowsHTML;
}

/**
 * Render the comparison chart into a container element.
 * @param {string|Element} target  CSS selector or DOM element (.compare-wrap)
 * @param {Array}          features  Array of feature row objects (defaults to COMPARE_FEATURES)
 * @param {string}         lang      'en' | 'ja'
 */
export function renderCompareChart(target, features = COMPARE_FEATURES, lang = 'en') {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  el.innerHTML = buildChartHTML(features, lang);
}
