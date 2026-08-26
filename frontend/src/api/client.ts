import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "../features/auth/services/authService";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dedicated raw client for refreshing to prevent interceptor recursion
export const refreshClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const handleSessionExpired = () => {
  authStorage.clearTokens();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tradenet:auth:session-expired"));
    const currentPath = window.location.pathname + window.location.search;
    const isAuthPage = currentPath.startsWith("/login") || currentPath.startsWith("/register");
    if (!isAuthPage) {
      const nextParam = encodeURIComponent(currentPath);
      window.location.href = `/login?next=${nextParam}&reason=expired`;
    }
  }
};

// Request Interceptor: Injects Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401s and silent token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const url = originalRequest.url || "";
    const isRefreshUrl = url.includes("/api/v1/auth/token/refresh/");
    const isLoginUrl = url.includes("/api/v1/auth/login/");
    const isRegisterUrl = url.includes("/api/v1/auth/register/");

    if (!is401 || isLoginUrl || isRegisterUrl) {
      return Promise.reject(error);
    }

    // If refresh endpoint failed with 401 or retry already failed, session is dead
    if (isRefreshUrl || originalRequest._retry) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshClient.post<{ access: string; refresh?: string }>(
        "/api/v1/auth/token/refresh/",
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;
      const newRefreshToken = response.data.refresh || refreshToken;

      authStorage.setTokens({
        access: newAccessToken,
        refresh: newRefreshToken,
      });

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
