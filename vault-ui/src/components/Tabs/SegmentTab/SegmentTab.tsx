import React from "react";
import { Box, Stack, useTheme } from "@mui/material";
import { MUITheme } from "generic-components/src/theme";
import { HCButton, HCButtonProps } from "generic-components";

export interface SegmentTabItem {
  label: string;
  render?(): React.ReactNode;
}

export interface SegmentTabProps {
  items: SegmentTabItem[];
  onTabItemChanged?(index: number, item: SegmentTabItem): void;
  activeIndex?: number;
  actions?: HCButtonProps[];
}
export function SegmentTab({
  onTabItemChanged,
  items,
  activeIndex,
  actions,
}: SegmentTabProps) {
  const theme: typeof MUITheme = useTheme();
  const [active, setActive] = React.useState(() => activeIndex ?? 0);

  const activeItem = React.useMemo(() => items[active], [items, active]);

  React.useEffect(() => {
    if (typeof activeIndex !== "undefined") setActive(activeIndex);
  }, [activeIndex]);

  if (!activeItem) return null;
  return (
    <Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: actions ? "1fr max-content" : "1fr",
          gridGap: "16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {items.map((item, index) => {
            const isActive = active === index;

            return (
              <Box
                key={index}
                sx={{
                  minWidth: "150px",
                  py: "13px",
                  px: "31px",
                  textAlign: "center",
                  background: isActive ? theme.palette.primary.main : "#fff",
                  color: isActive ? "#fff" : "#000",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderBottom: isActive ? "" : "solid 0.8px #b2b1b1",
                  borderRight:
                    !isActive && index < items.length - 1
                      ? "solid 0.8px #b2b1b1"
                      : "",
                }}
                onClick={() => {
                  if (onTabItemChanged) onTabItemChanged(index, item);
                  setActive(index);
                }}
              >
                {item.label.toUpperCase()}
              </Box>
            );
          })}
        </Box>
        {actions && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: actions.map(() => "max-content").join(" "),
              gridGap: "16px",
            }}
          >
            {actions.map((item, index) => (
              <HCButton key={index} {...item} />
            ))}
          </Box>
        )}
      </Box>
      {items.map((item, index) => {
        const isActive = active === index;
        if (!item.render) return null;
        return (
          <Stack
            key={index}
            sx={{
              display: !isActive ? "none" : undefined,
              boxShadow: "box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            {item.render()}
          </Stack>
        );
      })}
    </Stack>
  );
}
