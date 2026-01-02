import * as React from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

export interface DancingBotProps {
  animationData?: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

export const DancingBot: React.FC<DancingBotProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  className,
  size = 'md',
}) => {
  // Default loading animation if no animation data provided
  const defaultAnimation = {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: 'Loading',
    ddd: 0,
    assets: [],
    layers: [],
  };

  return (
    <div className={cn('flex items-center justify-center', sizeMap[size], className)}>
      <Lottie
        animationData={animationData || defaultAnimation}
        loop={loop}
        autoplay={autoplay}
      />
    </div>
  );
};

DancingBot.displayName = 'DancingBot';
