# SPECTRO.AI

STAR-X is a lightweight chat interface and Node.js backend for an AI assistant.

## Run locally

Requirements: Node.js 18 or newer and an OpenAI API key.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` to your own key.
3. Start the server: `npm start`
4. Open <http://localhost:3000>.

The backend serves the page and provides `POST /api/chat`; the frontend never receives the provider key. Set `OPENAI_MODEL` optionally to select a model available to your API account. `/health` is a health-check endpoint.

Run the automated backend checks with `npm test`.

## Deploy to Vercel

The root `index.html` is the static entry page. The `api/[...path].js` function routes `/api/*` requests through the same Express app used locally, including `POST /api/chat`.

1. Import this repository into Vercel and deploy it.
2. In the Vercel project settings, add `OPENAI_API_KEY` as an environment variable for the deployment environments you use. Optionally add `OPENAI_MODEL`.
3. Redeploy after adding or changing environment variables, then open the deployment URL shown by Vercel.

Do not commit a real API key. If the Vercel URL itself says the site cannot be reached, confirm that a deployment succeeded and that the configured domain is assigned to this Vercel project; repository code cannot repair an unassigned domain or DNS configuration.

## Deploy to Fly.io

The repository includes a Dockerfile and `fly.toml` for deploying the web app and API together. You need a Fly.io account, `flyctl`, and an OpenAI API key.

1. Install `flyctl` and sign in with `fly auth login`.
2. Review `fly.toml`. Its default app name is `spectro-ai-joelaustine30-cpu`; if Fly reports that name is unavailable, change the `app` value to a globally unique name.
3. From the repository directory, create the Fly app using the configuration: `fly launch --no-deploy`.
4. Set the API key as a Fly secret (replace the placeholder locally; never commit the real key): `fly secrets set OPENAI_API_KEY=your_api_key_here`.
5. Deploy: `fly deploy`.
6. Open the deployed app: `fly open`; check health with `fly checks list` or visit `/health`.

The app listens on port 8080 in Fly's container. The configured health check uses `/health`. Machines are configured to stop when idle and start on incoming requests; the first request after idle may take longer.

## Configuration and security

- Never put an API key in HTML/JavaScript or commit `.env`; `.gitignore` excludes it, and `.dockerignore` excludes it from container builds.
- The backend validates message/history input, limits request size, and applies a basic per-process rate limit.
- The in-memory rate limiter is intended for a single server instance. For a public multi-instance deployment, use a shared rate-limit store and configure provider spending limits/authentication.
- Conversation history is held in browser memory only and is cleared by the Clear button or when the page is reloaded.

## Other deployment options

Deploy the Node.js app to any host that supports long-running Node servers. Configure `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) as the host's environment variables, then run `npm start`. Set the host's port as `PORT` if it does not provide one automatically.
