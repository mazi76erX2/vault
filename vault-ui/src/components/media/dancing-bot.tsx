import * as React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";
import { HCDancingBotMap, HCDancingBotState } from "./dancing-bot.constants";

export interface DancingBotProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: HCDancingBotState;
  speed?: number;
}

export const DancingBot: React.FC<DancingBotProps> = ({
  state = "default",
  speed = 0.5,
  className,
  ...props
}) => {
  const lottieSrc = React.useMemo(
    () => HCDancingBotMap[state] ?? HCDancingBotMap.default,
    [state],
  );

  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <DotLottieReact
        src={`data:application/json;base64,${lottieSrc}`}
        loop
        autoplay
        speed={speed}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

DancingBot.displayName = "DancingBot";
