# SPECTRO.AI

STAR-X is a lightweight chat interface and Node.js backend for an AI assistant.

## Run locally

Requirements: Node.js 18 or newer and an OpenAI API key.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` to your own key.
3. Start the server: `npm start`
4. Open <http://localhost:3000>.

The backend serves the page and provides `POST /api/chat`; the frontend never receives the provider key. Set `OPENAI_MODEL` optionally to select a model available to your API account. `/health` is available for service health checks.

Run the automated backend checks with `npm test`.

## Configuration and security

- Never put an API key in HTML/JavaScript or commit `.env`; `.gitignore` excludes it.
- The backend validates message/history input, limits request size, and applies a basic per-process rate limit.
- The in-memory rate limiter is intended for a single server instance. For a public multi-instance deployment, use a shared rate-limit store and configure provider spending limits/authentication.
- Conversation history is held in browser memory only and is cleared by the Clear button or when the page is reloaded.

## Deployment

Deploy the Node.js app to a host that supports long-running Node servers. Configure `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) as the host's environment variables, then run `npm start`. Static-only hosting such as GitHub Pages cannot run this backend; deploy the backend separately and configure the frontend's `apiEndpoint` to its HTTPS URL. If the frontend and API use different origins, configure narrowly scoped CORS on the backend rather than allowing every origin.
