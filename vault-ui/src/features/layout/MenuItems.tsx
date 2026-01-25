import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Contact,
  Table,
  Palette,
  LayoutDashboard,
  AppWindow,
  CheckCircle,
  Mail,
  Database,
  Upload,
  Search,
} from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface MenuItem {
  to: string;
  title: string;
  icon?: React.ReactElement;
  indexChild?: string;
  subMenu?: MenuItem[];
  shouldHide?: boolean;
}

interface MenuListItemsProps {
  open: boolean;
}

export const MenuListItems: React.FC<MenuListItemsProps> = ({ open }) => {
  const authContext = useAuthContext();
  if (!authContext) return null;

  const { userRoles: contextUserRoles } = authContext;
  let userRoles: string[] = [];

  if (Array.isArray(contextUserRoles) && contextUserRoles.length > 0) {
    userRoles = contextUserRoles;
  }

  const hasRole = (roleName: string): boolean => {
    return userRoles.some((role) =>
      role.toLowerCase().includes(roleName.toLowerCase()),
    );
  };

  const isAdmin = hasRole("Administrator");
  const isCollector = hasRole("Collector");
  const isHelper = hasRole("Helper");
  const isValidator = hasRole("Validator");

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      to: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Organisational Details",
      to: "/users/details",
      icon: <Contact className="w-5 h-5" />,
      shouldHide: !isAdmin,
    },
    {
      title: "User Management",
      to: "/users/management",
      icon: <Table className="w-5 h-5" />,
      shouldHide: !isAdmin,
    },
    {
      title: "Theme",
      to: "/theme/BusinessThemePage",
      icon: <Palette className="w-5 h-5" />,
      shouldHide: !isAdmin,
    },
    {
      title: "Knowledge Base",
      to: "/knowledge-base",
      icon: <Database className="w-5 h-5" />,
      shouldHide: !isAdmin,
      subMenu: [
        {
          title: "Upload Documents",
          to: "/knowledge-base/Upload",
          icon: <Upload className="w-5 h-5" />,
        },
        {
          title: "Browse Documents",
          to: "/knowledge-base/Documents",
          icon: <Search className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Applications",
      to: "/applications/ApplicationsPage",
      icon: <AppWindow className="w-5 h-5" />,
      shouldHide: !isAdmin && !isCollector && !isHelper && !isValidator,
      subMenu: [
        {
          title: "Collector",
          to: "/applications/collector/CollectorMainPage",
          icon: <CheckCircle className="w-5 h-5" />,
          shouldHide: !isAdmin && !isCollector,
        },
        {
          title: "Helper",
          to: "/applications/helper/HelperMainPage",
          icon: <CheckCircle className="w-5 h-5" />,
          shouldHide: !isAdmin && !isHelper,
        },
        {
          title: "Validator",
          to: "/applications/console/ConsoleMainPage",
          icon: <Mail className="w-5 h-5" />,
          shouldHide: !isAdmin && !isValidator,
        },
      ],
    },
  ];

  return (
    <nav className="w-full">
      <ul className="space-y-0">
        {menuItems
          .filter((item) => {
            if (typeof item.shouldHide !== "undefined") return !item.shouldHide;
            return true;
          })
          .map((item, index) => (
            <MenuListItem
              key={index}
              item={item}
              showText={open}
              activeIndex={item.indexChild || item.to}
            />
          ))}

        {/* LOGOUT - Always visible at bottom */}
        {open && (
          <li className="mt-auto p-2 border-t border-border">
            <LogoutButton />
          </li>
        )}
      </ul>
    </nav>
  );
};

interface MenuListItemProps {
  item: MenuItem;
  subItem?: boolean;
  showText?: boolean;
  activeIndex?: string;
  onActiveIndexChanged?: (active?: string) => void;
}

const MenuListItem: React.FC<MenuListItemProps> = ({
  item,
  subItem = false,
  showText = true,
  onActiveIndexChanged,
  activeIndex,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const pathname = location.pathname;
  const isActive = pathname.includes(item.to);

  React.useEffect(() => {
    if (isActive && item.subMenu) {
      setIsExpanded(true);
    }
  }, [isActive, item.subMenu]);

  if (item.shouldHide) return null;

  const handleClick = () => {
    if (onActiveIndexChanged) {
      onActiveIndexChanged(item.indexChild ?? item.to);
    }

    if (item.subMenu) {
      setIsExpanded(!isExpanded);
    } else {
      navigate(item.to);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full flex items-center h-10 transition-all duration-200",
          "hover:bg-muted/50",
          !showText ? "justify-center px-0" : "gap-3 px-4",
          subItem && showText && "px-8",
          isActive && !subItem && "bg-primary text-primary-foreground",
          isActive && subItem && "text-primary font-medium bg-muted",
          !isActive && "text-foreground bg-transparent",
        )}
      >
        {!subItem && item.icon && (
          <span className="min-w-[20px] flex items-center justify-center">
            {item.icon}
          </span>
        )}

        {showText && (
          <span
            className={cn(
              "flex-1 text-left",
              subItem && isActive ? "font-bold" : "text-base",
            )}
          >
            {item.title}
          </span>
        )}

        {item.subMenu && showText && (
          <span className="ml-auto">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        )}
      </button>

      {item.subMenu && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out bg-muted/50",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <ul className="pl-0">
            {item.subMenu.map((subMenu, index) => (
              <MenuListItem
                key={index}
                item={subMenu}
                onActiveIndexChanged={onActiveIndexChanged}
                activeIndex={activeIndex}
                subItem
                showText={showText}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

MenuListItem.displayName = "MenuListItem";

export default MenuListItems;
