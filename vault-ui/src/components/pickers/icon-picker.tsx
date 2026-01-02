import * as React from "react";
import * as Icons from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type IconName = keyof typeof Icons;

export interface IconPickerProps {
  label?: string;
  value?: IconName;
  onChange?: (icon: IconName) => void;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  className?: string;
}

// Popular icons list
const popularIcons: IconName[] = [
  "User",
  "Settings",
  "Home",
  "Mail",
  "Bell",
  "Calendar",
  "Search",
  "Plus",
  "Minus",
  "X",
  "Check",
  "ChevronDown",
  "ChevronUp",
  "ChevronLeft",
  "ChevronRight",
  "Edit",
  "Trash2",
  "Save",
  "Copy",
  "Download",
  "Upload",
  "Heart",
  "Star",
  "Lock",
];

export const IconPicker: React.FC<IconPickerProps> = ({
  label,
  value,
  onChange,
  disabled,
  required,
  helperText,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filteredIcons = popularIcons.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase()),
  );

  const SelectedIcon = value ? Icons[value] : Icons.Circle;

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

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start"
          >
            <SelectedIcon className="h-4 w-4 mr-2" />
            {value || "Select icon"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
              {filteredIcons.map((iconName) => {
                const Icon = Icons[iconName];
                return (
                  <Button
                    key={iconName}
                    variant={value === iconName ? "default" : "ghost"}
                    size="icon"
                    onClick={() => {
                      onChange?.(iconName);
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

IconPicker.displayName = "IconPicker";
