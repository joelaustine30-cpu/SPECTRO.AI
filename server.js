const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_HISTORY_MESSAGES = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 20;

function createApp({ apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL || 'gpt-4o-mini' } = {}) {
  const app = express();
  const rateLimits = new Map();

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY'
    });
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.use(express.static(__dirname, { dotfiles: 'ignore', index: 'index.html' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/chat', async (req, res) => {
    const now = Date.now();
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const previous = rateLimits.get(clientIp);
    const current = !previous || now - previous.start >= RATE_LIMIT_WINDOW_MS
      ? { start: now, count: 0 }
      : previous;

    if (current.count >= RATE_LIMIT_REQUESTS) {
      res.set('Retry-After', String(Math.ceil((RATE_LIMIT_WINDOW_MS - (now - current.start)) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    }
    current.count += 1;
    rateLimits.set(clientIp, current);

    const { message, history = [] } = req.body || {};
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message must be a non-empty string.' });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` });
    }
    if (!Array.isArray(history) || history.length > MAX_HISTORY_MESSAGES) {
      return res.status(400).json({ error: `History must be an array of at most ${MAX_HISTORY_MESSAGES} messages.` });
    }

    const cleanHistory = [];
    for (const item of history) {
      if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || !item.content.trim()) {
        return res.status(400).json({ error: 'Each history item must have a user or assistant role and non-empty string content.' });
      }
      cleanHistory.push({ role: item.role, content: item.content.slice(0, MAX_MESSAGE_LENGTH) });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'AI service is not configured. Set OPENAI_API_KEY on the server.' });
    }

    try {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are STAR-X, a helpful, clear, and safe AI assistant.' },
          ...cleanHistory,
          { role: 'user', content: message.trim() }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const reply = completion.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        return res.status(502).json({ error: 'The AI provider returned an empty response. Please try again.' });
      }
      return res.json({ reply });
    } catch (error) {
      console.error('Chat request failed:', error.message);
      return res.status(502).json({ error: 'The AI service could not complete your request. Please try again later.' });
    }
  });

  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request is too large.' });
    }
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    console.error('Request failed:', error.message);
    return res.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`STAR-X is running on http://localhost:${port}`);
  });
}

module.exports = { createApp };
