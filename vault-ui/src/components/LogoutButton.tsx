"use client";
import React from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface LogoutButtonProps {
  asChild?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  asChild = false,
}) => {
  const { logout } = useAuthContext();

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (
      confirm(
        "Are you sure you want to log out? This will end your current session."
      )
    ) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
        // Fallback redirect
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="w-full justify-start gap-2 hover:bg-destructive hover:text-destructive-foreground p-2"
      asChild={asChild}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span className="text-sm">Logout</span>
    </Button>
  );
};

// For DropdownMenu usage
export const LogoutMenuItem: React.FC = () => (
  <DropdownMenuItem asChild className="cursor-pointer px-2 py-1.5">
    <LogoutButton />
  </DropdownMenuItem>
);
