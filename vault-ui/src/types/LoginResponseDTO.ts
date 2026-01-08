// vault-ui/src/types/LoginResponseDTO.ts
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  accesstoken: string;
  refreshtoken: string;
  tokentype: string;
  expiresin: number;
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
