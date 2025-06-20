import * as React from 'react';
import {Button, ButtonProps, SxProps, useTheme} from '@mui/material';
import { Size, Theme, ThemeType, Variant,} from '../theme';

export interface HCButtonProps extends Exclude<ButtonProps, 'size'> {
    /**
     * Text/Label for the button | undefined
     */
    text?: string
    /**
     * Button type: "primary" | "secondary" | "tertiary"
     */
    hcVariant: Exclude<Variant, 'neutral' | 'neutralVariant'>;
    inputButton?: boolean
    size?: Size
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode;
    outlined?: boolean;
}

export const HCButton = React.forwardRef<HTMLButtonElement, HCButtonProps>(({ text, startIcon, inputButton, endIcon, hcVariant = 'primary', sx, disabled, size = 'large', outlined = false, disableElevation = true, ...props }, ref) => {
    const theme = useTheme();

    // control variables
    const key = React.useMemo(() => hcVariant, [hcVariant]);

    const iconOnly = React.useMemo(() => !text && !!startIcon, [startIcon, text]);

    // colors
    const palette = React.useMemo(() => theme.hcPalette[key], [key]);
    const background = React.useMemo(() => palette && palette['500'] && palette['500']['hex'], [palette]);
    const hoverBgColor = React.useMemo(() => palette && palette['300'] && palette['300']['hex'], [palette]);

    // spacings
    const height = React.useMemo(() => size === 'small' ? '40px' : size === 'medium' ? '48px' : '52px', [size]);
    const px = React.useMemo(() => {
        if (iconOnly) {
            return size === 'small' ? 1 : size === 'medium' ? 3.5 : 4;
        }
        return  size === 'small' ? 3 : size === 'medium' ? 3.5 : 4;
    },[size, iconOnly]);
    const py = React.useMemo(() => size === 'small' ? 1.5 : size === 'medium' ? 2 : 2.25,[size]);

    const calculatedSx: SxProps<ThemeType> = () => ({
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: inputButton ? 0 : '5px',
        boxSizing: 'border-box',
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
        ...iconOnly ? {
            minWidth: height as string,
            height,
            ...size === 'small' ? {
                py,
                px
            } : {}
        } : {
            height,
            px,
            py
        },
        ...sx,
    });

    return iconOnly ? (
        <Button
            {...props}
            ref={ref}
            variant={'contained'}
            disableElevation={disableElevation}
            disabled={disabled}
            sx={calculatedSx}
        >
            {startIcon}
        </Button>
    ) : (
        <Button
            {...props}
            ref={ref}
            variant={'contained'}
            disableElevation={disableElevation}
            disabled={disabled}
            sx={calculatedSx}
            startIcon={startIcon}
            endIcon={endIcon}
        >
            {text}
        </Button>
    );
});

HCButton.displayName = 'HCButton';