import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardButtonProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  selected?: boolean;
}

export const CardButton = React.forwardRef<HTMLDivElement, CardButtonProps>(
  (
    {
      title,
      description,
      icon,
      onClick,
      disabled,
      className,
      children,
      selected,
    },
    ref,
  ) => (
    <Card
      ref={ref}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        disabled && "opacity-50 cursor-not-allowed",
        selected && "ring-2 ring-primary",
        className,
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon && <div className="text-primary shrink-0">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  ),
);

CardButton.displayName = "CardButton";
