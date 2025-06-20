import * as React from 'react';
import {HCFormControl, HCFormControlBaseProps} from '../HCFormCommon';
import {FormControlLabel, Radio, RadioGroup, RadioProps, SxProps, useTheme} from '@mui/material';
import {CheckBoxSize, CheckBoxSizeStyles, ThemeType, Variant} from '../theme';

export interface HCRadioButtonOption {
    id: string | number
    label: string,
    disabled?: boolean
}

export type HCRadioButtonSingleType = {
    type: 'single',
    checked?: boolean
    disabled?: boolean
    onRadioSelect?(item: HCRadioButtonOption): void,
}

export type HCRadioButtonGroupType = {
    type: 'group',
    options: HCRadioButtonOption[]
    defaultValue: HCRadioButtonOption
    name: string
    disabled?: boolean
    row?: boolean
}
export interface HCRadioButtonProps extends  Exclude<HCFormControlBaseProps, 'size' | 'labelPlacement'>{
    hcType: HCRadioButtonGroupType | HCRadioButtonSingleType,
    hcVariant: Exclude<Variant, 'tertiary' | 'neutralVariant' | 'secondary'>,
    radioButtonProps?: RadioProps,
    size?: CheckBoxSize

    /**
     *
     * @param checked
     * @param item
     */
    onRadioSelect?(checked: boolean, item: HCRadioButtonOption): void,
}
export const HCRadioButton = React.memo(({ label, required,formControlSx, hcType = { type: 'single' }, onRadioSelect, size: propSize = CheckBoxSize.Large, hcVariant = 'primary', radioButtonProps, id, textColor, labelPlacement, helperText, errorText, vertical }: HCRadioButtonProps) => {
    const theme = useTheme();
    const key = hcVariant;

    const checkBoxSizeStyles = React.useMemo(() => CheckBoxSizeStyles[propSize], [propSize]);

    const { wxh, fontSize } = checkBoxSizeStyles;
    // colors
    const palette = React.useMemo(() => theme.hcPalette[key], [key]);
    const color = React.useMemo(() => palette && palette['500'] && palette['500']['hex'], [palette]);

    const style: SxProps<ThemeType> = {
        ...radioButtonProps?.sx,
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
        ml: 0,
        alignItems: 'flex-start',
        '& .MuiFormControlLabel-label': {
            fontSize
        },
        '& span:first-of-type': {
            marginTop: propSize === CheckBoxSize.Large ? '2px' : propSize === CheckBoxSize.Medium ? '1px' : undefined,
        },
    };

    if (hcType.type === 'single') {
        return (
            <FormControlLabel sx={lblStyle} id={id ?? 'check-box'} control={<Radio {...radioButtonProps} sx={style} onChange={({ target }) => onRadioSelect && onRadioSelect(target.checked, { id: id ?? '', label: label ?? ''})} />} disabled={hcType.disabled} checked={hcType.checked} label={label} required={required} />
        );
    }
    return (
        <HCFormControl textColor={textColor} errorText={errorText} helperText={helperText} vertical={vertical} labelPlacement={labelPlacement} formControlSx={formControlSx} id={id} label={label} required={required} input={
            <RadioGroup row={hcType.row} name={hcType.name} value={hcType.defaultValue.id}>
                {hcType.options.map((opt, index) => (
                    <FormControlLabel sx={lblStyle} key={index} value={opt.id} control={
                        <Radio {...radioButtonProps} sx={style} disabled={opt.disabled || hcType.disabled} onChange={({ target }) => {
                            const selected = hcType.options.find((o) => o.id === opt.id);
                            if (selected && onRadioSelect) onRadioSelect(target.checked, selected);
                        }} />
                    } label={opt.label} />
                ))}
            </RadioGroup>
        } />
    );
});

HCRadioButton.displayName = 'HCRadioButton';