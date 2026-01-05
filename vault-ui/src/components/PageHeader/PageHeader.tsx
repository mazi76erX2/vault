import React from "react";
import { Box } from "@mui/material";
import {
  HCButton,
  HCButtonProps,
  HCHeaderLabel,
  HCHeaderLabelProps,
} from "generic-components";
import { Link } from "react-router-dom";

interface PageHeaderActions extends HCButtonProps {
  href?: string;
}
export interface PageHeaderProps {
  title: string;
  tooltip?: string;
  actions?: PageHeaderActions[];
  typographyProps?: HCHeaderLabelProps["typographyProps"];
}
export function PageHeader(props: PageHeaderProps) {
  const { title, actions, typographyProps } = props;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "40px",
      }}
    >
      <HCHeaderLabel
        title={title.toUpperCase()}
        typographyProps={{
          ...(typographyProps || {
            variant: "h1",
          }),
        }}
        infoIcon
      />
      <div
        style={{
          flex: 1,
        }}
      />
      {actions &&
        actions.length > 0 &&
        actions.map((action, index) => {
          const { href, ...buttonProps } = action;
          if (href) {
            return (
              <Link key={index} to={href}>
                <HCButton
                  {...buttonProps}
                  sx={{
                    ml: 2,
                  }}
                />
              </Link>
            );
          }
          return (
            <HCButton
              key={index}
              {...buttonProps}
              sx={{
                ml: 2,
              }}
            />
          );
        })}
    </Box>
  );
}
