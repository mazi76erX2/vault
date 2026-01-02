import * as React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ColorPickerProps {
  label?: string;
  value?: string;
  onChange?: (color: string) => void;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  className?: string;
}

export const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
  ({ label, value = '#000000', onChange, disabled, required, helperText, className }, ref) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
            {label}
          </Label>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              disabled={disabled}
              className="w-full justify-start text-left font-normal"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded border"
                  style={{ backgroundColor: value }}
                />
                <span>{value}</span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <HexColorPicker color={value} onChange={onChange} />
              <HexColorInput
                color={value}
                onChange={onChange}
                className="w-full px-3 py-2 border rounded-md"
                prefixed
              />
            </div>
          </PopoverContent>
        </Popover>
        {helperText && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';
