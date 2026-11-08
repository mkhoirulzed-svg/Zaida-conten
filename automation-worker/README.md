# ZAIDA Content Automation Worker

Private Node.js service that runs a bounded browser smoke test through Browserless. It is separate from the mobile web app and must not expose the Browserless token to the browser.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Set `BROWSERLESS_TOKEN` from the Browserless dashboard.
4. Set `ZAIDA_WORKER_SECRET` to a long random secret.
5. Install dependencies with `npm install`.
6. Start with `npm start`.

## Endpoints

- `GET /health`: basic service health; does not reveal credentials.
- `POST /api/browser/smoke-test`: requires `Authorization: Bearer <ZAIDA_WORKER_SECRET>`. Opens `https://example.com` in a remote browser, reads the page title and heading, and closes the session.
- `GET /api/footage/search?q=heart&orientation=portrait`: searches Pixabay videos using the server-side `PIXABAY_API_KEY`. Supports `portrait`, `landscape`, and `square`; returns up to 12 video choices with preview thumbnails, direct MP4 file links, and contributor attribution.

Example:

```bash
curl -X POST http://localhost:8787/api/browser/smoke-test \
  -H "Authorization: Bearer YOUR_ZAIDA_WORKER_SECRET"
```

## Connect the GitHub Pages frontend

After deploying this service on a public HTTPS host, copy its base URL into the `zaida-api-base` meta tag in the root `index.html` (without a trailing slash). For example, if the worker is deployed at `https://zaida-content-api.example.com`, set the meta tag content to that origin. Add the exact GitHub Pages/custom-domain origin to `ALLOWED_ORIGINS` in the worker hosting environment, then redeploy both services. Never put `PIXABAY_API_KEY` in the frontend.

The footage endpoint has a simple per-IP in-memory limit of 20 searches per minute and requests at most 12 results. Search responses are cached for 24 hours as required by Pixabay. Pixabay also enforces its account-level rate limit (100 requests per 60 seconds).

## Security notes

- Never commit `.env`, Browserless tokens, the Pixabay API key, or the worker secret.
- Never call the worker directly from public frontend code. A future authenticated ZAIDA backend should call it server-to-server.
- The smoke test only visits the fixed `example.com` URL; it does not accept arbitrary URLs or user-supplied scripts.
- Keep browser sessions short and always close them to avoid unnecessary usage.
- Configure deployment secrets through the hosting provider's secret/environment-variable settings.

## Current scope

This is a connectivity proof, not the production content automation pipeline. It does not log in to AI sites, generate images, upload files, or create videos. Those tasks will be added only after this remote-browser test passes.
