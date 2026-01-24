// vault-ui/src/components/StatusLabel/StatusLabel.tsx
import React from "react";
import { Badge } from "@/components/ui/badge/badge";

type StatusLabelType =
  | "success"
  | "info"
  | "warning"
  | "failure"
  | "danger"
  | "loading";

const statusVariants: Record<
  StatusLabelType,
  { variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  success: { variant: "default" },
  info: { variant: "outline" },
  warning: { variant: "secondary" },
  failure: { variant: "destructive" },
  danger: { variant: "destructive" },
  loading: { variant: "secondary" },
};

export interface StatusLabelProps {
  text: string;
  type?: StatusLabelType;
  className?: string;
}

export function StatusLabel({
  text,
  type = "success",
  className,
}: StatusLabelProps) {
  const { variant } = statusVariants[type];

  return (
    <Badge
      variant={variant}
      className={cn("uppercase font-bold text-sm", className)}
    >
      {text}
    </Badge>
  );
}
