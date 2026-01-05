import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface TagSelectionProps {
  label?: string;
  tags: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
}

export const TagSelection: React.FC<TagSelectionProps> = ({
  label,
  tags,
  onChange,
  placeholder = "Add tag...",
  maxTags,
  disabled,
  required,
  helperText,
  error,
  className,
}) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (maxTags && tags.length >= maxTags) return;
      if (!tags.includes(inputValue.trim())) {
        onChange?.([...tags, inputValue.trim()]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange?.(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange?.(tags.filter((tag) => tag !== tagToRemove));
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

      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={
            disabled || (maxTags !== undefined && tags.length >= maxTags)
          }
          className="flex-1 border-0 p-0 h-6 min-w-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
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
};

TagSelection.displayName = "TagSelection";
