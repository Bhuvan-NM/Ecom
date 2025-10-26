import axios from "axios";

const rawEnvBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const normalize = (value?: string) => (value ? value.replace(/\/$/, "") : undefined);

const isBrowser = typeof window !== "undefined";
const envBaseUrl = normalize(rawEnvBaseUrl);
const isLocalEnvUrl = envBaseUrl?.startsWith("http://localhost");

let resolvedBaseUrl = envBaseUrl;

if (!resolvedBaseUrl || (!import.meta.env.DEV && isLocalEnvUrl)) {
  if (isBrowser) {
    resolvedBaseUrl = normalize(window.location.origin);
  }
}

if (!resolvedBaseUrl && import.meta.env.DEV) {
  resolvedBaseUrl = "http://localhost:1337";
}

const api = axios.create({
  baseURL: resolvedBaseUrl,
  withCredentials: true,
});

export default api;
