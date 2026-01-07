export interface LoginRequestDTO {
  email: string;
  password: string;
}

// Matches backend's user dict inside CurrentUser
export interface AuthUser {
  id: string;
  email: string;
  email_confirmed: boolean;
}

// Matches backend's profile dict inside CurrentUser
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  username: string | null;
  telephone: string | null;
  company_id: number | null;
  company_name: string | null;
  company_reg_no: string | null;
  department: string | null;
  user_access: number | null;
  status: string | null;
}

// Matches backend's CurrentUser model
export interface CurrentUser {
  user: AuthUser;
  profile: UserProfile;
  roles: string[];
  company_reg_no: string | null;
}

// Matches backend's LoginResponse model (extends TokenResponse)
export interface LoginResponseDTO {
  // From TokenResponse
  access_token: string; // Backend uses snake_case
  refresh_token: string; // Backend uses snake_case
  token_type: string;
  expires_in: number;
  // From LoginResponse
  user: CurrentUser;
}

// Legacy type for backwards compatibility if needed elsewhere
export interface UserDTO {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}
