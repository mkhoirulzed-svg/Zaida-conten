import express from "express";
import { timingSafeEqual } from "node:crypto";
import { chromium } from "playwright-core";

const app = express();
const port = Number(process.env.PORT || 8787);
const browserlessToken = process.env.BROWSERLESS_TOKEN;
const workerSecret = process.env.ZAIDA_WORKER_SECRET;
const browserlessEndpoint =
  process.env.BROWSERLESS_WS_ENDPOINT || "wss://production-ams.browserless.io";

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

function isAuthorized(request) {
  if (!workerSecret) return false;
  const supplied = request.get("authorization") || "";
  const expected = `Bearer ${workerSecret}`;
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer);
}

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "zaida-content-automation-worker",
    browserConfigured: Boolean(browserlessToken)
  });
});

app.post("/api/browser/smoke-test", async (request, response) => {
  if (!isAuthorized(request)) {
    return response.status(401).json({ ok: false, error: "Unauthorized" });
  }

  if (!browserlessToken) {
    return response.status(503).json({
      ok: false,
      error: "Browser engine belum dikonfigurasi."
    });
  }

  let browser;
  const startedAt = Date.now();

  try {
    const endpoint = `${browserlessEndpoint.replace(/\/$/, "")}?token=${encodeURIComponent(browserlessToken)}`;
    browser = await chromium.connectOverCDP(endpoint, { timeout: 20000 });
    const context = browser.contexts()[0] || await browser.newContext();
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(20000);

    await page.goto("https://example.com", {
      waitUntil: "domcontentloaded",
      timeout: 20000
    });

    const result = {
      ok: true,
      title: await page.title(),
      heading: await page.locator("h1").first().textContent(),
      url: page.url(),
      elapsedMs: Date.now() - startedAt
    };

    await page.close();
    return response.json(result);
  } catch (error) {
    return response.status(502).json({
      ok: false,
      error: "Browser cloud belum berhasil menjalankan uji.",
      detail: process.env.NODE_ENV === "development"
        ? String(error?.message || error)
        : undefined
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Best-effort cleanup; do not mask the original result.
      }
    }
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`ZAIDA Content automation worker listening on ${port}`);
});
