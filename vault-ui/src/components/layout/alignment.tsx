import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlignmentProps {
  children: React.ReactNode;
  horizontal?: 'left' | 'center' | 'right' | 'between' | 'around' | 'evenly';
  vertical?: 'top' | 'center' | 'bottom' | 'stretch';
  direction?: 'row' | 'column';
  gap?: number;
  className?: string;
}

const horizontalMap = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const verticalMap = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
  stretch: 'items-stretch',
};

export const Alignment: React.FC<AlignmentProps> = ({
  children,
  horizontal = 'left',
  vertical = 'center',
  direction = 'row',
  gap = 4,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex',
        direction === 'column' ? 'flex-col' : 'flex-row',
        horizontalMap[horizontal],
        verticalMap[vertical],
        \`gap-\${gap}\`,
        className,
      )}
    >
      {children}
    </div>
  );
};

Alignment.displayName = 'Alignment';
