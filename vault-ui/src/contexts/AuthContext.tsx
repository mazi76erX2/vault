import React, { createContext, useEffect, useReducer, ReactNode } from "react";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
} from "../services/auth/Auth.service";
import { LoginRequestDTO, LoginResponseDTO } from "../types/LoginResponseDTO";

interface AuthState {
  user: LoginResponseDTO | null;
  isLoggedIn: boolean;
  isLoadingUser: boolean;
  error: string | null;
  userRoles: string[];
}

interface AuthContextType extends AuthState {
  login: (loginData: LoginRequestDTO) => Promise<void>;
  logout: () => Promise<void>;
  setUserRoles: (roles: string[]) => void;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isLoadingUser: true,
  error: null,
  userRoles: [],
};

type AuthAction =
  | {
      type: "LOGIN_SUCCESS";
      payload: { user: LoginResponseDTO; roles: string[] };
    }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: { user: LoginResponseDTO; roles: string[] } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ROLES"; payload: string[] };

// Helper to extract roles from the login response
const extractRolesFromResponse = (
  response: LoginResponseDTO | null
): string[] => {
  if (!response) return [];

  // Your backend returns: response.user.roles (where user is CurrentUser)
  if (response.user && Array.isArray(response.user.roles)) {
    console.log(
      "[AuthContext] Extracted roles from response.user.roles:",
      response.user.roles
    );
    return response.user.roles;
  }

  console.log("[AuthContext] No roles found in response");
  return [];
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log("[AuthContext] Reducer ACTION:", action.type);

  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        userRoles: action.payload.roles,
        isLoggedIn: true,
        isLoadingUser: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        isLoadingUser: false,
        error: action.payload,
        userRoles: [],
      };
    case "LOGOUT":
      return { ...initialState, isLoadingUser: false };
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        userRoles: action.payload.roles,
        isLoggedIn: true,
        isLoadingUser: false,
      };
    case "SET_LOADING":
      return { ...state, isLoadingUser: action.payload };
    case "SET_ROLES":
      return { ...state, userRoles: action.payload };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log(
    "[AuthContext] Provider render - userRoles:",
    state.userRoles,
    "isLoading:",
    state.isLoadingUser
  );

  // Load user from localStorage on mount
  useEffect(() => {
    console.log("[AuthContext] Initial load from localStorage");
    const storedUser = getCurrentUser();

    if (storedUser) {
      console.log("[AuthContext] Found stored user:", storedUser);
      const roles = extractRolesFromResponse(storedUser);
      console.log("[AuthContext] Extracted roles:", roles);
      dispatch({ type: "SET_USER", payload: { user: storedUser, roles } });
    } else {
      console.log("[AuthContext] No stored user found");
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = async (loginData: LoginRequestDTO) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      console.log("[AuthContext] Login attempt for:", loginData.email);

      const userData = await apiLogin(loginData);
      console.log("[AuthContext] Login success, response:", userData);

      // Extract roles from the response
      const roles = extractRolesFromResponse(userData);
      console.log("[AuthContext] Extracted roles:", roles);

      dispatch({ type: "LOGIN_SUCCESS", payload: { user: userData, roles } });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("[AuthContext] Login failed:", errorMessage);
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw err;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      console.log("AuthContext: Starting logout...");

      await apiLogout(); // Uses fixed Auth.service above

      console.log("AuthContext: Logout complete");

      // Hard redirect clears React state + router
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("AuthContext: Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const setUserRoles = (roles: string[]) => {
    dispatch({ type: "SET_ROLES", payload: roles });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setUserRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
