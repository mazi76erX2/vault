import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface RadioOption {
  id: string;
  label: string;
  disabled?: boolean;
}

type RadioSize = "small" | "medium" | "large";

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: RadioSize;
  orientation?: "horizontal" | "vertical";
  required?: boolean;
  error?: string;
  helperText?: string;
}

const sizeMap: Record<RadioSize, string> = {
  small: "h-4 w-4",
  medium: "h-5 w-5",
  large: "h-6 w-6",
};

export const RadioButtonGroup = React.forwardRef<
  HTMLDivElement,
  RadioGroupProps
>(
  (
    {
      label,
      options,
      value,
      onChange,
      disabled,
      size = "medium",
      orientation = "vertical",
      required,
      error,
      helperText,
    },
    ref,
  ) => (
    <div className="space-y-3" ref={ref}>
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
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className={cn(
          orientation === "horizontal" && "flex flex-row space-x-4",
        )}
      >
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.id}
              id={option.id}
              disabled={option.disabled || disabled}
              className={sizeMap[size]}
            />
            <Label
              htmlFor={option.id}
              className={cn(
                "cursor-pointer",
                (option.disabled || disabled) &&
                  "cursor-not-allowed opacity-50",
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
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
  ),
);

RadioButtonGroup.displayName = "RadioButtonGroup";
