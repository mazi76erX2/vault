// vault-ui/src/types/LoginResponseDTO.ts
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface FlattenedUser {
  id: string;
  email: string;
  email_confirmed: boolean;
  full_name?: string | null;
  username?: string | null;
  telephone?: string | null;
  company_id?: number | null;
  company_name?: string | null;
  company_reg_no: string;
  department?: string | null;
  user_access?: number | null;
  status: string;
  roles: string[];
}

export interface LoginResponseDTO {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user: {
      id: string;
      email: string;
      email_confirmed: boolean;
    };
    profile: {
      id: string;
      full_name?: string | null;
      email: string;
      username?: string | null;
      telephone?: string | null;
      company_id?: number | null;
      company_name?: string | null;
      company_reg_no: string;
      department?: string | null;
      user_access?: number | null;
      status: string;
    };
    roles: string[];
    company_reg_no: string;
  };
}
