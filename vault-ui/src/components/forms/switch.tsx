import * as React from "react";
import { Switch as ShadSwitch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  required?: boolean;
  helperText?: string;
  id?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { label, checked, disabled, onChange, required, helperText, id, className },
    ref,
  ) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center space-x-2">
          <ShadSwitch
            id={switchId}
            checked={checked}
            disabled={disabled}
            onCheckedChange={onChange}
            ref={ref}
          />
          {label && (
            <Label
              htmlFor={switchId}
              className={cn(
                "cursor-pointer",
                required &&
                  'after:content-["*"] after:ml-0.5 after:text-destructive',
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {label}
            </Label>
          )}
        </div>
        {helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);

Switch.displayName = "Switch";
