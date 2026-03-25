import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  OPENAI_API_KEY: string
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
1. Split this into INDIVIDUAL actionable tasks (one task per item).
2. For each task output:
   - "text": clean concise task in the SAME LANGUAGE as the input. Remove timing words like "today","this week","今日","今週".
   - "timing": exactly one of "Today", "This Week", "Later" — always English.
     • Today = urgent, due today, ASAP
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

export default app
