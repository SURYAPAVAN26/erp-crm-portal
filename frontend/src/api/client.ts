import axios from "axios";

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== "undefined";
  const isLocal = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  let url = envUrl;

  // 1. If in browser on Render production site, derive public backend URL from current domain
  if (isBrowser && !isLocal && window.location.hostname.includes("onrender.com")) {
    const backendHost = window.location.hostname.replace("frontend", "backend");
    url = `https://${backendHost}/api`;
  }

  // 2. Fallback to default localhost if unassigned
  if (!url) {
    url = "http://localhost:4000/api";
  }

  // 3. Ensure protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // 4. Fix internal render hostname missing .onrender.com
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".") && !parsed.hostname.includes("localhost")) {
      parsed.hostname = `${parsed.hostname}.onrender.com`;
      url = parsed.toString();
    }
  } catch (_) {
    // ignore parse error fallback
  }

  return url.endsWith("/api") ? url : `${url.replace(/\/$/, "")}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.message === "Network Error" || !err.response) {
      return `Network Error: Unable to reach API at [${API_BASE_URL}]. If backend is starting up (Render free tier cold start), please wait 15-20 seconds and click Sign In again.`;
    }
    return err.response?.data?.message ?? err.message ?? "Something went wrong";
  }
  return "Something went wrong";
}
