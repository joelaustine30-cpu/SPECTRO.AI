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

## Deploy to Fly.io

The repository includes a Dockerfile and `fly.toml` for deploying the web app and API together. You need a Fly.io account, `flyctl`, and an OpenAI API key.

1. Install `flyctl` and sign in with `fly auth login`.
2. Review `fly.toml`. Its default app name is `spectro-ai-joelaustine30-cpu`; if Fly reports that name is unavailable, change the `app` value to a globally unique name.
3. From the repository directory, create the Fly app using the configuration: `fly launch --no-deploy`.
4. Set the API key as a Fly secret (replace the placeholder locally; never commit the real key): `fly secrets set OPENAI_API_KEY=your_api_key_here`.
5. Deploy: `fly deploy`.
6. Open the deployed app: `fly open`; check health with `fly checks list` or visit `/health`.

The app listens on port 8080 in Fly's container. The configured health check uses `/health`. The machines are configured to stop when idle and start on incoming requests; the first request after idle may take longer. Fly.io may charge for app resources and AI-provider usage; check current pricing and set provider spending limits before public use.

## Configuration and security

- Never put an API key in HTML/JavaScript or commit `.env`; `.gitignore` excludes it, and `.dockerignore` excludes it from container builds.
- The backend validates message/history input, limits request size, and applies a basic per-process rate limit.
- The in-memory rate limiter is intended for a single server instance. For a public multi-instance deployment, use a shared rate-limit store and configure provider spending limits/authentication.
- Conversation history is held in browser memory only and is cleared by the Clear button or when the page is reloaded.

## Other deployment options

Deploy the Node.js app to any host that supports long-running Node servers. Configure `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) as the host's environment variables, then run `npm start`. Static-only hosting such as GitHub Pages cannot run this backend; deploy the backend separately and configure the frontend's `apiEndpoint` to its HTTPS URL. If the frontend and API use different origins, configure narrowly scoped CORS on the backend rather than allowing every origin.
