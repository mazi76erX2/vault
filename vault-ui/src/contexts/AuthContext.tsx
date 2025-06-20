// src/contexts/AuthContext.tsx
import React, { createContext, useEffect, useReducer, ReactNode } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../services/auth/Auth.service';
import { LoginRequestDTO, LoginResponseDTO } from '../types/LoginResponseDTO';
import Api from '../services/Instance';
import { AxiosError } from 'axios';

// Define a type for user with roles
// interface UserWithRoles extends LoginResponseDTO { // This specific type isn't directly used for state.user, state.user is LoginResponseDTO | null
//     roles: string[];
// }

// The AuthContextData was more for an ideal shape, the actual context type is AuthContextType
// export interface AuthContextData {
//     user: UserWithRoles | null; 
//     isLoggedIn: boolean;
//     logout(): void;
//     isLoadingUser: boolean;
//     refreshAppUserData(): Promise<void>; 
//     redirectOnCompanyChangeRoute?: string;
//     setRedirectOnCompanyChangeRoute(value?: string): void;
// }

interface AuthState {
  user: LoginResponseDTO | null;
    isLoggedIn: boolean;
    isLoadingUser: boolean;
  error: string | null;
  userRoles: string[]; 
}

interface AuthContextType extends AuthState { // AuthState already includes userRoles
  login: (loginData: LoginRequestDTO) => Promise<void>;
  logout: () => Promise<void>;
  setUserRoles: (roles: string[]) => void; // This is the function to dispatch SET_ROLES
}

const initialState: AuthState = {
    user: null,
    isLoggedIn: false,
    isLoadingUser: true,
    error: null,
    userRoles: [],
};

type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponseDTO }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: LoginResponseDTO | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ROLES'; payload: string[] }; 

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    console.log('[AuthContext] AuthReducer ACTION:', action.type, 'PAYLOAD:', (action as { payload?: unknown }).payload); // Log action
    switch (action.type) {
    case 'LOGIN_SUCCESS':
        return { ...state, user: action.payload, isLoggedIn: true, isLoadingUser: false, error: null };
    case 'LOGIN_FAILURE':
        return { ...state, user: null, isLoggedIn: false, isLoadingUser: false, error: action.payload };
    case 'LOGOUT':
        return { ...initialState, isLoadingUser: false, userRoles: [] }; // Ensure userRoles are cleared on logout too
    case 'SET_USER':
        return { ...state, user: action.payload, isLoggedIn: !!action.payload, isLoadingUser: false };
    case 'SET_LOADING':
        return { ...state, isLoadingUser: action.payload };
    case 'SET_ROLES': { 
        console.log('[AuthContext] Reducer SET_ROLES old state.userRoles:', state.userRoles, 'new payload:', action.payload);
        const newState = { ...state, userRoles: action.payload };
        console.log('[AuthContext] Reducer SET_ROLES new state.userRoles:', newState.userRoles);
        return newState;
    }
    default:
        return state;
    }
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    console.log('[AuthContext] AuthProvider rendering, current state.userRoles:', state.userRoles, 'isLoadingUser:', state.isLoadingUser);

    const fetchUserRoles = async (userId: string) => {
        console.log('[AuthContext] fetchUserRoles CALLED for userId:', userId);
        try {
            const response = await Api.get(`/api/v1/auth/user_roles/${userId}`); 
            console.log('[AuthContext] fetchUserRoles RESPONSE:', response.data);
            if (response.data && Array.isArray(response.data.roles)) { 
                console.log('[AuthContext] dispatching SET_ROLES with:', response.data.roles);
                dispatch({ type: 'SET_ROLES', payload: response.data.roles });
            } else {
                console.warn('[AuthContext] fetchUserRoles: response.data.roles not found or not an array, setting empty roles. Response:', response.data);
                dispatch({ type: 'SET_ROLES', payload: [] });
            }
        } catch (error) {
            console.error('[AuthContext] Failed to fetch user roles:', error);
            if (!(error instanceof AxiosError && error.response?.status === 401)) {
                // Handle other errors for non-401 cases if needed
            }
            // For 401s, interceptor handles logout/redirect. For other errors, clear roles.
            dispatch({ type: 'SET_ROLES', payload: [] }); 
        }
    };

    useEffect(() => {
        console.log('[AuthContext] Initial useEffect RUNNING. isLoadingUser:', state.isLoadingUser);
        const user = getCurrentUser(); // Fetches from localStorage
        if (user) {
            console.log('[AuthContext] User found in localStorage:', user.user?.id);
            dispatch({ type: 'SET_USER', payload: user }); // This sets user and isLoggedIn, and isLoadingUser to false
            if (user.user?.id) {
                fetchUserRoles(user.user.id); // Fetch roles for the user from localStorage
            } else {
                console.warn('[AuthContext] User found in localStorage but without an ID. Not fetching roles.');
                dispatch({ type: 'SET_LOADING', payload: false }); 
            }
        } else {
            console.log('[AuthContext] No user in localStorage, setting loading to false.');
            dispatch({ type: 'SET_LOADING', payload: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const login = async (loginData: LoginRequestDTO) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            console.log('[AuthContext] Attempting login for:', loginData.email);
            const userData = await apiLogin(loginData); 
            console.log('[AuthContext] Login API success, userData:', userData);
            dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
            if (userData.user?.id) {
                console.log('[AuthContext] Fetching roles after login for user:', userData.user.id);
                await fetchUserRoles(userData.user.id); 
            } else {
                console.warn('[AuthContext] Login success but no user ID in userData.');
                dispatch({ type: 'SET_ROLES', payload: [] }); // Ensure roles are cleared if no user ID
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('[AuthContext] Login failed:', errorMessage, err);
            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
            dispatch({ type: 'SET_ROLES', payload: [] }); // Clear roles on login failure
        }
    };

    const logout = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            console.log('[AuthContext] Attempting logout.');
            await apiLogout(); 
            console.log('[AuthContext] Logout API success.');
            dispatch({ type: 'LOGOUT' }); // Reducer now clears userRoles here
        } catch (error) {
            console.error('[AuthContext] Logout API call failed:', error);
            dispatch({ type: 'LOGOUT' }); 
        }
    };
  
    const setUserRolesCallback = (roles: string[]) => {
        console.log('[AuthContext] Manually calling setUserRoles with:', roles);
        dispatch({ type: 'SET_ROLES', payload: roles });
    };

    return (
        <AuthContext.Provider value={{
            ...state, 
            login, 
            logout, 
            setUserRoles: setUserRolesCallback 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
