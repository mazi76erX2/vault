import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showToggle?: boolean;
}

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      required,
      showToggle = true,
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || "password";

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
          <Input
            id={inputId}
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              error && "border-destructive",
              showToggle && "pr-10",
              className,
            )}
            {...props}
          />
          {showToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
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

PasswordField.displayName = "PasswordField";
