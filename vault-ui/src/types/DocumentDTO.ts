export interface DocumentDTO {
  id: number;
  title: string;
  summary?: string;
  tags?: string;
  link?: string;

  /**
   * The severity level of this document.
   * e.g. 'low' | 'medium' | 'high' | 'critical'
   *
   * You can use RLS to say "Only managers can read 'critical' docs."
   */
  severityLevel: "low" | "medium" | "high" | "critical";

  /**
   * 'pending' | 'in_progress' | 'completed'
   * RLS can also restrict who can update the doc based on status or role.
   */
  status: "pending" | "in_progress" | "completed";

  /** references projects.id or might be optional if not in a project */
  projectId?: number;

  /** references users.id (the creator) */
  createdBy: number;

  createdAt?: string;
  updatedAt?: string;
}
