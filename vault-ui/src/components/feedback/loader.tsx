import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoaderProps {
  size?: LoaderSize;
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeMap: Record<LoaderSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className, text, fullScreen }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size], className)} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

Loader.displayName = 'Loader';
