import React, { createContext, useEffect, useReducer, ReactNode } from "react";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
} from "./Auth.service";
import {
  LoginRequestDTO,
  LoginResponseDTO,
  FlattenedUser,
} from "@/types/dtos/LoginResponseDTO";

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
    if (rawUser) {
      try {
        // Handle cases where roles might be missing or in different formats
        let roles: string[] = [];
        if (Array.isArray((rawUser as any).roles)) {
          roles = (rawUser as any).roles;
        } else if ((rawUser as any).profile?.roles) {
          roles = (rawUser as any).profile.roles;
        }

        // Check if it's already a flattened user or needs flattening
        if ((rawUser as any).id) {
          const flattened = rawUser as unknown as FlattenedUser;
          dispatch({
            type: "SET_USER",
            payload: { user: flattened, roles: roles },
          });
        } else if ((rawUser as any).user?.id) {
          // If it's a nested user object but not a full LoginResponseDTO
          // This matches the format stored by setCurrentUser(response.data.user)
          const profile = (rawUser as any).profile;
          const user = (rawUser as any).user;
          const flattened: FlattenedUser = {
            id: user.id,
            email: user.email,
            email_confirmed: user.email_confirmed,
            full_name: profile?.full_name,
            username: profile?.username,
            telephone: profile?.telephone,
            company_id: profile?.company_id,
            company_name: profile?.company_name,
            company_reg_no: profile?.company_reg_no,
            department: profile?.department,
            user_access: profile?.user_access,
            status: profile?.status,
            roles: Array.isArray((rawUser as any).roles)
              ? (rawUser as any).roles
              : [],
          };
          dispatch({
            type: "SET_USER",
            payload: { user: flattened, roles: flattened.roles },
          });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Re-hydration error:", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
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
