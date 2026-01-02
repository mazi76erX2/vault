import * as React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { _cn } from "@/lib/utils";

export type DancingBotState = "default" | "greeting" | "idling";

export interface DancingBotProps {
  state?: DancingBotState;
  speed?: number;
  className?: string;
}

// These base64 strings should come from your generic-components
// You'll need to copy them from the original HCDancingBot.constants file
const LOTTIE_ANIMATIONS: Record<DancingBotState, string> = {
  default: "BASE64_ENCODED_LOTTIE_JSON_HERE",
  greeting: "BASE64_ENCODED_LOTTIE_JSON_HERE",
  idling: "BASE64_ENCODED_LOTTIE_JSON_HERE",
};

export const DancingBot: React.FC<DancingBotProps> = ({
  state = "default",
  speed = 0.5,
  className,
}) => {
  const lottieSrc = React.useMemo(
    () => LOTTIE_ANIMATIONS[state] ?? LOTTIE_ANIMATIONS.default,
    [state],
  );

  return (
    <div className={className}>
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
