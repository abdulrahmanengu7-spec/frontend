import axios from "axios";

/*
  API URL setup:
  - Netlify/Vercel production ke liye VITE_API_URL use hoga.
  - Agar env missing ho to current live backend fallback use hoga.
  - /api duplicate nahi hoga, chahe env me /api ho ya na ho.
*/

const DEFAULT_BACKEND_URL = import.meta.env.PROD
  ? "https://backend-blond-three-91.vercel.app"
  : "http://localhost:5000";

const RAW_API_URL = import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL;

const CLEAN_API_ROOT = RAW_API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export const API_URL = `${CLEAN_API_ROOT}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sms_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      if (typeof config.headers?.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else if (config.data) {
      if (typeof config.headers?.set === "function") {
        if (!config.headers.get("Content-Type")) {
          config.headers.set("Content-Type", "application/json");
        }
      } else if (
        config.headers &&
        !config.headers["Content-Type"] &&
        !config.headers["content-type"]
      ) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "API request failed";

    error.userMessage = message;

    return Promise.reject(error);
  }
);

export default api;
