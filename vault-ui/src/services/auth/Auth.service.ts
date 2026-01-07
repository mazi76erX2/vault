import { AxiosError } from "axios";
import {
  LoginRequestDTO,
  LoginResponseDTO,
} from "../../types/LoginResponseDTO";
import Api from "../Instance";

const USER_KEY = "currentUser";

// Determine the correct API path - check your backend main.py for how the router is mounted
// Common patterns:
// - app.include_router(auth_router, prefix="/api/auth") -> use "/api/auth"
// - app.include_router(auth_router, prefix="/api/v1/auth") -> use "/api/v1/auth"
const AUTH_API_PREFIX = "/api/v1/auth"; // Change this if your backend uses different prefix

export const getCurrentUser = (): LoginResponseDTO | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr) as LoginResponseDTO;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
  return null;
};

export const setCurrentUser = (user: LoginResponseDTO): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user data to localStorage:", error);
  }
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Helper to get access token from stored user
export const getAccessToken = (): string | null => {
  const user = getCurrentUser();
  return user?.access_token || null;
};

// Helper to get refresh token from stored user
export const getRefreshToken = (): string | null => {
  const user = getCurrentUser();
  return user?.refresh_token || null;
};

export const login = async (
  loginData: LoginRequestDTO
): Promise<LoginResponseDTO> => {
  try {
    console.log(
      "[Auth.service] Attempting login to:",
      `${AUTH_API_PREFIX}/login`
    );
    const response = await Api.post<LoginResponseDTO>(
      `${AUTH_API_PREFIX}/login`,
      loginData
    );

    console.log("[Auth.service] Login response:", response.data);

    if (response.data) {
      setCurrentUser(response.data);
      return response.data;
    }
    throw new Error("Login failed: No data received");
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof AxiosError && error.response) {
      const message =
        error.response.data?.detail ||
        error.response.data?.message ||
        error.message;
      throw new Error(message || "Login failed due to a server error.");
    } else if (error instanceof Error) {
      throw new Error(
        error.message || "Login failed due to an unexpected error."
      );
    }
    throw new Error("Login failed due to an unexpected error.");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await Api.post(`${AUTH_API_PREFIX}/logout`);
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    removeCurrentUser();
  }
};

export const refreshTokens = async (): Promise<LoginResponseDTO | null> => {
  try {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      return null;
    }

    // Your backend expects refresh_token as a query param based on the endpoint definition
    const response = await Api.post<LoginResponseDTO>(
      `${AUTH_API_PREFIX}/refresh`,
      null,
      { params: { refresh_token: currentRefreshToken } }
    );

    if (response.data) {
      setCurrentUser(response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};
