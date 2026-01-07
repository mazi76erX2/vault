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
} from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { cn } from "@/lib/utils";

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

  const { user: loginResponse, userRoles: contextRoles } = authContext;

  let userRoles: string[] = [];

  if (Array.isArray(contextRoles) && contextRoles.length > 0) {
    userRoles = contextRoles;
  } else if (
    loginResponse?.user?.roles &&
    Array.isArray(loginResponse.user.roles)
  ) {
    userRoles = loginResponse.user.roles;
  } else if (loginResponse?.roles && Array.isArray(loginResponse.roles)) {
    userRoles = loginResponse.roles;
  }

  const isAdmin = userRoles.includes("Administrator");
  const isCollector = userRoles.includes("Collector");
  const isHelper = isAdmin || userRoles.includes("Helper");
  const isValidator = isAdmin || userRoles.includes("Validator");

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      to: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Organisational Details",
      to: "/users/OrganisationDetailsPage",
      icon: <Contact className="w-5 h-5" />,
      shouldHide: !isAdmin,
    },
    {
      title: "User Management",
      to: "/users/UserManagementPage",
      icon: <Table className="w-5 h-5" />,
      shouldHide: !isAdmin,
    },
    {
      title: "Theme",
      to: "/theme/BusinessThemePage",
      indexChild: "/theme/BusinessThemePage",
      icon: <Palette className="w-5 h-5" />,
      shouldHide: !isAdmin,
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
            if (typeof item.shouldHide !== "undefined") {
              return !item.shouldHide;
            }
            return true;
          })
          .map((item, index) => (
            <MenuListItem
              activeIndex={item.indexChild}
              item={item}
              key={index}
              showText={open}
            />
          ))}
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
  parent?: MenuItem;
}

const MenuListItem: React.FC<MenuListItemProps> = ({
  item,
  subItem,
  showText,
  onActiveIndexChanged,
  activeIndex: _initActiveIndex,
  parent,
}) => {
  const { pathname } = useLocation();
  const [activeIndex, setActiveIndex] = React.useState<string | undefined>(
    pathname
  );
  const [isExpanded, setIsExpanded] = React.useState(false);
  const navigate = useNavigate();

  const _isFirstInParent = React.useMemo(() => {
    if (!parent) return true;
    const index = parent.subMenu?.findIndex((i) => i.to === item.to);
    return index === 0;
  }, [parent, item]);

  const isActive = React.useMemo(
    () => pathname.includes(item.to),
    [pathname, item.to]
  );

  React.useEffect(() => {
    if (activeIndex !== pathname) {
      setActiveIndex(pathname);
    }
    if (isActive && item.subMenu) {
      setIsExpanded(true);
    }
  }, [pathname, isActive, activeIndex, item.subMenu]);

  if (item.shouldHide) {
    return null;
  }

  const handleClick = () => {
    if (onActiveIndexChanged) {
      onActiveIndexChanged(item.indexChild ?? item.to);
    }
    if (item.indexChild) {
      setActiveIndex(item.indexChild);
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
          "w-full flex items-center gap-3 h-10 transition-all duration-200",
          "hover:bg-muted/50",
          showText ? "px-6" : subItem ? "px-8" : "px-6",
          isActive && !subItem && "bg-primary text-primary-foreground",
          isActive && subItem && "text-primary font-medium bg-muted",
          !isActive && "text-foreground bg-transparent"
        )}
        title={item.title}
      >
        {!subItem && item.icon && (
          <span
            className={cn(
              "min-w-[20px] flex items-center justify-center",
              "currentColor"
            )}
          >
            {item.icon}
          </span>
        )}

        {showText && (
          <span
            className={cn(
              "flex-1 text-left text-base",
              subItem && isActive && "font-bold"
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
            "overflow-hidden transition-all duration-300 ease-in-out bg-black/5 dark:bg-white/5",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <ul className="pl-0">
            {item.subMenu.map((subMenu, index) => (
              <MenuListItem
                parent={item}
                onActiveIndexChanged={(active) => setActiveIndex(active)}
                activeIndex={activeIndex}
                subItem
                item={subMenu}
                showText={showText}
                key={index}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export default MenuListItems;
