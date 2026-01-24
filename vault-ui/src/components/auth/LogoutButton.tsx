"use client";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog/alert-dialog";
import { Button } from "@/components/ui/button/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu/dropdown-menu";
import { LogOut } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";

interface LogoutButtonProps {
  asChild?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  asChild = false,
}) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthContext();

  const handleConfirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full justify-start gap-2 hover:bg-destructive hover:text-destructive-foreground p-2"
        asChild={asChild}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className="text-sm">Logout</span>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? This will end your current
              session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const LogoutMenuItem: React.FC = () => (
  <DropdownMenuItem
    onSelect={(e) => e.preventDefault()}
    className="cursor-pointer px-2 py-1.5"
  >
    <LogoutButton />
  </DropdownMenuItem>
);
