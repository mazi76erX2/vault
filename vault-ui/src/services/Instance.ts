import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import {
  getCurrentUser,
  setCurrentUser,
  getAccessToken,
  getRefreshToken,
} from "@/features/auth/Auth.service";
import { VAULT_API_URL } from "../config";
import { LoginResponseDTO } from "@/types/dtos/LoginResponseDTO";

const Api: AxiosInstance = axios.create({
  baseURL: VAULT_API_URL,
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const manualLogout = async (): Promise<void> => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const isJWTError = (error: AxiosError): boolean => {
  const status = error.response?.status;
  const detail = (error.response?.data as any)?.detail || "";
  return (
    status === 401 ||
    status === 403 ||
    detail.includes("Invalid") ||
    detail.includes("token") ||
    detail.includes("JWT") ||
    detail.includes("expired") ||
    detail.includes("unauthorized")
  );
};

Api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached:", token.substring(0, 20) + "...");
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (requestError) => Promise.reject(requestError),
);

Api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (isJWTError(error) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const errorMsg =
        error.response?.data?.detail ||
        (error.response?.status === 403
          ? "Insufficient permissions"
          : "Session issue");
      toast.error(errorMsg);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return Api(originalRequest);
            }
            return Promise.reject(error);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          toast.warning("Token refresh unavailable");
          await manualLogout();
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${VAULT_API_URL}/api/auth/refresh`,
          {
            refresh_token: refreshToken,
          },
        );

        if (refreshResponse.data?.access_token) {
          localStorage.setItem(
            "access_token",
            refreshResponse.data.access_token,
          );
          localStorage.setItem(
            "refresh_token",
            refreshResponse.data.refresh_token,
          );
          if (refreshResponse.data.user) {
            setCurrentUser(refreshResponse.data.user);
          }
          processQueue(null, refreshResponse.data.access_token);
          originalRequest.headers!.Authorization = `Bearer ${refreshResponse.data.access_token}`;
          return Api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        toast.warning("Session expired. Please login again.");
        await manualLogout();
        processQueue(refreshError as AxiosError, null);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      if (error.response.status === 401 || error.response.status === 403) {
        return Promise.reject(error);
      }
      const detail = (error.response.data as any)?.detail || "Request failed";
      toast.error(detail);
    }

    return Promise.reject(error);
  },
);

export default Api;
