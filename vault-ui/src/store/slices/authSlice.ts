import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
} from "@/features/auth/Auth.service";
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

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isLoadingUser: true,
  error: null,
  userRoles: [],
};

export const login = createAsyncThunk(
  "auth/login",
  async (loginData: LoginRequestDTO, { rejectWithValue }) => {
    try {
      const userData = await apiLogin(loginData);
      return flattenUserResponse(userData);
    } catch (err: any) {
      return rejectWithValue(err.message || "Login failed");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await apiLogout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateSession(state) {
      const rawUser = getCurrentUser();
      if (rawUser) {
        try {
          if ((rawUser as any).id) {
            const flattened = rawUser as unknown as FlattenedUser;
            state.user = flattened;
            state.userRoles = flattened.roles || [];
            state.isLoggedIn = true;
          } else if ((rawUser as any).user?.id) {
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
            state.user = flattened;
            state.userRoles = flattened.roles;
            state.isLoggedIn = true;
          }
        } catch (error) {
          console.error("Redux hydration error:", error);
        }
      }
      state.isLoadingUser = false;
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.userRoles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoadingUser = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.userRoles = action.payload.roles;
        state.isLoggedIn = true;
        state.isLoadingUser = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.userRoles = [];
        state.isLoggedIn = false;
        state.isLoadingUser = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState, { isLoadingUser: false });
      });
  },
});

export const { hydrateSession, setRoles } = authSlice.actions;
export default authSlice.reducer;
