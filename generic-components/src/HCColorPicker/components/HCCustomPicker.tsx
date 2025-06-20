import {Color, ColorResult, HSLColor} from 'react-color';
import {Box, Grid, Slider, styled, Typography, useTheme} from '@mui/material';
import React from 'react';
import {HSVColor} from '../../utils';
import tinycolor from 'tinycolor2';
import {Theme} from '../../theme';
import Hue from '@uiw/react-color-hue';
import {HCTextField} from '../../HCTextField';
import {HCNumberField} from '../../HCNumberField';
import Saturation from '@uiw/react-color-saturation';

const StyleNumberInput = styled(HCNumberField)`
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type=number] {
        -moz-appearance: textfield;
    }
`;

interface HCCustomPickerProps {
    color?: Color;
    onColorChanged?(color: ColorResult): void;
    updateLive? : boolean
    handleClose?: () => void;
}

export const HCCustomPicker = ({ onColorChanged, color, updateLive = true, handleClose }: HCCustomPickerProps) => {
    const theme = useTheme();
    const [hsl, setHSL] = React.useState<HSLColor>();
    const [hsv, setHSV] = React.useState<HSVColor>();
    const [hex, setHex] = React.useState('');
    const [isMouseDown, setIsMouseDown] = React.useState(false);

    const [rgb, setRgb] = React.useState({
        r: 0,
        g: 0,
        b: 0,
    });

    const [currentHex, setCurrentHex] = React.useState<string>(() => theme.hcPalette.primary['500']!['hex']);

    const [opacity, setOpacity] = React.useState<number>(100);

    const inputProps = {
        inputProps: { max: 255, min: 0, className: 'hcp-number-input',},
    };

    React.useEffect(() => {
        const mouseUpEvent = () => {
            if (hsl && rgb && hex)
                applyOnMouseUp(hsl, rgb, hex);
        };

        if (isMouseDown)
            document.addEventListener('mouseup', mouseUpEvent);

        return () => {
            document.removeEventListener('mouseup', mouseUpEvent);
        };
    }, [isMouseDown, hsl, rgb, hex]);

    const handleOpacityChanged = (value:number):void => {
        setAlpha(value);
        setOpacity(value);
        const tcColor = tinycolor(hex);
        tcColor.setAlpha(value / 100);
        setHSV(tcColor.toHsv());
        setHSL(tcColor.toHsl());
        setCurrentHex(tcColor.toHex8());
        setHex(tcColor.toHex8());
        setRgb({
            ...tcColor.toRgb(),
        });
    };


    const height = '24px';

    function updateStates(
        tcColor: tinycolor.Instance,
        updateHex?: boolean
    ) {
        tcColor.setAlpha(opacity / 100);

        setHSV(tcColor.toHsv());

        setHSL(tcColor.toHsl());

        setCurrentHex(tcColor.toHex8());

        if (updateHex) setHex(tcColor.toHex8());

        setRgb({
            ...tcColor.toRgb(),
        });
    }

    const applyOnMouseUp = (hsl: HSLColor, rgb: {
        r: number,
        g: number,
        b: number,
    }, hex: string) => {
        !updateLive && onColorChanged && onColorChanged({
            hsl: hsl,
            rgb: rgb,
            hex: `#${hex}`,
        });
        setIsMouseDown(false);
    };

    function applyOnColorChange({
        tcColor,
        updateHex = true,
    }: {tcColor: tinycolor.Instance, updateHex?: boolean }) {
        updateStates(tcColor, updateHex);

        updateLive && onColorChanged && onColorChanged({
            hsl: tcColor.toHsl(),
            rgb: tcColor.toRgb(),
            hex: `#${tcColor.toHex8()}`,
        });
    }

    function onColorChange(color: tinycolor.Instance) {
        applyOnColorChange({tcColor:color});
    }

    function setAlpha(value = 0) {
        setOpacity(value);
        const tcColor = tinycolor(currentHex);
        tcColor.setAlpha(value / 100);
        applyOnColorChange({tcColor});
    }

    function onRgbChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        const numValue = Number(value);
        if (numValue > 255 || numValue < 0) return;
        const newRgb = {
            ...rgb,
            [id]: numValue,
        };

        const tcColor = tinycolor(newRgb);

        applyOnColorChange({tcColor});
    }

    const handleEnterDown = () => {
        const value = hex;
        const regEx = /^[0-9a-fA-F]+$/;
        const isHex = regEx.test(value.toString());
        if (isHex) {
            const tcColor = tinycolor(value);
            if (!updateLive) {
                updateStates(tcColor, false);
                onColorChanged && onColorChanged({
                    hsl: tcColor.toHsl(),
                    rgb: tcColor.toRgb(),
                    hex: `#${tcColor.toHex8()}`
                });
            }
            handleClose && handleClose();
        }
    };
    function onHexValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setHex(value);

        const regEx = /^[0-9a-fA-F]+$/;
        const isHex = regEx.test(value);

        if (isHex) {
            const tcColor = tinycolor(value);
            updateStates(tcColor, false);
            onColorChanged && onColorChanged({
                hsl: tcColor.toHsl(),
                rgb: tcColor.toRgb(),
                hex: `#${tcColor.toHex8()}`
            });

            if (!updateLive) {
                setIsMouseDown(true);
            }
        }
    }

    React.useEffect(() => {
        const regEx = /^[0-9a-fA-F]+$/;
        const isHex = regEx.test(hex.toString());
        if (isHex) {
            const tcColor = tinycolor(hex);
            applyOnColorChange({tcColor, updateHex: false});
        }
    }, [hex]);

    React.useEffect(() => {
        const hex = String((color as string) ?? Theme.palette.primary['500']!['hex']);
        const tcColor = tinycolor(hex);
        setOpacity(tcColor.getAlpha() * 100);
        setHex(tcColor.toHex8());
    }, []);

    if (!hsv || !hsl) return null;

    return (
        <Box sx={{
            display: 'flex',
            padding: '16px',
            flexDirection: 'column'
        }}>
            <Box sx={{
                display: 'flex',
                width: '100%'
            }}>
                <Box
                    onMouseDown={() => setIsMouseDown(true)}
                    sx={{
                        width: '220px',
                        height: '135px',
                        marginRight: '18px',
                        position: 'relative'
                    }}
                >
                    {
                        <Saturation
                            pointer={({ top, left }) => {
                                const x = Number(left?.replace('%', '') ?? 0) * 100;
                                const y = Number(top?.replace('%', '') ?? 99) - 99;

                                return (
                                    <div style={{
                                        position: 'absolute',
                                        width: 4,
                                        height: 4,
                                        left: `${x}%`,
                                        top: `${y * 100}%`,
                                        boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.3) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.4) 0px 0px 1px 2px',
                                        borderRadius: '50%',
                                        transform: 'translate(-2px, -2px)'
                                    }} />
                                );
                            }}

                            hsva={{
                                v: hsv.v,
                                s: hsv.s,
                                h: hsv.h,
                                a: opacity / 100,
                            }}

                            style={{
                                width: '100%',
                                height: '100%',
                            }}

                            onChange={(col) => {
                                const tinyColor = tinycolor({
                                    h: col.h,
                                    s: col.s,
                                    v: col.v,
                                });
                                onColorChange(tinyColor);
                            }}
                        />
                    }
                </Box>
                <Box sx={{
                    width: '30px',
                    height: '135px',
                    position: 'relative',
                }} onMouseDown={() => setIsMouseDown(true)}>
                    {
                        <Hue
                            pointer={
                                ({top}) => {
                                    const topVal = top ? (Number(top.replace('%', ''))-9) : 0;
                                    return (
                                        <Box style={{
                                            position: 'absolute',
                                            left: '24px',
                                            top: `${topVal}%`,
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="11" viewBox="0 0 9 11" fill="none">
                                                <path d="M7.75 9.39711L1 5.5L7.75 1.60289V9.39711Z" fill="white" stroke="black"/>
                                            </svg>
                                        </Box>
                                    );
                                }
                            } style={{
                                height: '100%'
                            }} hue={hsl.h}
                            direction={'vertical'}
                            color={hex}
                            onChange={(col) => {
                                const {s, l} = hsl;
                                const tinyColor = tinycolor({
                                    s: s === 0 ? 0.85 : s,
                                    l: l === 0 ? 0.46 : l,
                                    h: col.h,
                                });

                                onColorChange(tinyColor);
                            }}/>
                    }
                </Box>
            </Box>
            <Box sx={{
                mt: 2,
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <HCTextField
                            height={height}
                            id={'hex'}
                            size={'small'}
                            inputPadding={'1px 8px'}
                            label={'Hex'}
                            type={'text'}
                            value={hex}
                            inputProps={{
                                inputProps: {
                                    pattern: '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?',
                                    className: 'hcp-number-input',
                                    onKeyDown: (e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEnterDown();
                                        }
                                    }
                                }
                            }}
                            onChange={onHexValueChanged}
                        />
                    </Grid>
                    <Grid item xs={2.66}>
                        <StyleNumberInput height={height} size={'small'} inputPadding={'1px 8px'} inputProps={inputProps} id={'r'} onChange={onRgbChanged} label={'R'} value={rgb.r} />
                    </Grid><Grid item xs={2.66}>
                        <StyleNumberInput height={height} size={'small'} inputPadding={'1px 8px'} inputProps={inputProps} id={'g'} onChange={onRgbChanged} label={'G'} value={rgb.g} />
                    </Grid>
                    <Grid item xs={2.66}>
                        <StyleNumberInput height={height} size={'small'} inputPadding={'1px 8px'} inputProps={inputProps} id={'b'} onChange={onRgbChanged} label={'B'} value={rgb.b} />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{
                mt: 2,
            }}>
                <Box sx={{
                    mb: 2
                }}>
                    <Typography variant={'caption'} gutterBottom>
                        Opacity
                    </Typography>
                </Box>
                <Slider value={opacity} aria-label="Opacity" valueLabelDisplay="auto" marks={[
                    {
                        value: 0,
                        label: '0'
                    },
                    {
                        value: 100,
                        label: '100'
                    }
                ]} sx={{
                    color: theme.hcPalette.primary['500']!['hex'],
                    mb: 0,
                    '& .MuiSlider-thumb': {
                        color: theme.textColor.white
                    },
                    '& .MuiSlider-markLabel': {
                        top: '-15px !important',
                        fontSize: '11px'
                    },
                    '& .MuiSlider-markLabel[data-index="0"]': {
                        transform: 'translateX(0%)'
                    },
                    '& .MuiSlider-markLabel[data-index="1"]': {
                        transform: 'translateX(-100%)',
                    }
                }} onChange={(_event, value) => {
                    const actualValue = Array.isArray(value) ? value[0] : value;
                    handleOpacityChanged(actualValue);
                }}
                onMouseDown={() => setIsMouseDown(true)}
                />
            </Box>
        </Box>
    );
};
