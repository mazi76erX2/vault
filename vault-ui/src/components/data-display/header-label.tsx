import * as React from 'react';
import { cn } from '@/lib/utils';

export interface HeaderLabelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    title: 'text-lg font-semibold',
    subtitle: 'text-sm',
  },
  md: {
    title: 'text-2xl font-bold',
    subtitle: 'text-base',
  },
  lg: {
    title: 'text-3xl font-bold',
    subtitle: 'text-lg',
  },
};

export const HeaderLabel: React.FC<HeaderLabelProps> = ({
  title,
  subtitle,
  icon,
  actions,
  className,
  size = 'md',
}) => {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="text-primary shrink-0 mt-1">{icon}</div>}
        <div className="space-y-1">
          <h1 className={cn(sizeStyles[size].title)}>{title}</h1>
          {subtitle && (
            <p className={cn('text-muted-foreground', sizeStyles[size].subtitle)}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
};

HeaderLabel.displayName = 'HeaderLabel';
