import {Box, Typography, useTheme} from '@mui/material';
import React from 'react';
import {Meta, StoryObj} from '@storybook/react';
import {HCDropDown, HCDropDownValue} from '../HCDropDown';
import {Variant} from '../theme';
import {HCColorPicker} from '../HCColorPicker';
import tinycolor from 'tinycolor2';
import {ColorResult} from 'react-color';

const meta = {
    title: 'Demos/ThemePark',
} satisfies Meta<unknown>;

export default meta;

type Story = StoryObj<unknown>;

export const Themes: Story = {
    render() {
        const theme = useTheme();

        const [colors] = React.useState<HCDropDownValue[]>(() => {
            return Object.keys(theme.hcPalette).filter((i) => !['tertiary', 'neutral'].includes(i)).map((key) => {

                const p = theme.hcPalette[key as Variant];
                return {
                    id: p['500']!['hex'] as string,
                    value: `${key} - ${p['500']!['hex']}`,
                } as HCDropDownValue;
            });
        });

        const [activeHexColor, setActiveHexColor] = React.useState<string>(colors[0].id);

        const [selectedColor, setSelectedColor] = React.useState<HCDropDownValue>(colors[0]);
        const [colorResults, setColorResults] = React.useState<ColorResult>();

        const colorObject = React.useMemo(() => {
            return tinycolor(activeHexColor);
        }, [activeHexColor]);

        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 6,
                boxShadow: 1,
            }}>
                <Typography variant={'h1'} sx={{
                    mb: 2
                }}>ThemePark</Typography>
                <HCDropDown label={'Choose Background From Theme Colors'} value={selectedColor} onChange={(v) => {
                    if (v) {
                        setSelectedColor(v);
                        setActiveHexColor(v.id);
                        setColorResults(undefined);
                    }
                }} options={colors} inputProps={{
                    sx: {
                        mb: 2
                    }
                }} />
                <HCColorPicker label={'Choose Background From ColorPicker'} color={activeHexColor} onColorChanged={(color) => {
                    setActiveHexColor(color.hex);
                    setColorResults(color);
                }} updateLive />
                <Box sx={{
                    p: 4,
                    my: 2,
                    background: activeHexColor,
                    color: colorObject.isDark() ? theme.textColor.white : theme.textColor.black
                }}>
                    <Typography>Active Color = {activeHexColor}</Typography>
                    {colorResults && <Typography sx={{
                        mt: 2
                    }}>ColorPicker Results <code>{JSON.stringify(colorResults)}</code></Typography>}
                </Box>
            </Box>
        );
    }
};