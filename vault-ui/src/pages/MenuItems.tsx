import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import {
  ContactPage,
  ExpandLess,
  ExpandMore,
  TableChart,
  ColorLensOutlined,
} from "@mui/icons-material";
import { HCIcon, useHCStyledContext } from "generic-components";
import { useAuthContext } from "../hooks/useAuthContext";

interface MenuItem {
  to: string;
  title: string;
  icon?: React.ReactElement;
  indexChild?: string;
  subMenu?: MenuItem[];

  shouldHide?(): boolean;
}

interface MenuListItemsProps {
  open: boolean;
}

const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#908or7neua)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 14.067a1.98 1.98 0 0 1 1.98-1.981h3.17a1.98 1.98 0 0 1 1.98 1.98c0 .657-.531 1.19-1.188 1.19H2.188A1.188 1.188 0 0 1 1 14.065zm1.98-1.189c-.656 0-1.188.532-1.188 1.189 0 .219.178.396.396.396h4.754a.396.396 0 0 0 .396-.396c0-.657-.532-1.189-1.188-1.189H2.98zM4.565 9.005a.704.704 0 1 0 0 1.409.704.704 0 0 0 0-1.409zm-1.408.704a1.409 1.409 0 1 1 2.817 0 1.409 1.409 0 0 1-2.817 0zM15.87 14.067a1.98 1.98 0 0 1 1.98-1.981h3.17a1.98 1.98 0 0 1 1.98 1.98c0 .657-.532 1.19-1.189 1.19h-4.753a1.188 1.188 0 0 1-1.189-1.19zm1.98-1.189c-.657 0-1.189.532-1.189 1.189 0 .219.178.396.397.396h4.753a.396.396 0 0 0 .397-.396c0-.657-.532-1.189-1.189-1.189h-3.17zM19.434 9.005a.704.704 0 1 0 0 1.409.704.704 0 0 0 0-1.409zm-1.408.704a1.409 1.409 0 1 1 2.817 0 1.409 1.409 0 0 1-2.817 0z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.652 15.566c0-1.64 1.33-2.971 2.971-2.971h4.754a2.971 2.971 0 0 1 2.971 2.971c0 .984-.798 1.783-1.782 1.783H8.434a1.783 1.783 0 0 1-1.783-1.783zm2.971-1.783c-.985 0-1.783.798-1.783 1.783 0 .328.266.594.595.594h7.13a.594.594 0 0 0 .595-.594c0-.985-.798-1.783-1.783-1.783H9.623zM12 7.84a1.188 1.188 0 1 0 0 2.378 1.188 1.188 0 0 0 0-2.377zM9.623 9.03a2.377 2.377 0 1 1 4.754 0 2.377 2.377 0 0 1-4.754 0z"
        fill="currentColor"
      />
      <path
        d="M9.623 12.395a3.171 3.171 0 0 0-3.171 3.171h.4c0-1.53 1.24-2.771 2.771-2.771v-.4zm4.754 0H9.623v.4h4.754v-.4zm3.171 3.171a3.171 3.171 0 0 0-3.171-3.171v.4c1.53 0 2.771 1.24 2.771 2.771h.4zm-1.982 1.983a1.983 1.983 0 0 0 1.982-1.983h-.4c0 .874-.708 1.583-1.582 1.583v.4zm-7.131 0h7.13v-.4h-7.13v.4zm-1.983-1.983c0 1.095.888 1.983 1.983 1.983v-.4a1.583 1.583 0 0 1-1.583-1.583h-.4zm1.588 0c0-.874.709-1.583 1.583-1.583v-.4a1.983 1.983 0 0 0-1.983 1.983h.4zm.395.394a.394.394 0 0 1-.395-.394h-.4c0 .439.356.794.795.794v-.4zm7.13 0h-7.13v.4h7.13v-.4zm.395-.394a.394.394 0 0 1-.395.394v.4a.794.794 0 0 0 .795-.794h-.4zm-1.583-1.583c.874 0 1.583.709 1.583 1.583h.4a1.983 1.983 0 0 0-1.983-1.983v.4zm-4.754 0h4.754v-.4H9.623v.4zm1.389-4.954c0-.546.442-.988.988-.988v-.4c-.767 0-1.389.621-1.389 1.388h.4zm.988.989a.989.989 0 0 1-.989-.989h-.4c0 .767.622 1.389 1.389 1.389v-.4zm.989-.989a.988.988 0 0 1-.989.989v.4c.767 0 1.389-.622 1.389-1.389h-.4zM12 8.041c.546 0 .989.442.989.988h.4c0-.767-.622-1.388-1.389-1.388v.4zm0-1.589A2.577 2.577 0 0 0 9.423 9.03h.4c0-1.202.975-2.177 2.177-2.177v-.4zm2.577 2.577A2.577 2.577 0 0 0 12 6.452v.4c1.202 0 2.177.975 2.177 2.177h.4zM12 11.606a2.577 2.577 0 0 0 2.577-2.577h-.4A2.177 2.177 0 0 1 12 11.206v.4zM9.423 9.03A2.577 2.577 0 0 0 12 11.606v-.4A2.177 2.177 0 0 1 9.823 9.03h-.4z"
        fill="#fff"
      />
    </g>
    <defs>
      <clipPath id="908or7neua">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

