/**
 * Poplist — task classification & transcript splitting
 * ======================================================
 * Single source of truth for voice / paste / manual classify.
 *
 * Sections:
 *   (1) Orchestration — local split + /api/classify (OpenAI via Worker)
 *   (2) Language-agnostic — routing, punctuation phases, subdivide, keyword priority
 *   (3) Japanese (ja) — run-on splitting, polite / する / もらう heuristics
 *   (4) English (en) — run-on splitting, modal chains
 *   (5) Future locales — add e.g. splitLongZhRunOn() and branch in localClassify()
 *
 * Wiring: after `const state = { ... }`, call:
 *   PoplistTaskClassify.attach(() => state);
 * Globals kept for index.html: classifyTranscript, localClassify, subdivideTaskObjects
 */
(function (global) {
  'use strict';

  // ── Runtime binding (set from app after `state` exists) ─────────────────
  let _getState = null;

  function requireState() {
    if (typeof _getState !== 'function') {
      console.warn('[PoplistTaskClassify] attach(() => state) not called yet');
      return null;
    }
    return _getState();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // (4) ENGLISH — long run-ons, modal chains, glued Latin verbs
  // ═══════════════════════════════════════════════════════════════════════

  function splitLongEnglishRunOn(s) {
    let bits = s.split(/\s+(?=(?:need to|have to|has to|must|got to|gotta|going to|will)\s+)/i);
    if (bits.length > 1) {
      bits = bits.map((x) => x.trim()).filter((x) => x.length > 1);
      if (bits.length > 1) return bits;
    }
    bits = s.split(/\s*(?:\band\b|\bthen\b|\balso\b|\bplus\b)\s+/i);
    if (bits.length > 1) return bits.map((x) => x.trim()).filter((x) => x.length > 1);
    bits = s.split(/\s*,\s+/).map((x) => x.trim()).filter((x) => x.length > 3);
    if (bits.length > 1) return bits;
    if (!/\s/.test(s) && s.length > 18) {
      const glued = s
        .split(
          /(?<=[a-z])(?=call|email|e-?mail|text|buy|send|book|pay|meet|visit|schedule|remind|finish|return|pick|drop|go|get|make|take|order|print|review|write|read|clean|cook|walk|run)(?=[a-z])/i
        )
        .map((x) => x.trim())
        .filter((x) => x.length > 2);
      if (glued.length > 1) return glued;
    }
    if (s.length < 56) return [s];
    return [s];
  }

  // ═══════════════════════════════════════════════════════════════════════
  // (3) JAPANESE — CJK counts, merge tails, obligation / polite / する / て
  // ═══════════════════════════════════════════════════════════════════════

  function countCjkChars(s) {
    return (s.match(/[\u3040-\u30ff\u4e00-\u9fff]/g) || []).length;
  }

  function mergeTinyJapaneseSegments(parts) {
    if (!parts || parts.length <= 1) return parts || [];
    const merged = [parts[0].trim()];
    for (let i = 1; i < parts.length; i++) {
      const cur = parts[i].trim();
      if (!cur) continue;
      const prev = merged[merged.length - 1];
      const cjkCur = countCjkChars(cur);
      if (merged.length && cjkCur < 3 && cur.length <= 5) {
        merged[merged.length - 1] = (prev + cur).trim();
      } else {
        merged.push(cur);
      }
    }
    return merged.filter(Boolean);
  }

  function splitJapaneseObligationBoundaries(s) {
    if (!s || countCjkChars(s) <= 4) return null;
    let t = s;
    t = t.replace(
      /(ないといけない|なければならない|なきゃいけない|しなくてはいけない|しなくちゃいけない|しなくちゃ)(?=[\u4e00-\u9fff\u30a1-\u30ff])/g,
      '$1\u0000'
    );
    const poly = t.split('\u0000').map((x) => x.trim()).filter((x) => x.length > 1);
    return poly.length > 1 ? poly : null;
  }

  function splitJapanesePoliteBoundaries(s) {
    if (!s || countCjkChars(s) <= 4) return null;
    let t = s;
    t = t.replace(/(ませんでした)(?=[\u3040-\u30ff\u4e00-\u9fff])/g, '$1\u0000');
    t = t.replace(/(ました)(?=[\u3040-\u30ff\u4e00-\u9fff])/g, '$1\u0000');
    t = t.replace(/(ます)(?=[\u3040-\u30ff\u4e00-\u9fff])(?![かねよ])/g, '$1\u0000');
    const poly = t.split('\u0000').map((x) => x.trim()).filter((x) => x.length > 1);
    return poly.length > 1 ? poly : null;
  }

  function splitJapaneseAfterSuruOrKou(s) {
    if (!s || countCjkChars(s) <= 4) return null;
    const badFollow =
      'こと|もの|よう|ため|とき|ところ|のが|のは|ので|のに|から|まで|より|かどうか|ように|ような|ばかり|くらい|ほど|など|かも|だけ|しか|って|なら';
    const re = new RegExp(
      '(?<=(?:する|行う))(?=[\\u3040-\\u30ff\\u4e00-\\u9fff])(?!' + badFollow + ')',
      'g'
    );
    const parts = s.split(re).map((x) => x.trim()).filter((x) => x.length > 1);
    return parts.length > 1 ? parts : null;
  }

  function splitJapaneseAfterMorauBoundaries(s) {
    if (!s || !/もらう/.test(s) || countCjkChars(s) <= 4) return null;
    const nextClause =
      'おばあちゃん|おじいちゃん|お父さん|お母さん|お兄さん|お姉さん|学校|会社|コネクテッド|支払い|請求|メール|電話|プリント|クレジット|郵送|依頼|ウェブ|銀行|病院|先生|空港|市役所|区役所|税務|保育園|幼稚園|習い事|予約|申込|申し込み|振込|送金|返信|提出';
    const re = new RegExp('(?<=もらう)(?=' + nextClause + ')', 'g');
    const parts = s.split(re).map((x) => x.trim()).filter((x) => x.length > 1);
    return parts.length > 1 ? parts : null;
  }

  function splitLongJapaneseRunOn(s) {
    const cjk = countCjkChars(s);
    if (cjk <= 4) return [s];

    let bits = s.split(/(?:また|そして|それから|そのあと|その後|あとで|加えて|なお|ちなみに|および|並びに|次に)/);
    if (bits.length > 1) {
      const joined = bits
        .flatMap((b) => {
          b = b.trim();
          return b.length > 1 ? splitLongJapaneseRunOn(b) : [];
        })
        .filter(Boolean);
      return mergeTinyJapaneseSegments(joined.length > 0 ? joined : [s]);
    }

    bits = s.split(/[、，・｜|／/]+/).map((x) => x.trim()).filter((x) => x.length > 1);
    if (bits.length > 1) {
      const joined = bits.flatMap((b) => splitLongJapaneseRunOn(b));
      return mergeTinyJapaneseSegments(joined.length > 0 ? joined : [s]);
    }

    bits = s.split(/\u3000+/).map((x) => x.trim()).filter((x) => x.length > 1);
    if (bits.length > 1) {
      const joined = bits.flatMap((b) => splitLongJapaneseRunOn(b));
      return mergeTinyJapaneseSegments(joined.length > 0 ? joined : [s]);
    }

    const politeBits = splitJapanesePoliteBoundaries(s);
    if (politeBits) {
      const joined = politeBits.flatMap((b) => splitLongJapaneseRunOn(b));
      return mergeTinyJapaneseSegments(joined.length > 0 ? joined : [s]);
    }

    const obligationBits = splitJapaneseObligationBoundaries(s);
    if (obligationBits) {
      const joined = obligationBits.flatMap((b) => splitLongJapaneseRunOn(b));
      return mergeTinyJapaneseSegments(joined.length > 0 ? joined : [s]);
    }

    const morauBits = splitJapaneseAfterMorauBoundaries(s);
    if (morauBits) {
      const joined = morauBits.flatMap((b) => splitLongJapaneseRunOn(b));
      return mergeTinyJapaneseSegments(joined.length > 0 ? joined : [s]);
    }

    const suruBits = splitJapaneseAfterSuruOrKou(s);
    if (suruBits) {
      const joined = suruBits.flatMap((b) => splitLongJapaneseRunOn(b));
      return mergeTinyJapaneseSegments(joined.length > 0 ? joined : [s]);
    }

    const out = [];
    let buf = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === 'て' && buf.length >= 4 && i < s.length - 3) {
        const tailSlice = s.slice(i + 1);
        if (/につい$|におい$|ように$|くらい$|ばかり$/.test(buf)) {
          buf += ch;
          continue;
        }
        if (/^[\u3040-\u30ff\u4e00-\u9fff]{2,}/.test(tailSlice)) {
          const badFollow = /^(しま|おく|いる|いた|ください|みる|くる|あげ|もら|おる|くれ|はい|ある|いく|きる|あげる|もらう|いう|でき|すぎ|たい)/.test(
            tailSlice
          );
          if (!badFollow) {
            out.push((buf + 'て').trim());
            buf = '';
            continue;
          }
        }
      }
      buf += ch;
    }
    if (buf.trim()) out.push(buf.trim());
    if (out.length > 1) {
      const deeper = out.flatMap((b) => splitLongJapaneseRunOn(b));
      return mergeTinyJapaneseSegments(deeper.length > 0 ? deeper : out);
    }
    return mergeTinyJapaneseSegments(out.length ? out : [s]);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // (2) LANGUAGE-AGNOSTIC — phase-1 segmentation, CJK routing, subdivide
  // ═══════════════════════════════════════════════════════════════════════

  const LOCAL_CAT_KW = {
    Work: /meeting|email|report|client|project|deadline|invoice|proposal|presentation|call|boss|budget|strategy|slide|review|打ち合わせ|メール|報告|クライアント|プロジェクト|締め切り|請求|提案|プレゼン|上司|予算|ミーティング/i,
    Home: /groceri|supermarket|clean|trash|laundry|repair|fix|bill|rent|cook|dinner|plant|delivery|flat|apartment|mom|mum|dad|papa|mama|son|daughter|kids|child|children|husband|wife|partner|grandma|grandpa|granny|gramps|baby|mother|father|parent|sibling|brother|sister|family|買い物|スーパー|掃除|ゴミ|洗濯|修理|光熱費|家賃|料理|夕食|荷物|配達|お母さん|母|お父さん|父|子供|息子|娘|夫|妻|おばあちゃん|おじいちゃん|赤ちゃん|兄|弟|姉|妹|家族/i,
    Personal: /gym|run|jog|doctor|dentist|hospital|read|book|friend|travel|hobby|learn|meditation|yoga|haircut|ジム|ランニング|医者|歯医者|病院|読書|友達|旅行|趣味|勉強|瞑想|ヨガ/i,
  };
  const LOCAL_TIMING_KW = {
    Today: /\b(today|urgent|asap|now|immediately|tonight|今日|今すぐ|急ぎ|本日|今夜)\b/i,
    Later: /\b(someday|eventually|later|future|no rush|そのうち|いつか|後で|将来|急がない)\b/i,
  };
  const LOCAL_TIMING_URGENT_EN = /\b(have to|has to|must|need to|got to|gotta)\b/i;
  const LOCAL_TIMING_URGENT_JP =
    /(しないといけない|しなくてはいけない|なければならない|なきゃいけない|しなくちゃ|忘れないように|忘れないようにしないと|今すぐ|今日中|急いで)/;
  const PERSONAL_RECIPIENT_KW =
    /\b(mom|mum|mummy|dad|daddy|papa|mama|son|daughter|kids|child|children|husband|wife|partner|grandma|grandpa|granny|grandad|gramps|baby|mother|father|parents?|sibling|brother|sister|family|friend|お母さん|母|お父さん|父|子供|息子|娘|夫|妻|おばあちゃん|おじいちゃん|赤ちゃん|兄|弟|姉|妹|家族|友達)\b/i;
  const EMAIL_KW = /\b(email|emails?|mail|メール)\b/i;

  function localDetectCat(text) {
    if (EMAIL_KW.test(text) && PERSONAL_RECIPIENT_KW.test(text)) return 'Home';
    for (const [c, r] of Object.entries(LOCAL_CAT_KW)) if (r.test(text)) return c;
    return 'Other';
  }

  function localDetectTiming(text, def) {
    if (LOCAL_TIMING_KW.Today.test(text)) return 'Today';
    if (LOCAL_TIMING_URGENT_EN.test(text)) return 'Today';
    if (LOCAL_TIMING_URGENT_JP.test(text)) return 'Today';
    if (LOCAL_TIMING_KW.Later.test(text)) return 'Later';
    return def || 'This Week';
  }

  function cleanTimingPhrases(t) {
    return t
      .replace(/\b(today|tonight|this week|later|someday|eventually|asap|now|immediately)\b/gi, '')
      .replace(/今日|今週|そのうち|急ぎ|いつか|後で/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Sentence endings + list punctuation → line / clause segments (any language). */
  function phase1SplitClauses(t0) {
    return t0
      .replace(/[。.!?！？]/g, '$&\n')
      .split(/\n+/)
      .map((seg) => seg.trim())
      .filter((seg) => seg.length > 0)
      .flatMap((seg) => seg.split(/\r?\n+/))
      .flatMap((seg) =>
        seg.split(/(?:,\s*and\s+|\s+and\s+|\s+then\s+|\s+also\s+|[、，・｜|／/;；]\s*|,\s+)/i)
      )
      .flatMap((seg) =>
        seg.split(/\s+(?=(?:need to|have to|has to|must|got to|gotta|going to|will)\s+)/i)
      )
      .map((s) => s.replace(/^(and|also|then|next|そして|それから|あと|また|さらに|次に)\s+/i, '').trim())
      .filter((s) => s.length > 1);
  }

  /** Route segment to locale-specific run-on splitter (extend for zh, ko, …). */
  function splitRunOnByScript(p) {
    const ck = countCjkChars(p);
    if (ck > 4) return splitLongJapaneseRunOn(p);
    if (ck < 4 && (p.length > 56 || (!/\s/.test(p) && p.length > 18))) return splitLongEnglishRunOn(p);
    return [p];
  }

  function localClassify(transcript, defaultTiming) {
    const t0 = (transcript || '').trim().replace(/\r\n/g, '\n');
    if (!t0) return [];

    const phase1 = phase1SplitClauses(t0);
    const base = phase1.length ? phase1 : [t0];
    const parts = base.flatMap((p) => splitRunOnByScript(p));

    if (parts.length === 0) {
      const cleaned = cleanTimingPhrases(transcript);
      if (!cleaned) return [];
      return [
        {
          text: cleaned,
          timing: localDetectTiming(transcript, defaultTiming),
          category: localDetectCat(transcript),
        },
      ];
    }

    return parts
      .map((p) => ({
        text: cleanTimingPhrases(p) || p.trim(),
        timing: localDetectTiming(p, defaultTiming),
        category: localDetectCat(p),
      }))
      .filter((t) => t.text.length > 0);
  }

  function subdivideTaskObjects(tasks, defaultTiming) {
    return tasks.flatMap((t) => {
      const u = (t.text != null ? String(t.text) : '').trim();
      if (!u) return [];
      const baseTiming = t.timing || defaultTiming;
      const baseCategory = t.category || 'Other';
      const localParts = localClassify(u, baseTiming);
      if (!localParts || localParts.length === 0) return [t];
      return localParts.map((p) => ({
        text: p.text,
        timing: p.timing || baseTiming,
        category: p.category || baseCategory,
      }));
    });
  }

  function preferRicherLocalSplit(transcript, tasks, defaultTiming) {
    const tr = (transcript || '').trim();
    if (!tr) return tasks || [];
    const loc = localClassify(tr, defaultTiming);
    if (!tasks || tasks.length === 0) return loc;
    if (loc.length > tasks.length) return loc;
    return tasks;
  }

  function assignByKeywordPriority(tasks, state) {
    if (!Array.isArray(tasks) || !tasks.length) return tasks || [];
    const escapeRx = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasAnyUserKeywords = (cat) =>
      ((cat.customKeywords || []).length + (cat.keywords || []).length) > 0;
    const byUserKeywords = (text) => {
      const t = String(text || '');
      for (const cat of state.categories) {
        if (cat.id === 'other') continue;
        const userWords = [...(cat.customKeywords || []), ...(cat.keywords || [])]
          .filter(Boolean)
          .filter((v, i, arr) => arr.indexOf(v) === i);
        if (userWords.some((kw) => new RegExp(escapeRx(kw), 'i').test(t))) return cat.en;
      }
      return null;
    };
    const byCategoryTitle = (text) => {
      const t = String(text || '').toLowerCase();
      for (const cat of state.categories) {
        if (cat.id === 'other') continue;
        const titleTokens = [cat.en, cat.ja]
          .filter(Boolean)
          .flatMap((v) => String(v).split(/[\s・／/|,，、]+/))
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length >= 2);
        if (titleTokens.some((tok) => t.includes(tok))) return cat.en;
      }
      return null;
    };
    return tasks.map((task) => {
      const txt = task?.text || '';
      const kwCat = byUserKeywords(txt);
      if (kwCat) return { ...task, category: kwCat };
      const titleCat = byCategoryTitle(txt);
      if (titleCat) {
        const current = state.categories.find((c) => c.en === task?.category);
        if (!task?.category || task.category === 'Other' || !current || !hasAnyUserKeywords(current)) {
          return { ...task, category: titleCat };
        }
      }
      return task;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // (1) ORCHESTRATION — Worker / OpenAI + local fallback + richer-split guard
  // ═══════════════════════════════════════════════════════════════════════

  async function classifyTranscript(transcript) {
    const state = requireState();
    if (!state) return [];

    const categories = state.categories.map((c) => c.en);
    const defaultTiming = state.defaultTiming || 'This Week';
    const tr = (transcript || '').trim();
    if (!tr) return [];

    const categoryKeywords = {};
    state.categories.forEach((c) => {
      const kws = [...(c.customKeywords || []), ...(c.keywords || [])]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i);
      if (kws.length) categoryKeywords[c.en] = kws;
    });

    const localTasks = () => localClassify(tr, defaultTiming);

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: tr,
          categories,
          categoryKeywords,
          defaultTiming,
          lang: state.lang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tasks && data.tasks.length > 0) {
          let tasks = data.tasks
            .map((x) => ({
              text: (x.text != null ? String(x.text) : '').trim(),
              timing: x.timing || defaultTiming,
              category: x.category || 'Other',
            }))
            .filter((x) => x.text.length > 0);
          if (tasks.length > 0) {
            tasks = subdivideTaskObjects(tasks, defaultTiming);
            return assignByKeywordPriority(tasks, state);
          }
        }
      }
    } catch (e) {
      console.warn('API classify failed, using local:', e);
    }

    return assignByKeywordPriority(preferRicherLocalSplit(tr, localTasks(), defaultTiming), state);
  }

  // ── Public API ─────────────────────────────────────────────────────────
  const api = {
    attach(getState) {
      _getState = getState;
    },
    countCjkChars,
    localClassify,
    subdivideTaskObjects,
    preferRicherLocalSplit,
    classifyTranscript,
    localDetectCat,
    localDetectTiming,
    /** Default Work/Home/Personal regex map — used by index `rebuildDetectRegex` */
    BUILTIN_LOCAL_CAT_KW: LOCAL_CAT_KW,
    /** Reserved: add splitLongZhRunOn etc. and extend splitRunOnByScript */
    splitRunOnByScript,
  };

  global.PoplistTaskClassify = api;
  global.classifyTranscript = (t) => api.classifyTranscript(t);
  global.localClassify = (a, b) => api.localClassify(a, b);
  global.subdivideTaskObjects = (a, b) => api.subdivideTaskObjects(a, b);
})(typeof window !== 'undefined' ? window : globalThis);
