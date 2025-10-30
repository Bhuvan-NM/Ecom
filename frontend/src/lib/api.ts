import axios from "axios";

const normalize = (value?: string) =>
  value ? value.trim().replace(/\/$/, "") : undefined;

const isBrowser = typeof window !== "undefined";
const envBaseUrl = normalize(import.meta.env.VITE_API_BASE_URL);
const isDevelopment = import.meta.env.DEV;

let baseURL = envBaseUrl;

if (!baseURL) {
  if (isDevelopment) {
    baseURL = "http://localhost:1337";
  } else if (isBrowser) {
    baseURL = normalize(window.location.origin);
  }
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
