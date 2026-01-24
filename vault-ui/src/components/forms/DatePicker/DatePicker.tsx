import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/popover";
import { Label } from "@/components/ui/label/label";

// Lazy import Calendar to handle missing component
const Calendar = React.lazy(() =>
  import("@/components/ui/calendar/calendar")
    .then((mod) => ({ default: mod.Calendar }))
    .catch(() => ({
      default: () => (
        <div className="p-4 text-sm text-muted-foreground">
          Calendar component not installed. Run: npx shadcn@latest add calendar
        </div>
      ),
    })),
);

export interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      label,
      value,
      onChange,
      disabled,
      required,
      error,
      helperText,
      placeholder = "Pick a date",
      className,
    },
    ref,
  ) => (
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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              initialFocus
              disabled={disabled}
            />
          </React.Suspense>
        </PopoverContent>
      </Popover>
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

DatePicker.displayName = "DatePicker";
