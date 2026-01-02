import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  ContactPage,
  ExpandLess,
  ExpandMore,
  TableChart,
  ColorLensOutlined,
} from "@mui/icons-material";
import { HCIcon, useHCStyledContext } from "generic-components";
import { useAuthContext } from "@/hooks/useAuthContext";

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

  const userRoles = authContext.user?.user?.roles || [];
  const roles = Array.isArray(userRoles) ? userRoles : [];

  const isAdmin = roles.includes("Administrator");
  const isCollector = roles.includes("Collector");
  const isHelper = isAdmin || roles.includes("Helper");
  const isValidator = isAdmin || roles.includes("Validator");

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      to: "/dashboard",
      icon: <HCIcon icon="Category" />,
    },
    {
      title: "Organisational Details",
      to: "/users/OrganisationDetailsPage",
      icon: <ContactPage />,
      shouldHide: !isAdmin,
    },
    {
      title: "User Management",
      to: "/users/UserManagementPage",
      icon: <TableChart />,
      shouldHide: !isAdmin,
    },
    {
      title: "Theme",
      to: "/theme/BusinessThemePage",
      indexChild: "/theme/BusinessThemePage",
      icon: <ColorLensOutlined />,
      shouldHide: !isAdmin,
    },
    {
      title: "Applications",
      to: "/applications/ApplicationsPage",
      icon: <HCIcon icon="Apps" />,
      shouldHide: !isAdmin && !isCollector && !isHelper && !isValidator,
      subMenu: [
        {
          title: "Collector",
          to: "/applications/collector/CollectorMainPage",
          icon: <HCIcon icon="Check" />,
          shouldHide: !isAdmin && !isCollector,
        },
        {
          title: "Helper",
          to: "/applications/helper/HelperMainPage",
          icon: <HCIcon icon="Check" />,
          shouldHide: !isAdmin && !isHelper,
        },
        {
          title: "Validator",
          to: "/applications/console/ConsoleMainPage",
          icon: <HCIcon icon="Email" />,
          shouldHide: !isAdmin && !isValidator,
        },
      ],
    },
  ];

  return (
    <List sx={{ width: "100%" }}>
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
    </List>
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
  activeIndex: initActiveIndex,
  parent,
}) => {
  if (item.shouldHide) {
    return null;
  }

  const pathname = useLocation().pathname;
  const [activeIndex, setActiveIndex] = React.useState<string | undefined>(
    pathname
  );
  const navigate = useNavigate();
  const theme = useHCStyledContext();

  const isFirstInParent = React.useMemo(() => {
    if (!parent) return true;
    const index = parent.subMenu?.findIndex((i) => i.to === item.to);
    return index === 0;
  }, [parent, item]);

  const isActive = React.useMemo(() => {
    return pathname.includes(item.to);
  }, [pathname, initActiveIndex, activeIndex, parent, isFirstInParent, item]);

  React.useEffect(() => {
    if (activeIndex !== pathname) {
      setActiveIndex(pathname);
    }
  }, [pathname]);

  return (
    <Box>
      <Tooltip title={item.title} placement="right">
        <ListItemButton
          onClick={() => {
            if (onActiveIndexChanged) {
              onActiveIndexChanged(item.indexChild ?? item.to);
            }
            if (item.indexChild) {
              setActiveIndex(item.indexChild);
            }
            navigate(item.to);
          }}
          sx={{
            ...(isActive
              ? {
                  borderLeft: subItem
                    ? undefined
                    : "2px solid " + theme?.hcPalette.primary500!.hex,
                  background: subItem ? undefined : "#313131",
                  color: subItem ? theme!.textColor.black : "#fff",
                }
              : {
                  color: theme!.textColor.black,
                  borderLeft: subItem ? undefined : "2px solid transparent",
                  background: "#fff",
                }),
            height: "40px !important",
            px: showText ? "25px" : subItem ? "32px" : "25px",
            ...(item.subMenu ? { my: 0 } : {}),
            "&:hover": {
              background: isActive ? (subItem ? "#fff" : "#222") : "#fff",
            },
          }}
        >
          {!subItem && (
            <Tooltip title={item.title} placement="right">
              <ListItemIcon
                sx={{
                  color: isActive ? "#fff" : "#000",
                  minWidth: "30px",
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
          )}

          {showText && (
            <ListItemText
              sx={{
                "& span": {
                  fontWeight: subItem && isActive ? "bold" : "normal",
                  fontSize: "16px",
                },
              }}
              primary={item.title}
            />
          )}

          {item.subMenu ? isActive ? <ExpandLess /> : <ExpandMore /> : null}
        </ListItemButton>
      </Tooltip>

      {item.subMenu && (
        <Collapse in={isActive} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
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
          </List>
        </Collapse>
      )}
    </Box>
  );
};
