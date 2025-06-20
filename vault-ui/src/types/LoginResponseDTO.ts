/**
 * Represents the response returned by a successful login,
 * including user info and auth tokens.
 */
import { UserDTO } from './UserDTO';

// Define and export LoginRequestDTO
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  user: UserDTO;       // The logged-in user's data
  token: string;    // Access token (JWT, for example)
  refreshToken?: string; // Optional if you have refresh logic
  // Add any additional fields (e.g. "expiresIn") as needed
}
