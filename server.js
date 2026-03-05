require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// System prompts live server-side only — never sent to the browser
const PROMPTS = {
    en: `You are a task extraction assistant.
Extract actionable tasks from the user's speech and return them as JSON.

Return only this JSON format:
{
  "tasks": [
    {
      "text": "Task description",
      "category": "work" or "home" or "personal" or "other"
    }
  ]
}

Category rules:
- work: job-related (meetings, emails, reports, deadlines)
- home: household (shopping, cleaning, errands, repairs)
- personal: self (gym, health, hobbies, learning)
- other: anything else

Return only valid JSON, no other text.`,

    ja: `あなたはタスク抽出アシスタントです。ユーザーの音声からアクションタスクを抽出し、JSONとして返してください。

以下のJSON形式のみで返してください：
{
  "tasks": [
    {
      "text": "タスクの説明",
      "category": "work" または "home" または "personal" または "other"
    }
  ]
}

カテゴリールール：
- work: 仕事関連（会議、メール、レポート、締め切り）
- home: 家庭関連（買い物、掃除、用事、修理）
- personal: 個人関連（ジム、健康、趣味、学習）
- other: その他すべて

有効なJSONのみを返してください。他のテキストは不要です。`,

    fr: `Vous êtes un assistant d'extraction de tâches.
Extrayez les tâches actionnables du discours de l'utilisateur et renvoyez-les en JSON.

Renvoyez uniquement ce format JSON :
{
  "tasks": [
    {
      "text": "Description de la tâche",
      "category": "work" ou "home" ou "personal" ou "other"
    }
  ]
}

Règles de catégorie :
- work : lié au travail (réunions, emails, rapports, délais)
- home : ménage (courses, nettoyage, errands, réparations)
- personal : personnel (gym, santé, loisirs, apprentissage)
- other : tout le reste

Renvoyez uniquement du JSON valide, sans autre texte.`,

    zh: `您是一个任务提取助手。
从用户的语音中提取可操作的任务，并以JSON格式返回。

仅返回以下JSON格式：
{
  "tasks": [
    {
      "text": "任务描述",
      "category": "work" 或 "home" 或 "personal" 或 "other"
    }
  ]
}

分类规则：
- work：工作相关（会议、邮件、报告、截止日期）
- home：家庭相关（购物、清洁、跑腿、维修）
- personal：个人相关（健身、健康、爱好、学习）
- other：其他任何事情

仅返回有效的JSON，不要包含其他文本。`
};

app.post('/api/extract-tasks', async (req, res) => {
    const { text, lang = 'en' } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'No text provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY not set in .env' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: PROMPTS[lang] || PROMPTS.en },
                    { role: 'user', content: text }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err.error?.message || 'OpenAI error' });
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

        res.json(result);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Poplist running at http://localhost:${PORT}`);
});
