import * as React from 'react';
import {Box, Stack, styled, useMediaQuery} from '@mui/material';
import {HCDancingBot} from 'generic-components';
import {HCDancingBotState} from 'generic-components/src/HCDancingBot/HCDancingBot.constants';
import {drawerWidth} from '../utils';

interface DancingBotGridComponentMaintenanceProps {
    botState: HCDancingBotState;
    children?: React.ReactNode;
    titleGap?: string;
    botFixed?: boolean;
}

const BotContainer = styled('div')({
    width: '100%',
    display: 'flex',
    position: 'relative',
});

const ContentContainer = styled(Stack)({
    marginTop: '100px',
    width: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    transform: 'translateX(-50%)',
    position: 'fixed',
    left: `calc(${drawerWidth}px + (100% - ${drawerWidth}px)/2)`,
    height: '100%',
    placeContent: 'center',
});

export function DancingBotGridComponentMiddle(props: DancingBotGridComponentMaintenanceProps) {
    const isHeightLessThan700 = useMediaQuery(' screen and (max-height: 700px)');
    const isHeightLessThan800 = useMediaQuery(' screen and (max-height: 800px)');
    const height = isHeightLessThan700 ? '50vh' : isHeightLessThan800 ? '60vh' : '360px';
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: `${drawerWidth}px calc(100% - ${drawerWidth}px)`,
        }}>
            {/* Left Part (Robot Image) */}
            <BotContainer>
                <Box sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: `calc(${drawerWidth + 150}px + (100% - ${drawerWidth}px)/2)`,
                    transform: 'translateX(-50%)',
                    width:`${drawerWidth}px`,
                    top: 0,
                    display: 'flex',
                    placeItems: 'center',
                    scale: 2,
                }}>
                    <HCDancingBot style={{
                        height,
                        width:`${drawerWidth}px`,
                    }} state={props.botState} />
                </Box>
            </BotContainer>
            <ContentContainer style={{
                gap: props.titleGap ? props.titleGap : '5vh',
            }}>
                {props.children}
            </ContentContainer>
        </Box>
    );
}