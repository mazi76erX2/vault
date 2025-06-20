import React from 'react';
import {HCFormControl, HCFormControlBaseProps} from '../HCFormCommon';
import {SelectProps, Divider, MenuItem, Select, useTheme} from '@mui/material';
import {Theme} from '../theme';
import {KeyboardArrowDown} from '@mui/icons-material';

export interface HCDropDownValue {
    id: string;
    value: string;
}

export interface HCDropDownProps extends HCFormControlBaseProps {
    inputProps?: Exclude<SelectProps, 'onChange' | 'size'>;
    value?: HCDropDownValue;

    onChange?(value?: HCDropDownValue): void;

    options: HCDropDownValue[];
    minWidth?: string | number;
    maxWidth?: string | number;
    showPlaceholder?: boolean;
    removeNoSelection?: boolean;
}

export const HCDropDown = React.memo(({
    removeNoSelection,
    inputProps,
    size = 'medium',
    formControlSx,
    id,
    value,
    onChange,
    options,
    errorText,
    helperText,
    required,
    label,
    labelPlacement,
    vertical,
    textColor,
    minWidth = '150px',
    maxWidth = undefined,
    disabled,
    showPlaceholder
}: HCDropDownProps) => {
    const theme = useTheme();
    const idFor = id ?? inputProps?.id;

    const items: HCDropDownValue[] = React.useMemo(() => {
        const hasAnyEmptyOption = options.filter((o) => o.id === '');
        if (!removeNoSelection) {
            if (hasAnyEmptyOption && hasAnyEmptyOption.length > 0 || options.length === 0) {
                return [{
                    id: '',
                    value: '<No Selection>'
                }, ...options];
            }
        }
        return options;
    }, [options]);

    return (
        <HCFormControl disabled={inputProps?.disabled} textColor={textColor} vertical={vertical}
            formControlSx={formControlSx} {...vertical ? {labelPlacement} : {}} size={size}
            required={required || inputProps?.required} errorText={errorText} label={label} id={idFor}
            helperText={helperText} input={
                <Select
                    {...inputProps}
                    placeholder={inputProps?.placeholder}
                    error={!!errorText}
                    labelId={`${idFor}-select`}
                    id={`${idFor}-select`}
                    value={value?.id ?? ''}
                    disabled={disabled}
                    IconComponent={KeyboardArrowDown}
                    onChange={(e) => {
                        if (!onChange) return;
                        const selected = options.find((o) => o.id === e.target.value);
                        onChange(selected);
                    }}
                    MenuProps={{
                        id: `${idFor}-menu`,
                        PaperProps: {
                            sx: {
                                bgcolor: '#738085',
                                borderRadius: 0,
                                minWidth,
                                maxWidth,
                                '& .MuiMenuItem-root': {
                                    padding: 2,
                                },
                            },
                        },
                    }}
                    sx={{
                        color: showPlaceholder && (value === undefined) ? 'rgba(0, 0, 0, 0.38)' : '',
                        background: theme.hcPalette.neutralVariant['500']!['hex'],
                        minWidth,
                        maxWidth,
                        height: '40px',
                        '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.hcPalette.neutralVariant['500']!['hex'],
                            color: Theme.textColor.black,
                            borderRadius: 0,
                        },
                        '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {},
                        '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.hcPalette.primary['500']!['hex']
                        },
                        '&.MuiOutlinedInput-root.Mui-error  .MuiOutlinedInput-notchedOutline': {
                            borderColor: Theme.error.hex
                        },
                        '&.MuiOutlinedInput-root.MuiOutlinedInput-inputAdornedEnd': {},
                        '& .MuiSvgIcon-root': {
                            color: !disabled ? theme.hcPalette.primary['500']!['hex'] : '#738085'
                        },
                        ...inputProps?.sx,
                    }}
                    displayEmpty={true}
                >
                    {
                        showPlaceholder && inputProps && inputProps.placeholder && <MenuItem sx={{
                            color: theme.textColor.white,
                            height: '30px',
                        }} value="">{inputProps.placeholder}</MenuItem>
                    }
                    {
                        showPlaceholder && inputProps && inputProps.placeholder && <Divider sx={{
                            my: 0,
                            bgcolor: Theme.textColor.white
                        }} variant="middle"/>
                    }
                    {items.map((option, index) => (
                        [
                            <MenuItem
                                value={option.id}
                                key={index}
                                sx={{
                                    color: Theme.textColor.white,
                                    '&.MuiMenuItem-root': {
                                        py: 0,
                                    },
                                    '&.MuiMenuItem-root.Mui-selected': {
                                        bgcolor: theme.hcPalette.secondary['700']
                                    },
                                }}
                                selected={option.id === value?.id}
                            >{option.value}</MenuItem>,
                            ...(index < options.length && index < (options.length - 1)) ? [
                                <Divider key={`${index}-div`} sx={{
                                    my: 0,
                                    bgcolor: Theme.textColor.white
                                }} variant="middle"/>
                            ] : []
                        ]
                    ))}
                </Select>
            }/>
    );
});

HCDropDown.displayName = 'HCDropDown';
