const CACHE_TTL = 60 * 60 * 24;
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers }
  });
}

function allowedOrigin(origin, env) {
  const configured = (env.ALLOWED_ORIGINS || "")
    .split(",").map(value => value.trim()).filter(Boolean);
  if (!origin) return "*";
  if (configured.length === 0 || configured.includes("*")) return "*";
  return configured.includes(origin) ? origin : null;
}

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
}

function normalizeVideo(video) {
  const variants = video.videos || {};
  const chosen = variants.medium?.url ? variants.medium
    : variants.large?.url ? variants.large
    : variants.small?.url ? variants.small
    : variants.tiny;
  if (!chosen?.url) return null;
  return {
    id: video.id,
    title: (video.tags || "Video Pixabay").split(",").slice(0, 3).join(", "),
    thumbnail: chosen.thumbnail || variants.small?.thumbnail || variants.tiny?.thumbnail || null,
    duration: video.duration || 0,
    width: chosen.width || null,
    height: chosen.height || null,
    pageUrl: video.pageURL || "https://pixabay.com/videos/",
    creator: video.user || "Kontributor Pixabay",
    creatorUrl: video.user
      ? `https://pixabay.com/users/${encodeURIComponent(video.user)}-${encodeURIComponent(video.user_id || "")}/`
      : "https://pixabay.com",
    fileUrl: chosen.url,
    fileWidth: chosen.width || null,
    fileHeight: chosen.height || null
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const permittedOrigin = allowedOrigin(origin, env);
    if (origin && !permittedOrigin) {
      return json({ ok: false, error: "Origin tidak diizinkan." }, 403);
    }
    const cors = corsHeaders(permittedOrigin || "*");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "zaida-content-cloudflare-worker",
        footageConfigured: Boolean(env.PIXABAY_API_KEY)
      }, 200, cors);
    }

    if (url.pathname !== "/api/footage/search" || request.method !== "GET") {
      return json({ ok: false, error: "Endpoint tidak ditemukan." }, 404, cors);
    }

    if (!env.PIXABAY_API_KEY) {
      return json({ ok: false, error: "Pixabay API belum dikonfigurasi di Cloudflare Worker." }, 503, cors);
    }

    const query = (url.searchParams.get("q") || "").trim().slice(0, 100);
    const orientation = ["portrait", "landscape", "square"].includes(url.searchParams.get("orientation"))
      ? url.searchParams.get("orientation") : "portrait";
    const page = Math.max(1, Math.min(100, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
    if (query.length < 2) {
      return json({ ok: false, error: "Kata kunci minimal 2 karakter." }, 400, cors);
    }

    const cacheUrl = new URL(request.url);
    cacheUrl.searchParams.set("q", query.toLowerCase());
    cacheUrl.searchParams.set("orientation", orientation);
    cacheUrl.searchParams.set("page", String(page));
    const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      for (const [key, value] of Object.entries(cors)) headers.set(key, value);
      headers.set("x-zaida-cache", "HIT");
      return new Response(cached.body, { status: cached.status, headers });
    }

    try {
      const params = new URLSearchParams({
        key: env.PIXABAY_API_KEY,
        q: query,
        lang: "id",
        page: String(page),
        per_page: "12",
        safesearch: "true",
        order: "popular"
      });
      const upstream = await fetch("https://pixabay.com/api/videos/?" + params.toString(), {
        headers: { "accept": "application/json" },
        signal: AbortSignal.timeout(15000)
      });
      if (!upstream.ok) {
        return json({
          ok: false,
          error: upstream.status === 429
            ? "Kuota Pixabay sedang mencapai batas. Coba lagi nanti."
            : "Pixabay belum dapat memproses pencarian."
        }, upstream.status === 429 ? 429 : 502, cors);
      }

      const payload = await upstream.json();
      const videos = (payload.hits || [])
        .map(normalizeVideo)
        .filter(Boolean)
        .filter(video => {
          if (!video.width || !video.height || orientation === "square") return true;
          return orientation === "portrait"
            ? video.height > video.width
            : video.width >= video.height;
        });

      const result = json({
        ok: true,
        provider: "Pixabay",
        page,
        totalResults: payload.totalHits || payload.total || 0,
        videos
      }, 200, cors);
      const cacheResponse = new Response(result.clone().body, {
        status: result.status,
        headers: result.headers
      });
      cacheResponse.headers.set("cache-control", `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`);
      ctx.waitUntil(cache.put(cacheKey, cacheResponse));
      return result;
    } catch {
      return json({
        ok: false,
        error: "Pencarian footage gagal. Periksa konfigurasi Worker dan coba lagi."
      }, 502, cors);
    }
  }
};
