import {FormControlLabel, FormControlLabelProps, FormLabel, FormLabelProps, useTheme} from '@mui/material';
import * as React from 'react';
import {FontSize, Size} from '../theme';

export interface HCFormLabelProps extends Omit<FormLabelProps, 'sx'>{
    size?: Size;
    textColor?: string;
}
export const HCFormLabel = ({ children, size = 'small', textColor, ...props }: HCFormLabelProps) => {
    const theme = useTheme();
    const fontSize = FontSize[size];
    return (
        <FormLabel {...props} sx={{
            mb: 1.5,
            '&.MuiFormLabel-root': {
                color: textColor ?? theme.textColor.black,
                fontWeight: '700',
                fontSize,
            },
            '&.MuiFormLabel-root.Mui-focused': {
                color: textColor ?? theme.textColor.black
            },
            '&.MuiFormLabel-root.Mui-error .MuiFormLabel-asterisk': {
                color: theme.error.hex
            },
            '&.MuiFormLabel-root .MuiFormLabel-asterisk': {
                color: theme.error.hex
            },
        }}>{children}</FormLabel>
    );
};

export interface HCVerticalFormLabelProps extends Omit<FormControlLabelProps, 'sx'> {
    control: React.ReactElement | JSX.Element;
    label: React.ReactElement | JSX.Element;
    size?: Size;
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline';
    textColor?: string;
}

export const HCVerticalFormLabel = ({ control, size = 'medium', label, alignItems, textColor, ...props }: HCVerticalFormLabelProps) => {
    const theme = useTheme();
    const fontSize = FontSize[size];
    const fontWeight = '700';

    return (
        <FormControlLabel {...props} labelPlacement={'start'} control={control} label={label} sx={{
            '&.MuiFormControlLabel-root': {
                color:  textColor ?? theme.textColor.black,
                fontSize,
                fontWeight,
                mx: 0,
                mt: 1.5,
                display: 'flex',
                alignItems: alignItems ?? 'center',
            },
            '&.MuiFormControlLabel-root .MuiFormControlLabel-label': {
                color: textColor ?? theme.textColor.black,
                fontSize,
                fontWeight,
            },
            '&.MuiFormControlLabel-root.Mui-focused': {
                color: textColor ?? theme.textColor.black
            },
            '&.MuiFormControlLabel-root > span': {
                color: textColor ?? theme.textColor.black,
                fontSize,
                fontWeight,
                mr: 1,
                flex: 1,
            },
            '&.MuiFormControlLabel-root > div': {
                width: '50%',
                fontSize,
            },
            '&.MuiFormControlLabel-root.Mui-error .MuiFormControlLabel-asterisk': {
                color: theme.error.hex
            },
            '&.MuiFormControlLabel-root .MuiFormControlLabel-asterisk': {
                color: theme.error.hex
            },
        }} />
    );
};