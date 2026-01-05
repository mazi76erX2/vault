import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { error as _showError } from "generic-components";
import { getCurrentUser, setCurrentUser, _logout } from "./auth/Auth.service";
import { VAULT_API_URL } from "../config";
import { LoginResponseDTO } from "../types/LoginResponseDTO";

const Api: AxiosInstance = axios.create({
  baseURL: VAULT_API_URL,
});

// Variable to prevent multiple concurrent refresh attempts
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

// Silent logout function for automatic logout without toasts
const silentLogout = async (): Promise<void> => {
  try {
    // Clear user data from localStorage
    localStorage.removeItem("currentUser");

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Silent logout failed:", error);
  }
};

// Check if error is due to JWT token expiration/invalidity
const isJWTError = (error: AxiosError): boolean => {
  const errorMessage = (error.response?.data as any)?.detail || "";
  return (
    error.response?.status === 401 &&
    (errorMessage.includes("Invalid or missing token") ||
      errorMessage.includes("token") ||
      errorMessage.includes("JWT") ||
      errorMessage.includes("expired"))
  );
};

// Implement Request Interception for Token Injection
Api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const storage = localStorage.getItem("currentUser");
    if (storage) {
      const currentUser = JSON.parse(storage);
      if (currentUser && currentUser.token) {
        // Ensure headers object exists
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${currentUser.token}`;
      }
    }
    return config;
  },
  (requestError) => Promise.reject(requestError),
);

// Response Interceptor for Token Refresh
Api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if the error is a 401 and the request hasn't been retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark as retried

      // If this is a JWT-related error, perform silent logout without showing error
      if (isJWTError(error)) {
        if (!isRefreshing) {
          isRefreshing = true;
          processQueue(error, null);
          await silentLogout();
          isRefreshing = false;
        }
        return Promise.reject(error);
      }

      // If another request is already refreshing the token, queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return Api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true; // Lock refreshing state

      const currentUser = getCurrentUser();
      if (currentUser && currentUser.refreshToken) {
        try {
          const refreshResponse = await Api.post<LoginResponseDTO>(
            "/api/v1/auth/refresh",
            {
              refreshToken: currentUser.refreshToken,
            },
          );

          if (refreshResponse.data && refreshResponse.data.token) {
            setCurrentUser(refreshResponse.data); // Update stored tokens
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            }
            processQueue(null, refreshResponse.data.token); // Process queued requests
            isRefreshing = false; // Unlock refreshing state
            return await Api(originalRequest); // Retry original request
          }
          // Refresh attempt failed (e.g., invalid refresh token in response)
          processQueue(error, null);
          await silentLogout(); // Silent logout instead of showing error
          isRefreshing = false; // Unlock refreshing state
          return await Promise.reject(error);
        } catch (refreshError) {
          // Catch errors from the refresh API call itself
          processQueue(refreshError as AxiosError, null);
          await silentLogout(); // Silent logout instead of showing error
          isRefreshing = false; // Unlock refreshing state
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, or no current user
        await silentLogout(); // Silent logout instead of showing error
        isRefreshing = false; // Unlock refreshing state
        processQueue(error, null); // Ensure queue is processed with error if any requests were pending
        return Promise.reject(error);
      }
    }

    // For non-401 errors or if already retried, just pass them on
    return Promise.reject(error);
  },
);

// This function is not strictly needed here anymore as the interceptor handles it directly.
// const authHeader = (user?: string) => { ... }; // Can be removed if not used elsewhere

export default Api;
