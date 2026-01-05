import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button as ShadButton, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HCVariant = "primary" | "secondary" | "tertiary";
type HCSize = "small" | "medium" | "large";

export interface EnhancedButtonProps extends Omit<
  ButtonProps,
  "variant" | "size"
> {
  loading?: boolean;
  loadingText?: string;
  hcVariant?: HCVariant;
  size?: HCSize;
  outlined?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  text?: string;
}

const variantMap: Record<HCVariant, ButtonProps["variant"]> = {
  primary: "default",
  secondary: "secondary",
  tertiary: "outline",
};

const sizeMap: Record<HCSize, ButtonProps["size"]> = {
  small: "sm",
  medium: "default",
  large: "lg",
};

export const Button = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      children,
      text,
      loading,
      loadingText,
      disabled,
      className,
      hcVariant = "primary",
      size = "medium",
      outlined,
      startIcon,
      endIcon,
      ...props
    },
    ref,
  ) => {
    const content = text || children;
    const mappedVariant = outlined ? "outline" : variantMap[hcVariant];
    const mappedSize = sizeMap[size];

    return (
      <ShadButton
        ref={ref}
        disabled={loading || disabled}
        variant={mappedVariant}
        size={mappedSize}
        className={cn(loading && "cursor-not-allowed", className)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && startIcon && <span className="mr-2">{startIcon}</span>}
        {loading ? loadingText || content : content}
        {!loading && endIcon && <span className="ml-2">{endIcon}</span>}
      </ShadButton>
    );
  },
);

Button.displayName = "Button";
