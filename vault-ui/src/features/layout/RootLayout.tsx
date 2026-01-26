import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, ChevronLeft } from "lucide-react";
import { MenuListItems } from "./MenuItems";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const RootLayout: React.FC = () => {
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col z-20 ${
          open ? "w-[260px]" : "w-[72px]"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-xl">
                V
              </span>
            </div>
            {open && (
              <span className="font-bold text-xl tracking-tight whitespace-nowrap text-sidebar-foreground">
                Vault
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleDrawerToggle}
            className="p-2 hover:bg-sidebar-accent rounded-xl text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            {open ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
          <MenuListItems open={open} />
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-4">
          <div
            className={cn(
              "flex items-center",
              open ? "justify-between" : "justify-center",
            )}
          >
            {open && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Theme
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        <main className="max-w-6xl mx-auto min-h-full flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
