import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CardButtonProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const CardButton = React.forwardRef<HTMLDivElement, CardButtonProps>(
  (
    { title, description, icon, onClick, disabled, className, children },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
            {icon && <div className="text-primary">{icon}</div>}
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
      </Card>
    );
  }
);

CardButton.displayName = "CardButton";
