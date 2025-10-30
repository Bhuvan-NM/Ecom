import axios from "axios";

const normalize = (value?: string) =>
  value ? value.trim().replace(/\/$/, "") : undefined;

const isBrowser = typeof window !== "undefined";
const envBaseUrl = normalize(import.meta.env.VITE_API_BASE_URL);
const envDevBaseUrl = normalize(import.meta.env.VITE_API_BASE_URL_DEV);
const isDevelopment = import.meta.env.DEV;

let baseURL: string | undefined;

if (isDevelopment) {
  const localhostFallback = "http://localhost:1337";
  baseURL =
    envDevBaseUrl ??
    (envBaseUrl && !envBaseUrl.includes("onrender.com")
      ? envBaseUrl
      : localhostFallback);

  if (isBrowser && window.location.hostname === "localhost") {
    baseURL = envDevBaseUrl ?? localhostFallback;
  }
} else {
  baseURL = envBaseUrl ?? (isBrowser ? normalize(window.location.origin) : undefined);
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
