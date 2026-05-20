const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function getBackendBaseUrl() {
  const raw =
    (process.env.CAREERPILOT_BACKEND_URL ||
      process.env.BACKEND_URL ||
      process.env.VITE_API_BASE_URL ||
      process.env.VITE_API_URL ||
      "").trim();

  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}

module.exports = async (req, res) => {
  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error:
          "Backend URL is not configured. Set CAREERPILOT_BACKEND_URL (or BACKEND_URL) on Vercel to your Render service base URL, e.g. https://your-service.onrender.com",
      })
    );
    return;
  }

  const pathParts = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const forwardPath = pathParts.join("/");

  const searchParams = new URL(req.url, "http://localhost").searchParams;
  // Remove the dynamic catch-all param from the query string, if present.
  searchParams.delete("path");
  const qs = searchParams.toString();

  const url = `${backendBase}/api/${forwardPath}${qs ? `?${qs}` : ""}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    if (typeof value === "undefined") continue;
    headers[key] = value;
  }

  // Preserve client IP chain (useful for logging / rate limiting)
  headers["x-forwarded-host"] = req.headers["host"];
  headers["x-forwarded-proto"] = req.headers["x-forwarded-proto"] || "https";

  let body;
  if (!/^(GET|HEAD)$/i.test(req.method || "")) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    res.statusCode = upstream.status;

    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(lower)) return;
      // Avoid leaking backend host cookies onto the frontend domain.
      if (lower === "set-cookie") return;
      res.setHeader(key, value);
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Upstream request failed.", details: String(err) }));
  }
};
