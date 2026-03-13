import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

/* ──────────────────────────────────────────
   POST /api/classify
   Body: { transcript: string, categories: string[], defaultTiming: string, lang: string }
   Headers: X-OpenAI-Key (optional — client-provided key from localStorage)
   Returns: { tasks: Array<{ text, timing, category }> }
────────────────────────────────────────── */
app.post('/api/classify', async (c) => {
  const { transcript, categories, defaultTiming, lang } = await c.req.json()

  if (!transcript || transcript.trim().length === 0) {
    return c.json({ tasks: [] })
  }

  // API key: server env var takes priority; fallback to client-provided header
  const envKey    = c.env?.OPENAI_API_KEY || ''
  const clientKey = c.req.header('X-OpenAI-Key') || ''
  const apiKey    = (envKey && !envKey.includes('your_') && !envKey.includes('here')) ? envKey : clientKey

  if (!apiKey || apiKey.length < 20) {
    // No valid key — return empty so client falls back to local classifier
    return c.json({ tasks: [] }, 200)
  }

  const catList = (categories && categories.length > 0)
    ? categories.join(', ')
    : 'Work, Home, Personal, Other'

  const prompt = `You are a smart task extractor for a personal to-do app called Poplist.
The user spoke or typed the following: "${transcript}"

Your job:
1. Split this into INDIVIDUAL actionable tasks (one task per item, even if the user listed several in one sentence).
2. For each task, output:
   - "text": a clean, concise task description in the SAME LANGUAGE as the input. Remove words that only indicate timing (e.g. "today", "this week", "later", "soon", "eventually", "今日", "今週"). Keep the core action.
   - "timing": exactly one of "Today", "This Week", or "Later" — always in English regardless of input language.
     • "Today" = urgent, due today, ASAP
     • "This Week" = within the week, soon, default if unclear
     • "Later" = someday, eventually, no rush
     Default: "${defaultTiming || 'This Week'}"
   - "category": exactly one of [${catList}] — always in English regardless of input language.
     • Work = job, meetings, emails, clients, reports, office, projects, 仕事, ミーティング, メール
     • Home = cleaning, groceries, errands, repairs, cooking, household, 家事, 掃除, 買い物
     • Personal = self-care, exercise, health, hobbies, learning, family, friends, 運動, 健康, 趣味
     • Other = anything else

Examples:
Input: "send the proposal to the client today and buy groceries this week and also go for a run"
Output: [{"text":"Send proposal to client","timing":"Today","category":"Work"},{"text":"Buy groceries","timing":"This Week","category":"Home"},{"text":"Go for a run","timing":"This Week","category":"Personal"}]

Input (Japanese): "今日クライアントにメールして、今週中に部屋を掃除する"
Output: [{"text":"クライアントにメールする","timing":"Today","category":"Work"},{"text":"部屋を掃除する","timing":"This Week","category":"Home"}]

Return ONLY a valid JSON array. No markdown, no explanation, no extra text.`

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
      const err = await response.text()
      console.error('OpenAI error:', err)
      return c.json({ tasks: [] }, 200)   // Return empty → client uses local fallback
    }

    const data = await response.json() as any
    const content = data.choices?.[0]?.message?.content?.trim() || '[]'

    // Strip markdown code fences if GPT wraps in ```json ... ```
    const clean = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const tasks = JSON.parse(clean)
    return c.json({ tasks })

  } catch (e) {
    console.error('classify error:', e)
    return c.json({ tasks: [] }, 200)   // Return empty → client uses local fallback
  }
})

export default app
