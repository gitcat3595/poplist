import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  OPENAI_API_KEY: string
  /** Resend API key — https://resend.com (required for waitlist emails) */
  RESEND_API_KEY?: string
  /** Inbox that receives new waitlist signups (default: hello@poplist.site) */
  WAITLIST_TO?: string
  /** Verified sender, e.g. Poplist <notify@yourdomain.com> or Resend onboarding@resend.dev for testing */
  RESEND_FROM?: string
  /** If "true", send a short confirmation to the subscriber as well */
  WAITLIST_SEND_CONFIRM?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

/* ──────────────────────────────────────────
   POST /api/classify
   Body: { transcript, categories, categoryKeywords, defaultTiming, lang }
   Returns: { tasks: Array<{ text, timing, category }> }
   API key lives in Cloudflare secrets — never exposed to the browser.
   If key is missing/invalid, returns {tasks:[]} and the browser
   falls back to its built-in local keyword classifier automatically.
────────────────────────────────────────── */
app.post('/api/classify', async (c) => {
  const { transcript, categories, categoryKeywords, defaultTiming, lang } = await c.req.json()

  if (!transcript || transcript.trim().length === 0) {
    return c.json({ tasks: [] })
  }

  const apiKey = c.env?.OPENAI_API_KEY || ''

  // No key configured → client will use local fallback classifier
  if (!apiKey || apiKey.length < 20) {
    return c.json({ tasks: [] })
  }

  const catList = (categories && categories.length > 0)
    ? categories.join(', ')
    : 'Work, Home, Personal, Other'

  // Build extra keyword hints from user-defined category keywords
  let kwHints = ''
  if (categoryKeywords && typeof categoryKeywords === 'object') {
    const hints = Object.entries(categoryKeywords as Record<string, string[]>)
      .filter(([_, kws]) => kws.length > 0)
      .map(([cat, kws]) => `• ${cat}: ${kws.join(', ')}`)
      .join('\n')
    if (hints) kwHints = `\nUser-defined category keywords (use these to improve classification):\n${hints}\n`
  }

  const prompt = `You are a smart task extractor for a personal to-do app called Poplist.
The user spoke or typed the following: "${transcript}"

Your job:
1. Split this into INDIVIDUAL actionable tasks (one task per item). Never return one giant task when the user listed several things.
   Input may have NO spaces, NO commas (、), NO periods (。), and NO English punctuation — infer boundaries from meaning and grammar anyway.
   Japanese: infer boundaries from meaning — do not rely only on て, で, or それから; many inputs have none of these (e.g. …ます…ます, …する…する, or topic shifts with no connector). Chains with て/で (e.g. 銀行に行って買い物して) are one cue among many; still output one JSON object per distinct action.
   English: infer separate tasks from conjunctions or topic shifts even when the user never typed spaces or commas.
2. For each task output:
   - "text": clean concise task in the SAME LANGUAGE as the input. Remove timing words like "today","this week","今日","今週".
   - "timing": exactly one of "Today", "This Week", "Later" — always English.
     • Today = urgent, due today, ASAP; English: must / have to / need to / got to / going to (when it marks an imminent obligation); Japanese: しないといけない, なければならない, しなくちゃ, 忘れないように（しないと）, 今すぐ, 今日中, etc.
     • This Week = within the week, soon
     • Later = someday, no rush
     Default: "${defaultTiming || 'This Week'}"
   - "category": exactly one of [${catList}] — always English.
     • Work = job, meetings, emails, clients, reports, 仕事, ミーティング, メール
     • Home = cleaning, groceries, errands, repairs, cooking, 家事, 掃除, 買い物
     • Personal = self-care, exercise, health, hobbies, family, 運動, 健康, 趣味
     • Other = anything else
${kwHints}
Examples:
Input: "send the proposal today and buy groceries this week and go for a run"
Output: [{"text":"Send proposal to client","timing":"Today","category":"Work"},{"text":"Buy groceries","timing":"This Week","category":"Home"},{"text":"Go for a run","timing":"This Week","category":"Personal"}]

Input (Japanese): "今日クライアントにメールして、今週中に部屋を掃除する"
Output: [{"text":"クライアントにメールする","timing":"Today","category":"Work"},{"text":"部屋を掃除する","timing":"This Week","category":"Home"}]

Input (Japanese, no commas): "銀行に行って買い物してレポートを書く"
Output: [{"text":"銀行に行く","timing":"This Week","category":"Personal"},{"text":"買い物する","timing":"This Week","category":"Home"},{"text":"レポートを書く","timing":"This Week","category":"Work"}]

Input (Japanese, no punctuation or spaces): "資料をまとめますクライアントにメールします会議の準備をします"
Output: [{"text":"資料をまとめる","timing":"This Week","category":"Work"},{"text":"クライアントにメールする","timing":"This Week","category":"Work"},{"text":"会議の準備をする","timing":"This Week","category":"Work"}]

Input (Japanese, no て/connector — still multiple tasks): "レポートを提出する請求書を確認する"
Output: [{"text":"レポートを提出する","timing":"This Week","category":"Work"},{"text":"請求書を確認する","timing":"This Week","category":"Work"}]

Input (Japanese, obligation phrasing): "請求書を確認しないといけないレポートも提出しなくちゃ"
Output: [{"text":"請求書を確認する","timing":"Today","category":"Work"},{"text":"レポートも提出する","timing":"Today","category":"Work"}]

Input (English, modals): "buy milk need to call the client must send the invoice"
Output: [{"text":"Buy milk","timing":"This Week","category":"Home"},{"text":"Call the client","timing":"Today","category":"Work"},{"text":"Send the invoice","timing":"Today","category":"Work"}]

Input (English, no punctuation): "callmomemailclientbuygroceries"
Output: [{"text":"Call mom","timing":"This Week","category":"Home"},{"text":"Email client","timing":"This Week","category":"Work"},{"text":"Buy groceries","timing":"This Week","category":"Home"}]

Return ONLY a valid JSON array. No markdown, no explanation.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      console.error('OpenAI error:', await response.text())
      return c.json({ tasks: [] })
    }

    const data = await response.json() as any
    const content = data.choices?.[0]?.message?.content?.trim() || '[]'
    const clean = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const tasks = JSON.parse(clean)
    return c.json({ tasks })

  } catch (e) {
    console.error('classify error:', e)
    return c.json({ tasks: [] })
  }
})

/* ──────────────────────────────────────────
   POST /api/translate
   Body: { texts: string[], targetLang: 'en' | 'ja' }
   Returns: { texts: string[] }
   Translates task text items via GPT-4o-mini.
   Falls back to { texts: [] } if no API key.
────────────────────────────────────────── */
app.post('/api/translate', async (c) => {
  const { texts, targetLang } = await c.req.json()

  if (!texts || !texts.length) return c.json({ texts: [] })

  const apiKey = c.env?.OPENAI_API_KEY || ''
  if (!apiKey || apiKey.length < 20) return c.json({ texts: [] })

  const langName = targetLang === 'ja' ? 'Japanese' : 'English'
  const prompt = `Translate these short task items to ${langName}. Keep them concise and natural. Preserve the meaning exactly.
Input JSON array: ${JSON.stringify(texts)}
Output: Return ONLY a valid JSON array of translated strings, same order, same count. No markdown, no explanation.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      console.error('OpenAI translate error:', await response.text())
      return c.json({ texts: [] })
    }

    const data = await response.json() as any
    const content = data.choices?.[0]?.message?.content?.trim() || '[]'
    const clean = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return c.json({ texts: JSON.parse(clean) })

  } catch (e) {
    console.error('translate error:', e)
    return c.json({ texts: [] })
  }
})

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ──────────────────────────────────────────
   POST /api/waitlist
   Body: notify.html payload (name, email, country, message, plan, lang, …)
   Sends admin notification via Resend. Set secrets in Cloudflare Pages:
   RESEND_API_KEY, RESEND_FROM, optional WAITLIST_TO, WAITLIST_SEND_CONFIRM=true
