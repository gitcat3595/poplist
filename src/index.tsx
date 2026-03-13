import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

/* ──────────────────────────────────────────
   POST /api/classify
   Body: { transcript: string, categories: string[], defaultTiming: string }
   Returns: { tasks: Array<{ text, timing, category }> }
   The OpenAI API key never reaches the browser — only lives in Cloudflare secrets.
────────────────────────────────────────── */
app.post('/api/classify', async (c) => {
  const { transcript, categories, defaultTiming } = await c.req.json()

  if (!transcript || transcript.trim().length === 0) {
    return c.json({ tasks: [] })
  }

  const catList = (categories && categories.length > 0)
    ? categories.join(', ')
    : 'Work, Home, Personal, Other'

  const prompt = `You are a task classifier for a to-do app.
The user spoke the following out loud: "${transcript}"

Split this into individual tasks. For each task:
1. "text": clean task description (remove timing words like "today", "this week", etc.)
2. "timing": one of "Today", "This Week", or "Later" — infer from context. Default to "${defaultTiming || 'This Week'}" if unclear.
3. "category": one of [${catList}] — infer from context. Use "Other" if unclear.

Return ONLY a valid JSON array, no markdown, no explanation:
[{"text":"...","timing":"...","category":"..."}]`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`
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
      return c.json({ error: 'OpenAI API error', tasks: [] }, 500)
    }

    const data = await response.json() as any
    const content = data.choices?.[0]?.message?.content?.trim() || '[]'

    // Strip markdown code fences if GPT wraps in ```json ... ```
    const clean = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const tasks = JSON.parse(clean)
    return c.json({ tasks })

  } catch (e) {
    console.error('classify error:', e)
    return c.json({ error: 'Failed to classify', tasks: [] }, 500)
  }
})

export default app
