import React, { createContext, useEffect, useReducer, ReactNode } from "react";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
} from "../services/auth/Auth.service";
import {
  LoginRequestDTO,
  LoginResponseDTO,
  FlattenedUser,
} from "../types/LoginResponseDTO";

interface AuthState {
  user: FlattenedUser | null;
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
      payload: { user: FlattenedUser; roles: string[] };
    }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: { user: FlattenedUser; roles: string[] } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ROLES"; payload: string[] };

const flattenUserResponse = (response: LoginResponseDTO): FlattenedUser => {
  return {
    id: response.user.user.id,
    email: response.user.user.email,
    email_confirmed: response.user.user.email_confirmed,
    full_name: response.user.profile.full_name,
    username: response.user.profile.username,
    telephone: response.user.profile.telephone,
    company_id: response.user.profile.company_id,
    company_name: response.user.profile.company_name,
    company_reg_no: response.user.profile.company_reg_no,
    department: response.user.profile.department,
    user_access: response.user.profile.user_access,
    status: response.user.profile.status,
    roles: response.user.roles,
  };
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
    const rawUser = getCurrentUser();
    if (rawUser && (rawUser as any).access_token) {
      // It's a full LoginResponseDTO or similar
      const flattened = flattenUserResponse(
        rawUser as unknown as LoginResponseDTO,
      );
      dispatch({
        type: "SET_USER",
        payload: { user: flattened, roles: flattened.roles },
      });
    } else if (rawUser && (rawUser as any).id) {
      // It's already flattened (from a previous session after our fix)
      const flattened = rawUser as unknown as FlattenedUser;
      dispatch({
        type: "SET_USER",
        payload: { user: flattened, roles: flattened.roles },
      });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = async (loginData: LoginRequestDTO) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const userData = await apiLogin(loginData);
      const flattened = flattenUserResponse(userData);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: flattened, roles: flattened.roles },
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