export const MenuListItems = ({ open }: MenuListItemsProps) => {
  const authContext = useAuthContext();

  if (!authContext) {
    return <></>;
  }

  const { userRoles } = authContext;

  const roles = Array.isArray(userRoles) ? userRoles : [];

  const isAdmin = roles.includes("Administrator");
  const isCollector = roles.includes("Collector");
  const isHelper = isAdmin || roles.includes("Helper");
  const isValidator = isAdmin || roles.includes("Validator");

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      to: "/dashboard",
      icon: <HCIcon icon={"Category"} />,
    },
    {
      title: "Organisational Details",
      to: "/users/OrganisationDetailsPage",
      icon: <ContactPage />,
      shouldHide: () => !isAdmin,
    },
    {
      title: "User Management",
      to: "/users/UserManagementPage",
      icon: <TableChart />,
      shouldHide: () => !isAdmin,
    },
    {
      title: "Theme",
      to: "/theme/BusinessThemePage",
      indexChild: "/theme/BusinessThemePage",
      icon: <ColorLensOutlined />,
      shouldHide: () => !isAdmin,
    },
    // Adding  Applications menu with subpages
    {
      title: " Applications",
      to: "/applications/ApplicationsPage",
      icon: <HCIcon icon={"Apps"} />,
      shouldHide: () => !isAdmin && !(isCollector || isHelper || isValidator),
      subMenu: [
        {
          title: "Collector",
          to: "/applications/collector/CollectorMainPage",
          icon: <HCIcon icon={"Check"} />,
          shouldHide: () => !isAdmin && !isCollector,
        },
        {
          title: "Helper",
          to: "/applications/helper/HelperMainPage",
          icon: <HCIcon icon={"Check"} />,
          shouldHide: () => !isAdmin && !isHelper,
        },
        {
          title: "Validator",
          to: "/applications/console/ConsoleMainPage",
          icon: <HCIcon icon={"Email"} />,
          shouldHide: () => !isAdmin && !isValidator,
        },
      ],
    },
  ];

  return (
    <>
      {menuItems
        .filter((item) => {
          if (typeof item.shouldHide !== "undefined") return !item.shouldHide();
          return true;
        })
        .map((item, index) => {
          return (
            <MenuListItem
              activeIndex={item.indexChild}
              item={item}
              key={index}
              showText={open}
            />
          );
        })}
    </>
  );
};

interface MenuListItemProps {
  item: MenuItem;
  subItem?: boolean;
  showText?: boolean;
  activeIndex?: string;

  onActiveIndexChanged?(active?: string): void;

  parent?: MenuItem;
}

const MenuListItem = ({
  item,
  subItem,
  showText,
  onActiveIndexChanged,
  activeIndex: initActiveIndex,
  parent,
}: MenuListItemProps) => {
  if (item.shouldHide && item.shouldHide()) return null;
  const { pathname } = useLocation();
  const [activeIndex, setActiveIndex] = React.useState<string | undefined>(
    pathname
  );
  const navigate = useNavigate();
  const isFirstInParent = React.useMemo(() => {
    if (!parent) return true;
    const index = parent.subMenu?.findIndex((_item) => _item.to === item.to);
    return index === 0;
  }, [parent, item]);

  const isActive = React.useMemo(() => {
    return pathname.includes(item.to);
  }, [pathname, initActiveIndex, activeIndex, parent, isFirstInParent, item]);

  const { theme } = useHCStyledContext();

  React.useEffect(() => {
    if (activeIndex !== pathname) {
      setActiveIndex(pathname);
    }
  }, [pathname]);

  return (
    <Box
      style={{
        textDecoration: "none",
        display: "block",
      }}
    >
      <ListItemButton
        onClick={() => {
          if (onActiveIndexChanged)
            onActiveIndexChanged(item.indexChild ?? item.to);
          if (item.indexChild) setActiveIndex(item.indexChild);
          navigate(item.to);
        }}
        sx={{
          ...(isActive
            ? {
                borderLeft: subItem
                  ? undefined
                  : `2px solid ${theme?.hcPalette.primary["500"]!["hex"]}`,
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
          ...(item.subMenu
            ? {
                my: 0,
              }
            : {}),
          ":hover": {
            background: isActive ? (subItem ? "#fff" : "#222") : "#fff",
          },
        }}
      >
        {!subItem && (
          <Tooltip title={item.title} placement={"right"}>
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
