import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export interface StepTabItem {
  label: string;
  render(): React.ReactNode;
}

export interface StepTabProps {
  items: StepTabItem[];
  onTabItemChanged?(index: number, item: StepTabItem): void;
  activeIndex?: number;
  noSubHeaders?: boolean;
}

export function StepTab({
  onTabItemChanged,
  items,
  activeIndex,
  noSubHeaders,
}: StepTabProps) {
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
          display: "flex",
          alignItems: "center",
          mb: 4.4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            mr: 2,
            fontWeight: "bold",
            minWidth: "117px",
          }}
        >
          STEP {active + 1} OF {items.length}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {items.map((item, index) => {
            const isActive = active >= index;
            return (
              <Box
                key={index}
                sx={{
                  border: "1px solid #000",
                  minWidth: "245px",
                  textAlign: "center",
                  mr: 1,
                  borderRadius: "20px",
                  cursor: "pointer",
                  background: isActive ? "#000" : "",
                  color: isActive ? "#fff" : "#000",
                }}
                onClick={() => {
                  if (onTabItemChanged) onTabItemChanged(index, item);
                  setActive(index);
                }}
              >
                {index + 1}
              </Box>
            );
          })}
        </Box>
      </Box>
      {!noSubHeaders && (
        <Typography
          variant="h2"
          sx={{
            mb: 4.4,
            fontWeight: "bold",
          }}
        >
          {activeItem.label.toUpperCase()}
        </Typography>
      )}

      {items.map((item, index) => {
        const isActive = active === index;
        if (!item.render) return null;
        return (
          <Stack
            key={index}
            sx={{
              display: !isActive ? "none" : undefined,
            }}
          >
            {item.render()}
          </Stack>
        );
      })}
    </Stack>
  );
}
