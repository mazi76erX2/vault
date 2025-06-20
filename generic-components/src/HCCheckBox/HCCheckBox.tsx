import React from 'react';
import {HCFormControl, HCFormControlBaseProps} from '../HCFormCommon';
import {Checkbox, CheckboxProps, FormControlLabel, SxProps, useTheme} from '@mui/material';
import {CheckBoxSize, CheckBoxSizeStyles, ThemeType, Variant} from '../theme';

export interface HCCheckBoxOption {
    id: string
    label: string,
    checked?: boolean
    disabled?: boolean
}

export type HCCheckBoxSingleType = {
    type: 'single',
    checked?: boolean,
    disabled?: boolean
}

export type HCCheckBoxGroupType = {
    type: 'group',
    options: HCCheckBoxOption[]
    disabled?: boolean
}
export interface HCCheckBoxProps extends Exclude<HCFormControlBaseProps, 'size' | 'labelPlacement'>{
    hcType: HCCheckBoxGroupType | HCCheckBoxSingleType,
    hcVariant: Exclude<Variant, 'tertiary' | 'neutralVariant'>,
    checkBoxProps?: Exclude<CheckboxProps, 'size' | 'onChange' | 'checked'>,
    size?: CheckBoxSize,

    /**
     *
     * @param checked
     * @param item
     */
    onCheckChange?(checked: boolean, item: HCCheckBoxOption): void
}
export const HCCheckBox = React.memo(({ label, required, formControlSx, hcType = { type: 'single' }, onCheckChange, size: propSize = CheckBoxSize.Large, hcVariant = 'primary', checkBoxProps, id, textColor, helperText, errorText, labelPlacement, vertical }: HCCheckBoxProps) => {
    const theme = useTheme();
    const key = hcVariant;

    const checkBoxSizeStyles = React.useMemo(() => CheckBoxSizeStyles[propSize], [propSize]);

    const {  wxh, fontSize } = checkBoxSizeStyles;

    // colors
    const palette = React.useMemo(() => theme.hcPalette[key], [key]);
    const color = React.useMemo(() => palette && palette['500'] && palette['500']['hex'], [palette]);

    const style: SxProps<ThemeType> = {
        ...checkBoxProps?.sx,
        color: theme.textColor.black,
        width: wxh,
        height: wxh,
        marginRight: '8px',
        '& input': {
            width: wxh,
            height: wxh,
        },
        '& svg': {
            width: wxh,
            height: wxh,
        },
        '&.Mui-checked': {
            color: color,
        },
        '&.Mui-disabled': {
            color: theme.hcPalette.secondary['100']!['hex']
        }
    };

    const lblStyle: SxProps<ThemeType> = {
        fontSize,
        color: textColor,
        ml: 0,
        alignItems: 'flex-start',
        '& .MuiFormControlLabel-label': {
            fontSize
        },
        '& span:first-of-type': {
            marginTop: propSize === CheckBoxSize.Large ? '2px' : propSize === CheckBoxSize.Medium ? '1px' : undefined,
        },
    };

    delete checkBoxProps?.checked;

    if (hcType.type === 'single') {
        return (
            <FormControlLabel sx={lblStyle} id={id ?? 'check-box'} control={<Checkbox {...checkBoxProps} sx={style} onChange={({ target }) => {
                if (onCheckChange) onCheckChange(target.checked, {
                    id: id ?? 'check-box',
                    label: label ?? 'check-box-lbl'
                });
            }} checked={hcType.checked ?? false} />} disabled={hcType.disabled} label={label} required={required} />
        );
    }
    return (
        <HCFormControl textColor={textColor} errorText={errorText} helperText={helperText} vertical={vertical} labelPlacement={labelPlacement} formControlSx={formControlSx} id={id} label={label} required={required} input={
            <>
                {hcType.options.map((opt, index) => (
                    <FormControlLabel sx={lblStyle} key={index}  control={
                        <Checkbox {...checkBoxProps} sx={style} disabled={opt.disabled || hcType.disabled} checked={opt.checked ?? false} onChange={({ target }) => {
                            const selected = hcType.options.find((o) => o.id === opt.id);
                            if (selected && onCheckChange) onCheckChange(target.checked, selected);
                        }} />
                    } label={opt.label} />
                ))}
            </>
        } />
    );
});

HCCheckBox.displayName = 'HCCheckBox';