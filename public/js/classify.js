/* ══════════════════════════════════════════
   CLASSIFY — local keyword detection + AI fallback
   ─────────────────────────────────────────
   localClassify()     : keyword-only, no network, no DOM
   classifyTranscript(): tries Cloudflare Worker → OpenAI first, falls back to local
   detectCat()         : single-text category detection (dynamic, updated by rebuildDetectRegex)
   rebuildDetectRegex(): rebuilds detectCat based on state.categories custom keywords
══════════════════════════════════════════ */

/* ── Local keyword maps ── */
const LOCAL_CAT_KW = {
  Work:     /meeting|email|report|client|project|deadline|invoice|proposal|presentation|call|boss|budget|strategy|slide|review|打ち合わせ|メール|報告|クライアント|プロジェクト|締め切り|請求|提案|プレゼン|上司|予算|ミーティング/i,
  Home:     /groceri|supermarket|clean|trash|laundry|repair|fix|bill|rent|cook|dinner|plant|delivery|flat|apartment|mom|mum|dad|papa|mama|son|daughter|kids|child|children|husband|wife|partner|grandma|grandpa|granny|gramps|baby|mother|father|parent|sibling|brother|sister|family|買い物|スーパー|掃除|ゴミ|洗濯|修理|光熱費|家賃|料理|夕食|荷物|配達|お母さん|母|お父さん|父|子供|息子|娘|夫|妻|おばあちゃん|おじいちゃん|赤ちゃん|兄|弟|姉|妹|家族/i,
  Personal: /gym|run|jog|doctor|dentist|hospital|read|book|friend|travel|hobby|learn|meditation|yoga|haircut|ジム|ランニング|医者|歯医者|病院|読書|友達|旅行|趣味|勉強|瞑想|ヨガ/i,
};
const LOCAL_TIMING_KW = {
  Today: /\b(today|urgent|asap|now|immediately|tonight|今日|今すぐ|急ぎ|本日|今夜)\b/i,
  Later: /\b(someday|eventually|later|future|no rush|そのうち|いつか|後で|将来|急がない)\b/i,
};

// Personal-recipient keywords — used to route "email to mum" → Home instead of Work
const PERSONAL_RECIPIENT_KW = /\b(mom|mum|mummy|dad|daddy|papa|mama|son|daughter|kids|child|children|husband|wife|partner|grandma|grandpa|granny|grandad|gramps|baby|mother|father|parents?|sibling|brother|sister|family|friend|お母さん|母|お父さん|父|子供|息子|娘|夫|妻|おばあちゃん|おじいちゃん|赤ちゃん|兄|弟|姉|妹|家族|友達)\b/i;
const EMAIL_KW = /\b(email|emails?|mail|メール)\b/i;

function localDetectCat(text) {
  // Email with a personal recipient (e.g. "email mum", "write email to dad") → Home
  if (EMAIL_KW.test(text) && PERSONAL_RECIPIENT_KW.test(text)) return 'Home';
  for (const [c, r] of Object.entries(LOCAL_CAT_KW)) if (r.test(text)) return c;
  return 'Other';
}

function localDetectTiming(text, def) {
  if (LOCAL_TIMING_KW.Today.test(text)) return 'Today';
  if (LOCAL_TIMING_KW.Later.test(text)) return 'Later';
  return def || 'This Week';
}

// Split transcript into tasks — no lookbehind regex (unsupported on older Safari)
function localClassify(transcript, defaultTiming) {
  const cleanText = t => t
    .replace(/\b(today|tonight|this week|later|someday|eventually|asap|now|immediately)\b/gi, '')
    .replace(/今日|今週|そのうち|急ぎ|いつか|後で/g, '')
    .replace(/\s+/g, ' ').trim();

  // Replace sentence-ending punctuation with comma, then split
  const parts = transcript
    .replace(/[。.!?！？]/g, '$&,')
    .split(/,\s*and\s+|\s+and\s+|[、。；;,]\s*/)
    .map(s => s.replace(/^(and|also|そして|それから|あと|また)\s+/i, '').trim())
    .filter(s => s.length > 1);

  if (parts.length === 0) {
    const cleaned = cleanText(transcript);
    if (!cleaned) return [];
    return [{ text: cleaned, timing: localDetectTiming(transcript, defaultTiming), category: localDetectCat(transcript) }];
  }

  return parts.map(p => ({
    text:     cleanText(p) || p.trim(),
    timing:   localDetectTiming(p, defaultTiming),
    category: localDetectCat(p)
  })).filter(t => t.text.length > 0);
}

/* Send transcript to Cloudflare Worker → OpenAI → structured task list
   Falls back to local keyword classification if API key is not set */
async function classifyTranscript(transcript) {
  const categories    = state.categories.map(c => c.en);
  const defaultTiming = state.defaultTiming || 'This Week';

  // Build custom keyword map for AI: { Work: ['client1', 'boss'], Home: ['mom', 'cleaner'] }
  const categoryKeywords = {};
  state.categories.forEach(c => { if (c.keywords.length) categoryKeywords[c.en] = c.keywords; });

  // Try Cloudflare Worker → OpenAI (key lives in Cloudflare secrets, never in browser)
  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, categories, categoryKeywords, defaultTiming, lang: state.lang })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tasks && data.tasks.length > 0) return data.tasks;
    }
  } catch(e) {
    console.warn('API classify failed, using local:', e);
  }

  // Local fallback
  return localClassify(transcript, defaultTiming);
}

/* ── Dynamic category detection — updated by rebuildDetectRegex() ── */
let _catDetectFn = null;

function rebuildDetectRegex() {
  // Rebuild detection from state.categories (includes user-added custom keywords)
  _catDetectFn = text => {
    // Email with a personal recipient → Home (overrides the Work 'email' keyword)
    if (/\b(email|emails?|mail|メール)\b/i.test(text) &&
        /\b(mom|mum|mummy|dad|daddy|papa|mama|son|daughter|kids|child|children|husband|wife|partner|grandma|grandpa|granny|grandad|gramps|baby|mother|father|parents?|sibling|brother|sister|family|friend|お母さん|母|お父さん|父|子供|息子|娘|夫|妻|おばあちゃん|おじいちゃん|赤ちゃん|兄|弟|姉|妹|家族|友達)\b/i.test(text)) {
      return 'Home';
    }
    // Check user-defined keywords
    for (const cat of state.categories) {
      if (cat.id === 'other') continue;
      if (cat.keywords.some(kw => new RegExp(kw, 'i').test(text))) return cat.en;
    }
    // Fallback to comprehensive built-in lists
    for (const [c, r] of Object.entries(LOCAL_CAT_KW)) if (r.test(text)) return c;
    return 'Other';
  };
}

function detectCat(t) {
  return _catDetectFn ? _catDetectFn(t) : 'Other';
}

rebuildDetectRegex();
