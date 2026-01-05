import React from "react";
import { Typography, useTheme } from "@mui/material";
import { HCNotificationType } from "generic-components/src/HCNotification/HCNotification";
import { MUITheme } from "generic-components/src/theme";

type StatusLabelType = HCNotificationType;
type StatusLabelColors = Record<HCNotificationType, string>;
export interface StatusLabelProps {
  text: string;
  type?: StatusLabelType;
}
export function StatusLabel(props: StatusLabelProps) {
  const theme: typeof MUITheme = useTheme();

  const { type = "success", text } = props;

  const colors: StatusLabelColors = React.useMemo(
    () => ({
      success: theme.success.hex,
      info: theme.info.hex,
      loading: theme.hcPalette.primary["500"]!.hex,
      warning: theme.hcPalette.primary["500"]!.hex,
      failure: theme.error.hex,
      danger: theme.error.hex,
    }),
    [theme],
  );

  const color = colors[type];

  return (
    <Typography
      sx={{
        fontWeight: "bold",
        fontSize: "16px",
        color,
        textTransform: "capitalize",
      }}
    >
      {text}
    </Typography>
  );
}
