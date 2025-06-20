import * as React from 'react';
import {Paper, PaperProps, SxProps, useTheme} from '@mui/material';
import {MUITheme, Theme, ThemeType, Variant} from '../theme';

export interface HCCardButtonProps extends PaperProps {
    /**
     * Button type: "primary" | "secondary" | "tertiary"
     */
    hcVariant: Exclude<Variant, 'neutral' | 'neutralVariant'>;
    outlined?: boolean;
    children?: React.ReactNode;
}

export const HCCardButton = React.memo(({hcVariant = 'primary', sx, outlined = false, elevation = 0, ...props}: HCCardButtonProps) => {
    const theme: typeof MUITheme= useTheme();

    // control variables
    const key = React.useMemo(() => hcVariant, [hcVariant]);

    // colors
    const palette = React.useMemo(() => theme.hcPalette[key], [key]);
    const background = React.useMemo(() => palette && palette['500'] && palette['500']['hex'], [palette]);
    const hoverBgColor = React.useMemo(() => palette && palette['300'] && palette['300']['hex'], [palette]);

    const calculatedSx: SxProps<ThemeType> = () => ({
        fontSize: '16px',
        fontWeight: '500',
        borderRadius: '5px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        ...outlined ? {
            color: background,
            background: '#fff',
            borderColor: background,
            borderWidth: '2px',
            borderStyle: 'solid'
        } : {
            background,
            color: Theme.textColor.white
        },
        ':hover': {
            ...outlined ? {
                background,
                color: Theme.textColor.white,
            } : {
                background: hoverBgColor
            }
        },
        ':disabled': {
            background: theme.hcPalette.neutral['100']!['hex'],
            color: Theme.textColor.white,
            cursor: 'not-allowed'
        },
        p: 2,
        ...sx,
    });

    return (
        <Paper {...props} sx={calculatedSx} role={'button'} elevation={elevation} />
    );
});

HCCardButton.displayName = 'HCCardButton';