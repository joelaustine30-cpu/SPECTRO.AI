const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const openaiApiKey = process.env.OPENAI_API_KEY;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!openaiApiKey) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY is not set. Add it to your .env file before starting the server.'
      });
    }

    const client = new OpenAI({ apiKey: openaiApiKey });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are STAR-X, a helpful AI assistant.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: 'The model returned an empty response.' });
    }

    return res.json({ reply });
  } catch (error) {
    console.error('Chat request failed:', error);
    return res.status(500).json({
      error: 'Failed to contact the AI provider. Please try again later.'
    });
  }
});

app.listen(port, () => {
  console.log(`STAR-X is running on http://localhost:${port}`);
});
