import * as React from 'react';
import {HTMLAttributes} from 'react';
import {DotLottieReact} from '@lottiefiles/dotlottie-react';
import {HCDancingBotState, HCDancingBotMap} from './HCDancingBot.constants';

export interface HCDancingBotProps extends HTMLAttributes<HTMLDivElement>{
    state: HCDancingBotState;
    speed?: number;
}

export const HCDancingBot = (props: HCDancingBotProps) => {
    const {state = 'default', speed = 0.5} = props;
    const lottieSrc= React.useMemo(() => {
        return HCDancingBotMap[state] ?? HCDancingBotMap.default;
    }, [state]);
    return (
        <div {...props} className={`${props.className ?? ''}`}>
            <DotLottieReact
                src={`data:application/json;base64,${lottieSrc}`}
                loop
                autoplay
                speed={speed}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />
        </div>
    );
};