import axios from "axios";

function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5000/api`;
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
