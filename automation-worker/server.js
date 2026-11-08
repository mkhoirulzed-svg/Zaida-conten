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


const pexelsApiKey = process.env.PEXELS_API_KEY;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5500,http://127.0.0.1:5500")
  .split(",").map(origin => origin.trim()).filter(Boolean);
const footageRate = new Map();

app.use((request, response, next) => {
  const origin = request.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});

app.get("/api/footage/search", async (request, response) => {
  const origin = request.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return response.status(403).json({ ok: false, error: "Origin tidak diizinkan." });
  }
  if (!pexelsApiKey) {
    return response.status(503).json({ ok: false, error: "Pexels API belum dikonfigurasi di server." });
  }

  const query = String(request.query.q || "").trim().slice(0, 120);
  const orientation = ["portrait", "landscape", "square"].includes(request.query.orientation)
    ? request.query.orientation : "portrait";
  const page = Math.max(1, Math.min(100, Number.parseInt(request.query.page, 10) || 1));
  if (query.length < 2) {
    return response.status(400).json({ ok: false, error: "Kata kunci minimal 2 karakter." });
  }

  const clientIp = request.ip || request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = footageRate.get(clientIp);
  if (!bucket || now - bucket.startedAt > 60_000) {
    footageRate.set(clientIp, { startedAt: now, count: 1 });
  } else if (bucket.count >= 20) {
    return response.status(429).json({ ok: false, error: "Terlalu banyak pencarian. Coba lagi sebentar." });
  } else {
    bucket.count += 1;
  }

  try {
    const params = new URLSearchParams({
      query, orientation, page: String(page), per_page: "12", locale: "id-ID"
    });
    const upstream = await fetch("https://api.pexels.com/v1/videos/search?" + params.toString(), {
      headers: { Authorization: pexelsApiKey },
      signal: AbortSignal.timeout(15_000)
    });
    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : 502;
      return response.status(status).json({
        ok: false,
        error: upstream.status === 429
          ? "Kuota Pexels sedang mencapai batas. Coba lagi nanti."
          : "Penyedia footage belum dapat memproses pencarian."
      });
    }

    const payload = await upstream.json();
    const videos = (payload.videos || []).map(video => {
      const files = (video.video_files || [])
        .filter(file => file.link && file.file_type === "video/mp4")
        .sort((a, b) => (b.width || 0) - (a.width || 0));
      const chosen = files.find(file => (file.width || 0) <= 1920) || files[0];
      return {
        id: video.id,
        title: video.url,
        thumbnail: video.image,
        duration: video.duration,
        width: video.width,
        height: video.height,
        pageUrl: video.url,
        creator: video.user?.name || "Kontributor Pexels",
        creatorUrl: video.user?.url || "https://www.pexels.com",
        fileUrl: chosen?.link || null,
        fileWidth: chosen?.width || null,
        fileHeight: chosen?.height || null
      };
    }).filter(video => video.fileUrl);

    response.setHeader("Cache-Control", "public, max-age=120, s-maxage=120");
    return response.json({
      ok: true, provider: "Pexels", page, totalResults: payload.total_results || 0, videos
    });
  } catch (error) {
    return response.status(502).json({
      ok: false,
      error: "Pencarian footage gagal. Periksa koneksi server dan coba lagi."
    });
  }
});

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
