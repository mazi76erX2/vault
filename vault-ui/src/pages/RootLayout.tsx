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
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white transition-all duration-300 flex flex-col ${
          open ? "w-[240px]" : "w-[60px]"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
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
            className="p-2 hover:bg-gray-800 rounded"
          >
            {open ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <MenuListItems open={open} />
        </nav>

        {/* Footer - removed ExternalMenuItems since it was removed from imports */}
        <div className="border-t border-gray-700 py-4">
          {/* Add footer content here if needed, or remove this div entirely */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
