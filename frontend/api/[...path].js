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
  "content-length",
]);
const http = require("node:http");
const https = require("node:https");

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

  const pathParts = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);
  const forwardPath = pathParts.join("/");

  const searchParams = new URL(req.url, "http://localhost").searchParams;
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

  headers["x-forwarded-host"] = req.headers["host"];
  headers["x-forwarded-proto"] = req.headers["x-forwarded-proto"] || "https";

  let body;
  if (!/^(GET|HEAD)$/i.test(req.method || "")) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  try {
    const upstreamUrl = new URL(url);
    const client = upstreamUrl.protocol === "https:" ? https : http;

    const upstreamReq = client.request(
      {
        method: req.method,
        hostname: upstreamUrl.hostname,
        port: upstreamUrl.port || undefined,
        path: `${upstreamUrl.pathname}${upstreamUrl.search}`,
        headers: {
          ...headers,
          ...(body ? { "content-length": String(body.length) } : {}),
        },
      },
      (upstreamRes) => {
        res.statusCode = upstreamRes.statusCode || 502;

        for (const [key, value] of Object.entries(upstreamRes.headers)) {
          const lower = key.toLowerCase();
          if (HOP_BY_HOP_HEADERS.has(lower)) continue;
          if (lower === "set-cookie") continue;
          if (typeof value === "undefined") continue;
          res.setHeader(key, value);
        }

        upstreamRes.pipe(res);
      }
    );

    upstreamReq.on("error", (err) => {
      if (res.headersSent) {
        res.destroy(err);
        return;
      }
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Upstream request failed.", details: String(err) }));
    });

    if (body) upstreamReq.write(body);
    upstreamReq.end();
  } catch (err) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Upstream request failed.", details: String(err) }));
  }
};
