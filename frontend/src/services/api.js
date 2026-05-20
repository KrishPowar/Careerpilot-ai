import axios from "axios";

function resolveApiUrl() {
  const base = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const legacy = (import.meta.env.VITE_API_URL || "").trim();
  const forceDirect = String(import.meta.env.VITE_FORCE_DIRECT_API || "").toLowerCase() === "true";

  const { protocol, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const raw = base || legacy;
    if (raw) {
      const normalized = raw.replace(/\/+$/, "");
      return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
    }
    return `${protocol}//${hostname}:5000/api`;
  }

  // Production fallback: call same-origin '/api/*' and let the hosting platform proxy.
  // On Vercel this is implemented via a serverless function in 'frontend/api/'.
  if (!forceDirect) {
    return "/api";
  }

  const raw = base || legacy;
  if (raw) {
    const normalized = raw.replace(/\/+$/, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
  }

  // If forceDirect is enabled but no base URL is configured, fall back to proxy.
  return "/api";
}

const api = axios.create({
  baseURL: resolveApiUrl(),
  timeout: 45000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("careerpilot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setSession(token, user) {
  localStorage.setItem("careerpilot_token", token);
  localStorage.setItem("careerpilot_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("careerpilot_token");
  localStorage.removeItem("careerpilot_user");
}

export function getStoredUser() {
  const value = localStorage.getItem("careerpilot_user");
  return value ? JSON.parse(value) : null;
}

export default api;
