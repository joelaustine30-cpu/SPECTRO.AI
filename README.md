# SPECTRO.AI

STAR-X is a lightweight chat interface for a personal AI assistant.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy the environment example file and add your OpenAI key:

```bash
cp .env.example .env
```

Then edit `.env` and replace `your_api_key_here` with your actual OpenAI API key.

3. Start the app:

```bash
npm start
```

4. Open:

```text
http://localhost:3000
```

The page will send messages to `/api/chat` and display the AI response.

## Important

- Keep API keys in the backend environment only.
- Do not place secrets in browser code or commit your `.env` file.
- The `.env` file is already ignored by Git via `.gitignore`.

## Frontend behavior

The page sets:

```html
<script>
  window.SPECTRO_CONFIG = { apiEndpoint: '/api/chat' };
</script>
```

That allows `Script.js` to talk to the backend endpoint from the same origin.

## Deploying

If you deploy to a host, point the `apiEndpoint` to your deployed API route or use a serverless function that exposes the same JSON contract:

```json
{ "message": "hello" }
```

and responds with:

```json
{ "reply": "Hello!" }
```
