import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, ChevronLeft } from "lucide-react";
import { MenuListItems } from "./MenuItems";
import Logo from "@/assets/VAULT_LOGO_ORANGE_NEW.svg";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const RootLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`bg-card text-card-foreground border-r border-border transition-all duration-300 flex flex-col ${
          open ? "w-[240px]" : "w-[60px]"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <ThemeToggle />
          {open && (
            <img
              src={Logo}
              alt="Vault Logo"
              className="h-10 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
          )}
          <button
            type="button"
            onClick={handleDrawerToggle}
            className="p-2 hover:bg-muted rounded text-foreground"
          >
            {open ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <MenuListItems open={open} />
        </nav>

        <div className="border-t border-border py-4" />
      </div>

      <div className="flex-1 overflow-auto bg-background">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
