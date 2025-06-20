import React from 'react';
import {Color} from 'react-color';
import {Box, SxProps, useTheme} from '@mui/material';
import {ThemeType} from '../../theme';
import {HCButton} from '../../HCButton';
import {Palette} from '@mui/icons-material';
import {HCFormControl, HCFormControlBaseProps} from '../../HCFormCommon';
import HCOpacityPreview from './HCOpacityPreview';

interface HCColorTriggerProps extends HCFormControlBaseProps{
    onClick(e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>): void;
    selectedColor?: Color;
    sx?: SxProps<ThemeType>;
    customIcon?: React.ReactNode;
    useSelectedAsBackground?: boolean;
    isDefault?: boolean;
    fallbackBackgroundColor?: string;
    marginRight?: string;
    marginLeft?: string;
    disabled?: boolean;
    useThemeAsBackground?:boolean;
}

export const HCColorTrigger = React.forwardRef<HTMLButtonElement, HCColorTriggerProps>((
    { onClick, selectedColor: background, formControlSx, sx, id, required, label, errorText, helperText, labelPlacement, size, vertical, customIcon = <Palette />, useSelectedAsBackground=false, isDefault=true, fallbackBackgroundColor='#fff', marginRight='0px', marginLeft='0px', disabled=false, useThemeAsBackground=true}: HCColorTriggerProps, ref
) => {
    const theme = useTheme();

    const handleClick = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
        if(!disabled) return onClick(e as React.MouseEvent<HTMLButtonElement>);
        e.preventDefault();
        e.stopPropagation();
        return;
    };

    const backgroundColor = isDefault ? (useThemeAsBackground ? theme.hcPalette.neutralVariant['500']!['hex'] : background as string):
        (useSelectedAsBackground ? background as string : fallbackBackgroundColor);

    return (
        <HCFormControl vertical={vertical} size={size} formControlSx={formControlSx} {...vertical ? { labelPlacement } : {}} id={id} label={label} required={required} errorText={errorText} helperText={helperText} input={
            <Box sx={{
                height: '40px',
                display: 'flex',
                background: backgroundColor,
                alignItems: 'center',
                ...sx,
                ...errorText ? {
                    borderColor: theme.error.hex,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                } : {}
            }}>
                <Box style={{
                    height: useThemeAsBackground ? '22px' : '100%',
                    marginRight: useThemeAsBackground ? '8px' : '0px',
                    marginLeft: useThemeAsBackground ? '8px' : '0px',
                    flex: 1,
                }}
                >
                    <HCOpacityPreview handleOnClick={handleClick}  isDefault={isDefault} color={background as string}/>
                </Box>
                <HCButton 
                    ref={ref}
                    inputButton sx={{
                    marginRight: marginRight,
                    marginLeft: marginLeft,
                    borderRadius: 0,
                    cursor: disabled ? 'not-allowed':'pointer',
                    backgroundColor: isDefault ? theme.hcPalette.primary: disabled ? 'transparent' : fallbackBackgroundColor,
                    ':hover': {
                        backgroundColor: isDefault ? '#F5AF67' : fallbackBackgroundColor,
                    }
                }} onClick={(e)=>handleClick(e)} hcVariant={'primary'} startIcon={(customIcon as unknown as React.ReactNode)} size={'small'} />
            </Box>
        } />
    );
});
HCColorTrigger.displayName = 'HCColorTrigger';
