import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const api = axios.create({ baseURL: base });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshToken = localStorage.getItem("refresh_token");
    const isAuthRequest = request?.url?.includes("/auth/token/");

    if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      if (window.location.pathname !== "/login") window.location.assign("/login");
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      if (!refreshRequest) {
        refreshRequest = axios.post(`${base}/auth/token/refresh/`, { refresh: refreshToken })
          .then((response) => {
            localStorage.setItem("access_token", response.data.access);
            if (response.data.refresh) localStorage.setItem("refresh_token", response.data.refresh);
            return response.data.access;
          })
          .finally(() => { refreshRequest = null; });
      }
      const accessToken = await refreshRequest;
      request.headers = request.headers || {};
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      if (window.location.pathname !== "/login") window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  }
);

export default api;
