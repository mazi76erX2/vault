import { LoginRequestDTO, LoginResponseDTO } from '../../types/LoginResponseDTO';
import Api from '../Instance';
import { AxiosError } from 'axios';

const USER_KEY = 'currentUser';

export const getCurrentUser = (): LoginResponseDTO | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
        try {
            return JSON.parse(userStr) as LoginResponseDTO;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
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
        console.error('Error saving user data to localStorage:', error);
    }
};

export const removeCurrentUser = (): void => {
    localStorage.removeItem(USER_KEY);
};

export const login = async (loginData: LoginRequestDTO): Promise<LoginResponseDTO> => {
    try {
        const response = await Api.post<LoginResponseDTO>('/api/v1/auth/login', loginData);
        
        if (response.data) {
            setCurrentUser(response.data);
            return response.data;
        }
        throw new Error('Login failed: No data received');
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof AxiosError && error.response) {
            const message = error.response.data?.detail || error.response.data?.message || error.message;
            throw new Error(message || 'Login failed due to a server error.');
        } else if (error instanceof Error) {
            throw new Error(error.message || 'Login failed due to an unexpected error.');
        }
        throw new Error('Login failed due to an unexpected error.');
    }
};

export const logout = async (): Promise<void> => {
    try {
        await Api.post('/api/v1/auth/logout');
        removeCurrentUser();
    } catch (error) {
        console.error('Logout API call failed:', error);
        removeCurrentUser();
    }
};

