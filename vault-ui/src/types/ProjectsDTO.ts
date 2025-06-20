/** Represents a row in the `projects` table */


export interface Project {
  id: number;
  name: string;
  description?: string;
  managerId: number; // The user.id of the manager
  createdAt?: string;
  updatedAt?: string;
}
