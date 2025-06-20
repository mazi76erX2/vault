import * as React from 'react';
import {
    Box,
    OutlinedInput,
    OutlinedInputProps, useTheme
} from '@mui/material';
import {HCFormControl, HCFormControlBaseProps} from '../HCFormCommon';
import {HCButton, HCButtonProps} from '../HCButton';
import {InputHTMLAttributes, Ref} from 'react';

export interface HCTextFieldAction extends HCButtonProps{}
export type HCTextFieldInputOptions = Exclude<OutlinedInputProps, 'size' | 'onChange'> & InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; }
export interface HCTextFieldProps extends HCFormControlBaseProps{
    type: 'text' | 'textArea' | 'numberField',
    value?: unknown,
    onChange?(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void;
    inputProps?: HCTextFieldInputOptions;
    action?: HCTextFieldAction;
    startAction?: HCTextFieldAction;
    password?: boolean;
    inputPadding?: string | number;
    height?: string | number;
    disabled?: boolean;
    stopPropagation?: boolean;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
}

export const HCTextField = React.memo(({ inputProps: initInputProps, formControlSx, onChange, value, required, stopPropagation, inputPadding, size = 'medium', id: propId, type = 'text', label, errorText, helperText, action, password, vertical, height = '40px', labelPlacement, textColor, disabled, startAction, onKeyDown }: HCTextFieldProps) => {
    const theme = useTheme();
    const { id: inputPropId, endAdornment } = initInputProps ?? {};
    const hasError = !!errorText;
    const hasAction = !!action;

    const inputProps: HCTextFieldInputOptions = React.useMemo(() => {
        return {
            ...initInputProps,
            className: type === 'numberField' ? `${initInputProps?.className ?? ''} hcp-number-input` : initInputProps?.className,
            inputProps: {
                ...initInputProps?.inputProps,
                className: type === 'numberField' ? `${initInputProps?.inputProps?.className ?? ''} hcp-number-input` : initInputProps?.inputProps?.className
            }
        };
    }, [type, initInputProps]);

    const id = propId ?? inputPropId;

    return (
        <HCFormControl disabled={disabled} textColor={textColor} formControlSx={formControlSx} vertical={vertical} {...vertical ? { labelPlacement } : {}} size={size} required={required || inputProps?.required} errorText={errorText} label={label} id={id} helperText={helperText}
            input={
                <OutlinedInput {...type === 'textArea' ? {
                    rows: 4
                }: {}} {...inputProps} {...password ? {
                    type: 'password'
                } : {}} {...type === 'numberField' ? {
                    type: 'number',
                } : {}} error={hasError} sx={{
                    ...inputProps?.sx,
                    ...type !== 'textArea' ? {
                        height,
                    } : {},
                    fontSize: '14px',
                    position: 'relative',
                    borderRadius: 0,
                    background: theme.hcPalette.neutralVariant['500']!['hex'],
                    ...hasAction ? {
                        paddingRight: '2px'
                    } : {},
                    ...startAction ? {
                        paddingLeft: 0,
                    } : {},
                    '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
                        color: theme.textColor.black,
                        borderRadius: 0,
                        ...hasAction ? {
                            paddingRight: '8px'
                        } : {},
                    },
                    '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {

                    },
                    '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.hcPalette.primary['500']!['hex']
                    },
                    '&.MuiOutlinedInput-root.Mui-error  .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.error.hex
                    },
                    '&.MuiOutlinedInput-root.MuiOutlinedInput-inputAdornedEnd': {

                    },
                    '& input': {
                        padding: inputPadding ?? '10px 5px 10px 12px'
                    },
                    '& textarea': {
                        padding: inputPadding,
                    }
                }} id={id} multiline={type === 'textArea'} onChange={onChange} value={value}
                onKeyDown={stopPropagation ? (event) => event.stopPropagation() : onKeyDown}
                startAdornment={ startAction ? (
                    <Box sx={{
                        width: '40px',
                        height: '40px',
                    }}>
                        <HCButton inputButton {...startAction} sx={{
                            borderRadius: 0,
                            ...startAction?.sx,
                        }} hcVariant='secondary' size={'small'} /></Box>
                ) : inputProps.startAdornment }
                endAdornment={
                    hasAction ? <HCButton inputButton {...action} sx={{
                        borderRadius: 0,
                        marginRight: '-2px',
                        ...action?.sx,
                    }} hcVariant='secondary' size={'small'} /> : endAdornment
                }
                />
            }
        />
    );
});

HCTextField.displayName = 'HCTextField';
