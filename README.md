# SPECTRO.AI

STAR-X is a lightweight, static chat interface built with HTML, CSS, and vanilla JavaScript.

## Run locally

Open `index.html` in a browser, or serve this directory with any static web server. The page works in demo mode without dependencies: it displays your messages and returns a clearly labeled local demo response.

## Connect an AI service

The repository does not include an AI backend or API credentials. To enable generated answers, provide a server-side endpoint that accepts a JSON `POST` body of `{ "message": "..." }` and returns JSON of `{ "reply": "..." }`. The endpoint should handle authentication, provider API keys, rate limiting, and input validation on the server. **Do not place secret API keys in this repository or browser code.**

Before `Script.js` loads, configure the endpoint in the page:

```html
<script>
  window.SPECTRO_CONFIG = { apiEndpoint: "/api/chat" };
</script>
<script src="Script.js" defer></script>
```

The frontend sends the user's message to that endpoint. If no endpoint is configured, it remains in demo mode. A configured endpoint must be reachable from the page and allow requests from its origin.

## Deploy

The lowercase `index.html` is the entry point expected by static hosting providers such as GitHub Pages. `INDEX.HTML` is retained as a compatibility copy for existing links.
