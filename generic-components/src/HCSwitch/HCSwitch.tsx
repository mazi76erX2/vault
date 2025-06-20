import {SwitchProps} from '@mui/material';
import React from 'react';
import {StyledHCSwitch} from './HCSwitch.styles';

export interface HCSwitchProps extends SwitchProps{}
export const HCSwitch = React.memo((props: HCSwitchProps) => {
    return (
        <StyledHCSwitch {...props}  />
    );
});

HCSwitch.displayName = 'HCSwitch';