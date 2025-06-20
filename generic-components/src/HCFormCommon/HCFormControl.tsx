import {HCFormLabel, HCVerticalFormLabel} from './HCFormLabel';
import {FormControl, SxProps} from '@mui/material';
import {HCFormError} from './HCFormError';
import {HCFormHelperText} from './HCFormHelperText';
import * as React from 'react';
import {Size} from '../theme';

export interface HCFormControlBaseProps {
    helperText?: string;
    errorText?: string;
    label?: string;
    id?: string;
    required?: boolean;
    vertical?: boolean
    size?: Size;
    labelPlacement?: 'flex-start' | 'flex-end' | 'center' | 'baseline';
    formControlSx?: SxProps;
    textColor?: string;
    disabled?: boolean;
}
export interface HCFormControlProps extends HCFormControlBaseProps{
    id?: string;
    input: React.ReactElement | JSX.Element;
}
export const HCFormControl = ({ input, size, errorText, label, helperText, id, required, vertical, formControlSx: sx, labelPlacement, textColor, disabled}: HCFormControlProps) => {
    return (
        <FormControl disabled={disabled} required={required} sx={{
            mb: 1.5,
            width: '100%',
            fontFamily: '\'Lato\', sans-serif',
            ...sx,
        }}>
            <>
                {vertical ? (
                    <HCVerticalFormLabel textColor={textColor} alignItems={labelPlacement} size={size} required={required} htmlFor={`${id}`} control={input} label={<>{label}</>} />
                ) : (
                    <>
                        {label && <HCFormLabel textColor={textColor} size={size} required={required} error={!!errorText} htmlFor={`${id}`}>{label}</HCFormLabel>}
                        {input}
                    </>
                )}
            </>
            {errorText && <HCFormError vertical={vertical}>{errorText}</HCFormError>}
            {helperText && <HCFormHelperText vertical={vertical} id={id}>{helperText}</HCFormHelperText>}
        </FormControl>
    );
};