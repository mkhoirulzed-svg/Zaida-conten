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

Example:

```bash
curl -X POST http://localhost:8787/api/browser/smoke-test \
  -H "Authorization: Bearer YOUR_ZAIDA_WORKER_SECRET"
```

## Security notes

- Never commit `.env`, Browserless tokens, or the worker secret.
- Never call the worker directly from public frontend code. A future authenticated ZAIDA backend should call it server-to-server.
- The smoke test only visits the fixed `example.com` URL; it does not accept arbitrary URLs or user-supplied scripts.
- Keep browser sessions short and always close them to avoid unnecessary usage.
- Configure deployment secrets through the hosting provider's secret/environment-variable settings.

## Current scope

This is a connectivity proof, not the production content automation pipeline. It does not log in to AI sites, generate images, upload files, or create videos. Those tasks will be added only after this remote-browser test passes.
