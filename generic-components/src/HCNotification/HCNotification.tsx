import * as React from 'react';
import {Box, IconButton, SxProps, Typography, useTheme} from '@mui/material';
import {
    CheckOutlined,
    CloseOutlined,
    ErrorOutlineOutlined,
    InfoOutlined,
    WarningAmberOutlined
} from '@mui/icons-material';
import {MUITheme} from '../theme';
import {HCLoader} from '../HCLoader';

export type HCNotificationType = 'success' | 'failure' | 'loading' | 'info' | 'warning' | 'danger';

// type HCNotificationIcons = Record<HCNotificationType, React.ReactNode | React.ReactElement>;
type HCNotificationColors = Record<HCNotificationType, string>;
export interface HCNotificationProps {
    hcVariant: HCNotificationType,
    message: string;
    iconColor?: string;
    fullWidth?: boolean;
    standalone?: boolean;
    onClose?(): void;
}

export const HCNotification = ({hcVariant = 'success', message = '', onClose, iconColor: propColor, fullWidth, standalone}: HCNotificationProps) => {
    const theme: typeof MUITheme = useTheme();

    const renderIcon = () => {
        if (hcVariant === 'success') {
            return (
                <CheckOutlined/>
            );
        } else if (hcVariant === 'failure') {
            return (
                <CloseOutlined/>
            );
        } else if (hcVariant === 'loading') {
            return (
                <HCLoader style={{
                    width: '100%',
                    height: '100%',
                    padding: 8,
                }}/>
            );
        } else if (hcVariant === 'info') {
            return (
                <InfoOutlined/>
            );
        } else if (hcVariant === 'warning') {
            return (
                <WarningAmberOutlined/>
            );
        } else if (hcVariant === 'danger') {
            return (
                <ErrorOutlineOutlined/>
            );
        }
    };

    const colors: HCNotificationColors = React.useMemo(() => {
        return {
            'success':  theme.success['hex'],
            'info': theme.info['hex'],
            'loading': theme.hcPalette.primary['500']!['hex'],
            'warning': theme.hcPalette.primary['500']!['hex'],
            'failure': theme.error['hex'],
            'danger': theme.error['hex'],
        };
    }, []);

    const iconColor = propColor ?? colors[hcVariant];

    const containerStyle: SxProps = {
        py: '22px',
        px: '15px',
        background: '#313131',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'max-content',
        margin: standalone ? undefined : '-4px -10px',
        ...standalone ? {
            mb: '24px'
        } : {},
    };

    const iconStyle: SxProps = {
        minHeight: '38px',
        minWidth: '38px',
        borderRadius: '50%',
        background: theme.textColor.white,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: hcVariant === 'loading' ? theme.hcPalette.primary['500']!['hex'] : iconColor,
    };

    const contentStyle: SxProps = {
        mx: 2,
        ...fullWidth ? {
            flex: 1
        } : {}
    };

    const closeIconStyle: SxProps = {
        ...iconStyle,
        background: '#313131',
        color: theme.textColor.white
    };

    return (
        <Box sx={containerStyle}>
            <Box sx={iconStyle}>
                {renderIcon()}
            </Box>
            <Box sx={contentStyle}>
                <Typography sx={{
                    color: theme.textColor.white,
                    fontSize: '16px',
                    lineHeight: '1.2',
                }}>{message}</Typography>
            </Box>
            {onClose && (
                <IconButton sx={closeIconStyle} onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            )}
        </Box>
    );
};