────────────────────────────────────────── */
app.post('/api/waitlist', async (c) => {
  const key = c.env?.RESEND_API_KEY || ''

  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ ok: false, error: 'invalid_json' }, 400)
  }

  const name = String(body.name || '').trim().slice(0, 200)
  const email = String(body.email || '').trim().toLowerCase().slice(0, 320)
  const country = String(body.country || '').trim().slice(0, 32)
  const message = String(body.message || '').trim().slice(0, 5000)
  const plan = String(body.plan || 'early_launch').slice(0, 64)
  const lang = body.lang === 'ja' ? 'ja' : 'en'
  const source = String(body.source || 'notify_page').slice(0, 64)
  const userAgent = String(body.userAgent || '').slice(0, 500)

  if (!name || !EMAIL_RE.test(email) || !country) {
    return c.json({ ok: false, error: 'validation' }, 400)
  }

  const to = (c.env?.WAITLIST_TO || 'hello@poplist.site').trim()
  const from =
    (c.env?.RESEND_FROM || 'Poplist <onboarding@resend.dev>').trim()
  const sendConfirm = String(c.env?.WAITLIST_SEND_CONFIRM || '').toLowerCase() === 'true'

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Country', country],
    ['Plan tag', plan],
    ['Lang', lang],
    ['Source', source],
    ['Message', message || '—'],
    ['User-Agent', userAgent || '—'],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`)
    .join('')

  const adminHtml = `<p>New PRO / early-launch waitlist signup.</p>
<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">${rows}</table>`

  const adminSubject = `[Poplist waitlist] ${name} — ${country}`

  try {
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: adminSubject,
        html: adminHtml,
        reply_to: email,
      }),
    })

    if (!adminRes.ok) {
      const errText = await adminRes.text()
      console.error('Resend admin notify failed:', adminRes.status, errText)
      return c.json({ ok: false, error: 'mail_send_failed' }, 502)
    }

    if (sendConfirm && EMAIL_RE.test(email)) {
      const isJa = lang === 'ja'
      const subj = isJa
        ? 'Poplist — 登録ありがとうございます'
        : "Poplist — You're on the list"
      const html = isJa
        ? `<p>${escapeHtml(name)} 様</p><p>PRO先行ローンチのお知らせをお送りする準備ができ次第、ご連絡します。</p><p>— Poplist</p>`
        : `<p>Hi ${escapeHtml(name)},</p><p>Thanks for joining the waitlist. We'll email you when early access to PRO opens.</p><p>— Poplist</p>`
      const confRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: subj,
          html,
        }),
      })
      if (!confRes.ok) {
        console.warn('Resend confirm email failed:', await confRes.text())
      }
    }

    return c.json({ ok: true })
  } catch (e) {
    console.error('waitlist error:', e)
    return c.json({ ok: false, error: 'server' }, 500)
  }
})

export default app
