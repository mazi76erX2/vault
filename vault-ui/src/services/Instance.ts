import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner"; // Your existing toast system
import { getCurrentUser, setCurrentUser } from "./auth/Auth.service";
import { VAULTAPIURL } from "../config";
import { LoginResponseDTO } from "../types/LoginResponseDTO";

const Api: AxiosInstance = axios.create({
  baseURL: VAULTAPIURL,
});

// Prevent multiple concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
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

// Silent logout - clears storage and redirects
const silentLogout = async (): Promise<void> => {
  localStorage.removeItem("currentUser");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// Detect JWT/auth errors
const isJWTError = (error: AxiosError): boolean => {
  const errorMessage = (error.response?.data as any)?.detail;
  return (
    error.response?.status === 401 ||
    errorMessage?.includes("Invalid or missing token") ||
    errorMessage?.includes("token") ||
    errorMessage?.includes("JWT") ||
    errorMessage?.includes("expired") ||
    error.response?.status === 403
  );
};

// REQUEST INTERCEPTOR - Add auth token to every request
Api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const storage = localStorage.getItem("currentUser");
    if (storage) {
      try {
        const currentUser: LoginResponseDTO = JSON.parse(storage);
        if (currentUser?.accesstoken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${currentUser.accesstoken}`;
          console.log(
            "Token attached:",
            currentUser.accesstoken.substring(0, 20) + "..."
          );
        }
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem("currentUser");
      }
    }
    return config;
  },
  (requestError) => Promise.reject(requestError)
);

// RESPONSE INTERCEPTOR - Handle 401/403 token refresh
Api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            return Api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const refreshToken = getCurrentUser()?.refreshtoken;
        if (!refreshToken) {
          toast.error("Session expired. Please log in again.");
          await silentLogout();
          return Promise.reject(error);
        }

        // Refresh token endpoint
        const refreshResponse = await Api.post<LoginResponseDTO>(
          "/apiv1authrefresh",
          {
            refreshtoken: refreshToken,
          }
        );

        if (refreshResponse.data?.accesstoken) {
          setCurrentUser(refreshResponse.data);
          processQueue(null, refreshResponse.data.accesstoken);

          originalRequest.headers!.Authorization = `Bearer ${refreshResponse.data.accesstoken}`;
          return Api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        toast.error("Session expired. Redirecting to login...");
        processQueue(refreshError as AxiosError, null);
        await silentLogout();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default Api;
