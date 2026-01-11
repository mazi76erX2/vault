import axios, { AxiosError } from "axios";
import {
  LoginRequestDTO,
  LoginResponseDTO,
} from "../../types/LoginResponseDTO";
import Api from "../Instance";

const USERKEY = "currentUser";
const AUTHAPIPREFIX = "/api/auth"; // Matches backend router prefix

export const getCurrentUser = (): LoginResponseDTO | null => {
  const userStr = localStorage.getItem(USERKEY);
  if (userStr) {
    try {
      return JSON.parse(userStr) as LoginResponseDTO;
    } catch (error) {
      console.error("Error parsing user data from localStorage", error);
      localStorage.removeItem(USERKEY);
    }
  }
  return null;
};

export const setCurrentUser = (user: LoginResponseDTO): void => {
  try {
    localStorage.setItem(USERKEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user data to localStorage", error);
  }
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem(USERKEY);
};

export const getAccessToken = (): string | null => {
  const user = getCurrentUser();
  return user?.access_token ?? null;
};

export const getRefreshToken = (): string | null => {
  const user = getCurrentUser();
  return user?.refresh_token ?? null;
};

export const login = async (
  loginData: LoginRequestDTO
): Promise<LoginResponseDTO> => {
  try {
    console.log("Auth.service: Attempting login to:", `${AUTHAPIPREFIX}/login`);
    console.log("Auth.service: Payload:", loginData);

    const response = await Api.post<LoginResponseDTO>(
      `${AUTHAPIPREFIX}/login`,
      loginData
    );
    console.log("Auth.service: Login response:", response.data);

    if (response.data) {
      setCurrentUser(response.data);
      return response.data;
    }

    throw new Error("Login failed: No data received");
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Login failed due to a server error";
      throw new Error(message);
    }

    throw new Error("Login failed due to an unexpected error");
  }
};

// FIXED: Empty POST body for logout
export const logout = async (): Promise<void> => {
  try {
    console.log("Auth.service: Calling logout API:", `${AUTHAPIPREFIX}/logout`);
    // Empty body - backend expects no payload
    await Api.post(
      `${AUTHAPIPREFIX}/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Auth.service: Logout API success");
  } catch (error) {
    console.error("Auth.service: Logout API failed:", error);
    // Don't throw - cleanup anyway
  } finally {
    // Always clear localStorage + redirect
    removeCurrentUser();
    console.log("Auth.service: localStorage cleared");
  }
};

export const refreshTokens = async (): Promise<LoginResponseDTO | null> => {
  try {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) return null;

    const response = await Api.post<LoginResponseDTO>(
      `${AUTHAPIPREFIX}/refresh`,
      {
        refreshtoken: currentRefreshToken,
      }
    );

    if (response.data) {
      setCurrentUser(response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed", error);
    return null;
  }
};
