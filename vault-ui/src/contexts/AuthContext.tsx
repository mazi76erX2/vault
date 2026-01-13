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

const extractRolesFromResponse = (
  response: LoginResponseDTO | null,
): string[] => {
  if (!response) return [];
  if (response.user && Array.isArray(response.user.roles)) {
    return response.user.roles;
  }
  return [];
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
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
      return {
        ...initialState,
        isLoadingUser: false,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        userRoles: action.payload.roles,
        isLoggedIn: true,
        isLoadingUser: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoadingUser: action.payload,
      };
    case "SET_ROLES":
      return {
        ...state,
        userRoles: action.payload,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      const roles = extractRolesFromResponse(storedUser);
      dispatch({ type: "SET_USER", payload: { user: storedUser, roles } });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = async (loginData: LoginRequestDTO) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const userData = await apiLogin(loginData);
      const roles = extractRolesFromResponse(userData);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: userData, roles },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw err;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await apiLogout();
    } catch (error) {
      console.error("AuthContext Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const setUserRoles = (roles: string[]) => {
    dispatch({ type: "SET_ROLES", payload: roles });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUserRoles }}>
      {children}
    </AuthContext.Provider>
  );
};
