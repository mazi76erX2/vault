import {Box, Typography, TypographyProps, useTheme} from '@mui/material';
import * as React from 'react';

interface HCFormErrorProps extends TypographyProps {
    vertical?: boolean;
}

export const HCFormError = ({vertical, ...props }: HCFormErrorProps) => {
    const theme = useTheme();
    const color = theme.error.hex;
    return (
        <Box sx={{
            display: 'flex',
            mt: 1.5,
            ...vertical ? {
                pl: '50%'
            } : {}
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7.33301 8.66665L7.33301 5.99998C7.33301 5.63179 7.63148 5.33331 7.99967 5.33331C8.36786 5.33331 8.66634 5.63179 8.66634 5.99998L8.66634 8.66665C8.66634 9.03484 8.36787 9.33331 7.99968 9.33331C7.63149 9.33331 7.33301 9.03484 7.33301 8.66665Z" fill={color}/>
                <path d="M7.99968 12C8.36787 12 8.66634 11.7015 8.66634 11.3333C8.66634 10.9651 8.36787 10.6666 7.99968 10.6666C7.63149 10.6666 7.33301 10.9651 7.33301 11.3333C7.33301 11.7015 7.63149 12 7.99968 12Z" fill={color}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M7.99968 1.33331C8.50471 1.33331 8.96639 1.61865 9.19225 2.07036L14.5256 12.737C14.7322 13.1503 14.7102 13.6412 14.4672 14.0343C14.2243 14.4274 13.7951 14.6666 13.333 14.6666H2.66634C2.20424 14.6666 1.77508 14.4274 1.53214 14.0343C1.2892 13.6412 1.26711 13.1503 1.47377 12.737L6.80711 2.07036C7.03296 1.61865 7.49465 1.33331 7.99968 1.33331ZM2.66634 13.3333H13.333L7.99968 2.66665L2.66634 13.3333Z" fill={color}/>
            </svg>
            <Typography {...props} variant='caption' sx={{
                color,
                ml: 0.75
            }} />
        </Box>
    );
};