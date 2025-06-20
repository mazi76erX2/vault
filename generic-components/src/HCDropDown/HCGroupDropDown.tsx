import React from 'react';
import {HCFormControl, HCFormControlBaseProps} from '../HCFormCommon';
import {SelectProps, Divider, MenuItem, Select, useTheme} from '@mui/material';
import {Theme} from '../theme';
import {v4 as uuid4} from 'uuid';
import {KeyboardArrowDown} from '@mui/icons-material';
import {HCDropDownValue} from './HCDropDown';

export interface HCGroupDropDownProps extends HCFormControlBaseProps{
    inputProps?: Exclude<SelectProps, 'onChange' | 'size'>
    value?: HCDropDownValue
    onChange?(value?: HCDropDownValue): void
    groupOptions: Record<string, HCDropDownValue[]>;
    minWidth?: string | number;
    maxWidth?: string | number;
    showPlaceholder?: boolean;
    id: string;
}
export const HCGroupDropDown = React.memo(({ inputProps, size = 'medium', formControlSx, id = uuid4(), value, onChange, errorText, helperText, required, label, labelPlacement, vertical, textColor, minWidth = '150px', maxWidth = undefined, disabled, showPlaceholder, groupOptions }: HCGroupDropDownProps) => {
    const theme = useTheme();

    const idFor = id ?? inputProps?.id;

    const getItems = () => {
        const list: HCDropDownValue[] = [];
        Object.keys(groupOptions).forEach((item) => {
            groupOptions[item].forEach((btn) => list.push(btn));
        });
        return list;
    };

    const setLabel = (item?: HCDropDownValue) => {
        try {
            const label = document.querySelector(`#${idFor}-select > span`);
            if (label && item) label.innerHTML = item?.value;
        } catch (e) {
            console.log(e);
        }
    };

    React.useEffect(() => {
        setLabel(value);
    }, [value]);

    React.useEffect(() => {
        setLabel(value);
    }, []);

    return (
        <HCFormControl disabled={inputProps?.disabled} textColor={textColor} vertical={vertical} formControlSx={formControlSx} {...vertical ? { labelPlacement } : {}} size={size} required={required || inputProps?.required} errorText={errorText} label={label} id={idFor} helperText={helperText} input={
            <Select
                {...inputProps}
                key={value?.id ?? idFor}
                placeholder={inputProps?.placeholder}
                error={!!errorText}
                labelId={`${idFor}-select`}
                id={`${idFor}-select`}
                value={value?.id ?? ''}
                disabled={disabled}
                IconComponent={KeyboardArrowDown}
                MenuProps={{
                    id: `${idFor}-menu`,
                    PaperProps: {
                        sx: {
                            bgcolor: '#738085',
                            borderRadius: 0,
                            minWidth,
                            maxWidth,
                            px: 2,
                            '& .MuiMenuItem-root': {
                                px: 2,
                            },
                        },
                    },
                }}
                onChange={(e) => {
                    if (!onChange) return;
                    const selected = getItems().find((o) => o.id === e.target.value);
                    onChange(selected);
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
                    '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {

                    },
                    '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.hcPalette.primary['500']!['hex']
                    },
                    '&.MuiOutlinedInput-root.Mui-error  .MuiOutlinedInput-notchedOutline': {
                        borderColor: Theme.error.hex
                    },
                    '&.MuiOutlinedInput-root.MuiOutlinedInput-inputAdornedEnd': {

                    },
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
                    }} variant='middle'/>
                }
                {Object.keys(groupOptions).map((groupKey) => {
                    const groupItems = groupOptions[groupKey];
                    return (
                        [
                            <li key={groupKey}>{groupKey}</li>,
                            ...groupItems.map((option, index) => (
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
                                        onClick={() => {
                                            setLabel(option);
                                            onChange && onChange(option);
                                        }}
                                        selected={option.id === value?.id}
                                    >{option.value}</MenuItem>,
                                    ...(index < groupItems.length && index < (groupItems.length - 1)) ? [
                                        <Divider key={`${index}-div`} sx={{
                                            my: 0,
                                            bgcolor: Theme.textColor.white
                                        }} variant='middle'/>
                                    ] : []
                                ]
                            )),
                        ]
                    );
                })}
            </Select>
        } />
    );
});

HCGroupDropDown.displayName = 'HCGroupDropDown';