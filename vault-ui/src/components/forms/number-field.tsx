import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NumberFieldProps {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  showControls?: boolean;
  placeholder?: string;
  className?: string;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      label,
      value,
      onChange,
      min,
      max,
      step = 1,
      disabled,
      required,
      error,
      helperText,
      showControls = true,
      placeholder,
      className,
    },
    ref,
  ) => {
    const handleIncrement = () => {
      const newValue = (value || 0) + step;
      if (max === undefined || newValue <= max) {
        onChange?.(newValue);
      }
    };

    const handleDecrement = () => {
      const newValue = (value || 0) - step;
      if (min === undefined || newValue >= min) {
        onChange?.(newValue);
      }
    };

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label
            className={cn(
              required &&
                'after:content-["*"] after:ml-0.5 after:text-destructive',
            )}
          >
            {label}
          </Label>
        )}
        <div className="flex items-center gap-2">
          {showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={disabled || (min !== undefined && (value || 0) <= min)}
              className="h-10 w-10 shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          <Input
            ref={ref}
            type="number"
            value={value}
            onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              error && "border-destructive",
              showControls && "text-center",
            )}
          />
          {showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && (value || 0) >= max)}
              className="h-10 w-10 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              "text-sm",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

NumberField.displayName = "NumberField";
