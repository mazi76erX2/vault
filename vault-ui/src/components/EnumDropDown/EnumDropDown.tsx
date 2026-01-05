import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface EnumOption {
  label: string;
  value: string | number;
}

export interface EnumDropDownProps {
  label?: string;
  placeholder?: string;
  options: EnumOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const EnumDropDown = React.forwardRef<
  HTMLButtonElement,
  EnumDropDownProps
>(
  (
    {
      label,
      placeholder = "Select an option",
      options,
      value,
      onChange,
      error,
      helperText,
      required,
      disabled,
      className,
    },
    ref,
  ) => (
    <div className={cn("space-y-2 w-full", className)}>
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
      <Select
        value={value?.toString()}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          className={cn(error && "border-destructive focus:ring-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

EnumDropDown.displayName = "EnumDropDown";
