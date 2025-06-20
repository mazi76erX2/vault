/** Represents a row in the `users` table */

/** A link row in `user_roles` table: which user has which role */
export interface UserRoleDTO {
  userId: number;
  role: Role;
}

export type Role = 'manager' | 'reviewer' | 'collector' | 'admin';

export interface UserDTO {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  createdAt?: string; // or Date
  updatedAt?: string; // or Date
}
