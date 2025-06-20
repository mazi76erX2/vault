/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';

import DropDown from '../components/DropDown';
import {Box, Tab, Tabs, useTheme} from '@mui/material';
import {Theme} from '../../theme';
import {HCSwatchesPicker} from '../../HCColorPicker/HCColorPicker.styles';
import {HCCustomPicker} from '../../HCColorPicker/components';
import {ColorResult} from 'react-color';

type Props = {
    disabled?: boolean;
    buttonAriaLabel?: string;
    buttonClassName: string;
    buttonIconClassName?: string;
    buttonLabel?: string;
    title?: string;
    stopCloseOnClickSelf?: boolean;
    color: string;
    onChange?: (color: string, skipHistoryStack: boolean) => void;
    customIcon?: React.ReactNode;
};

type HCColorPickerView = 'Swatches' | 'Picker';

export default function DropdownColorPicker({
    disabled = false,
    stopCloseOnClickSelf = true,
    color,
    onChange,
    ...rest
}: Props) {
    const theme = useTheme();
    const [active, setActive] = React.useState<HCColorPickerView>('Swatches');
    const pickerViews: HCColorPickerView[] = ['Swatches', 'Picker'];

    const colors: string[][] = [
        ['#000',    '#B1D6ED', '#F6D7AB', '#DE605B'],
        ['#DAD9D9', '#65A0C7', '#5E4018', '#4D2322'],
        ['#B3B3B3', '#294050', '#D197C7', '#F8DD7B'],
        ['#808080', '#C5DCAE', '#BF6DB0', '#2D4218'],
        ['#333',    '#71A540', '#F4B3B2', '#4D2B46'],
    ];

    function applyClassName(elem: Element, className = 'no-shadow') {
        elem.className = className;
    }

    // const [selectedColor, setSelectedColor] = React.useState<Color>(theme.hcPalette.primary['500']!['hex']);

    function onColorChange(color: ColorResult) {
        if (!disabled) {
            if (onChange)
                onChange(color['hex'], true);
        }
    }

    return (
        <DropDown
            {...rest}
            disabled={disabled}
            stopCloseOnClickSelf={stopCloseOnClickSelf}
            iconColor={color}>
            <Box sx={{
                width: '270px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} id={'color-picker-wrapper'}>
                <Tabs
                    value={active}
                    onChange={(_, value) => {
                        setActive(value);
                    }}
                    color={theme.hcPalette.primary['500']!['hex']}
                    variant="fullWidth"
                    TabIndicatorProps={{
                        sx: {
                            bgcolor: theme.hcPalette.primary['500']!['hex']
                        }
                    }}
                >
                    {pickerViews.map((v) => <Tab sx={{
                        '&.MuiTab-root': {
                            border: 0,
                            backgroundColor: Theme.textColor.white,
                            color: Theme.textColor.black,
                            '&:hover': {
                                border: 0,
                            },
                        },
                        '&.Mui-selected': {
                            backgroundColor: theme.hcPalette.primary['500']!['hex'],
                            color: Theme.textColor.white,
                        }
                    }} key={v} value={v} label={v} />)}
                </Tabs>
                <Box>
                    {active === 'Swatches' ? (
                        <HCSwatchesPicker colors={colors} ref={() => {
                            const s = document.querySelectorAll('.swatches-picker > div > div');
                            s.forEach((d) => applyClassName(d));

                        }} color={color} width={270} height={135} onChange={onColorChange} />
                    ) : (
                        <HCCustomPicker color={color} onColorChanged={onColorChange} updateLive={false} />
                    )}

                </Box>
            </Box>
        </DropDown>
    );
}
