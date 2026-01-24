import * as React from "react";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea/textarea";
import { Label } from "@/components/ui/label/label";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onAction?: () => void;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      multiline,
      rows = 4,
      required,
      startIcon,
      endIcon,
      onAction,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2 w-full">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              required &&
                'after:content-["*"] after:ml-0.5 after:text-destructive',
            )}
          >
            {label}
          </Label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}

          {multiline ? (
            <Textarea
              id={inputId}
              rows={rows}
              className={cn(
                error && "border-destructive focus-visible:ring-destructive",
                startIcon && "pl-10",
                endIcon && "pr-10",
                className,
              )}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <Input
              id={inputId}
              ref={ref}
              className={cn(
                error && "border-destructive focus-visible:ring-destructive",
                startIcon && "pl-10",
                endIcon && "pr-10",
                className,
              )}
              {...props}
            />
          )}

          {endIcon && !onAction && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}

          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
            >
              {endIcon}
            </button>
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

TextField.displayName = "TextField";
