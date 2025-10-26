import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const sanitizedBaseUrl = envBaseUrl ? envBaseUrl.replace(/\/$/, "") : undefined;

const api = axios.create({
  baseURL: sanitizedBaseUrl,
  withCredentials: true,
});

export default api;
