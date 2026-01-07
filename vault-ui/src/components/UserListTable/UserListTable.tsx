/* eslint linebreak-style: 0 */
import React from "react";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { getCurrentUser } from "../../services/auth/Auth.service";

export interface UserDTO {
  id: string;
  username?: string;
  email?: string;
  createdAt?: string;
}

interface UserListTableProps {
  users: UserDTO[];
  onEdit?(user: UserDTO): void;
  onDelete?(user: UserDTO): void;
}

export function UserListTable({ users, onEdit, onDelete }: UserListTableProps) {
  const currentUser = getCurrentUser();

  const rows = React.useMemo(
    () =>
      users.map((u) => ({
        ...u,
        dateAdded: u.createdAt
          ? moment(u.createdAt).format("DD MMM YYYY")
          : "N/A",
      })),
    [users]
  );

  return (
    <div className="w-full">
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id || index} className="hover:bg-muted/50">
                <TableCell className="font-medium">{row.username}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.dateAdded}</TableCell>
                <TableCell className="text-right space-x-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(row)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this user?")) {
                          onDelete?.(row);
                          toast.success("User deleted");
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {rows.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No users found
        </div>
      )}
    </div>
  );
}
