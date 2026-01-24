// vault-ui/src/components/HeaderLabel/HeaderLabel.tsx
import React from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge/badge";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const sizeStyles = {
  sm: "text-lg font-semibold leading-tight",
  md: "text-2xl font-bold leading-tight",
  lg: "text-3xl font-bold leading-tight",
};

export function PageHeader({
  title,
  description,
  subtitle,
  icon,
  tooltip,
  size = "md",
  className,
  children,
}: PageHeaderProps) {
  const actualSubtitle = subtitle || description;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
      <div className="space-y-1 flex-1">
        <h1 className={cn(sizeStyles[size], "tracking-tight")}>{title}</h1>
        {actualSubtitle && (
          <p className="text-sm text-muted-foreground">{actualSubtitle}</p>
        )}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
      {tooltip && (
        <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="sr-only">{tooltip}</span>
        </div>
      )}
    </div>
  );
}
