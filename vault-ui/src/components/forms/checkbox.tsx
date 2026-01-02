import * as React from "react";
import { Checkbox as ShadCheckbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CheckBoxSize = "small" | "medium" | "large";
type Variant = "primary" | "secondary" | "neutral";

export interface CheckBoxProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  size?: CheckBoxSize;
  hcVariant?: Variant;
  onChange?: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
}

const sizeMap: Record<CheckBoxSize, string> = {
  small: "h-4 w-4",
  medium: "h-5 w-5",
  large: "h-6 w-6",
};

export const CheckBox = React.forwardRef<HTMLButtonElement, CheckBoxProps>(
  (
    {
      label,
      checked,
      disabled,
      size = "medium",
      hcVariant = "primary",
      onChange,
      required,
      error,
      helperText,
      id,
    },
    ref
  ) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <ShadCheckbox
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            onCheckedChange={onChange}
            className={cn(sizeMap[size], error && "border-destructive")}
            ref={ref}
          />
          {label && (
            <Label
              htmlFor={checkboxId}
              className={cn(
                "cursor-pointer",
                required &&
                  'after:content-["*"] after:ml-0.5 after:text-destructive',
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </Label>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              "text-sm",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

CheckBox.displayName = "CheckBox";
