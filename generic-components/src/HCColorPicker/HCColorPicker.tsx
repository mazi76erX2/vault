import React from 'react';
import {Box, Popover, SxProps, Tab, Tabs, useTheme} from '@mui/material';
import {Color, ColorResult} from 'react-color';
import {HCSwatchesPicker} from './HCColorPicker.styles';
import {Theme, ThemeType} from '../theme';
import {HCFormControlBaseProps} from '../HCFormCommon';
import {HCColorTrigger, HCCustomPicker} from './components';
import { HCIcon } from '../HCIcon';
//
type HCColorPickerView = 'Swatches' | 'Picker'

export type HCColorResultKey = keyof ColorResult;

export interface HCColorPickerTriggerProps {
    color?: Color;
    onClick(event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>): void;
}
export interface HCColorPickerProps extends HCFormControlBaseProps {
    color?: Color
    onColorChanged?(color: ColorResult): void,
    sx?: SxProps<ThemeType>,
    renderTrigger?(props: HCColorPickerTriggerProps): React.ReactNode;
    returnType?: HCColorResultKey;
    wrapperId?: string;
    customIcon?: React.ReactNode;
    updateLive? : boolean;
    useSelectedAsBackground?: boolean;
    isDefault?: boolean;
    fallbackBackgroundColor?: string;
    iconColor?: string|undefined;
    marginRight?: string;
    marginLeft?: string;
    triggerButtonDisabled?: boolean;
    useThemeAsBackground?:boolean;
}

export const HCColorPicker = React.memo(({ color: propColor ='#333', onColorChanged, label, helperText, errorText, id, required, sx,
    formControlSx, labelPlacement, size, vertical, textColor, disabled, renderTrigger,
    returnType = 'hex', wrapperId, customIcon = <HCIcon icon='PickerHalf'/>, updateLive = false, useSelectedAsBackground=false, isDefault=true, fallbackBackgroundColor='#fff', iconColor=undefined, marginLeft='0px', marginRight='0px', triggerButtonDisabled=false, useThemeAsBackground = true}: HCColorPickerProps) => {
    const theme = useTheme();
    const [color, setColor] = React.useState<Color | undefined>(propColor);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const iconButtonRef = React.useRef<HTMLButtonElement>(null);

    const [active, setActive] = React.useState<HCColorPickerView>('Swatches');
    const pickerViews: HCColorPickerView[] = ['Swatches', 'Picker'];

    const open = Boolean(anchorEl);
    React.useEffect(()=>{
        // whenever we open the popup, ensure swatches is selected
        if(open){
            setActive('Swatches');
        }
    },[open]);

    const colors: string[][] = [
        ['#000',    '#B1D6ED', '#F6D7AB', '#DE605B'],
        ['#DAD9D9', '#65A0C7', '#5E4018', '#4D2322'],
        ['#B3B3B3', '#294050', '#D197C7', '#F8DD7B'],
        ['#808080', '#C5DCAE', '#BF6DB0', '#2D4218'],
        ['#333',    '#71A540', '#F4B3B2', '#4D2B46'],
    ];

    function handleClick(_event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) {
        setAnchorEl(iconButtonRef.current);
    }

    function handleClose(){
        setAnchorEl(null);
    }

    function onColorChange(color: ColorResult) {
        if (!disabled) {
            setColor(color[returnType ?? 'hex']);
            if (onColorChanged) onColorChanged(color);
        }
    }

    function applyClassName(elem: Element, className = 'no-shadow') {
        elem.className = className;
    }

    React.useEffect(() => {
        if (propColor) {
            setColor(propColor);
        }
    }, [propColor]);

    const width = 295;
    const swatchWidth = 280;

    return (
        <>
            {renderTrigger ? renderTrigger({color, onClick :handleClick}) : (
                <HCColorTrigger 
                    ref={iconButtonRef}
                    useThemeAsBackground={useThemeAsBackground} textColor={textColor} formControlSx={formControlSx} vertical={vertical} size={size}
                    labelPlacement={labelPlacement} id={id} label={label} required={required}
                    errorText={errorText} helperText={helperText} sx={sx} onClick={handleClick}
                    selectedColor={color} customIcon={iconColor ? <HCIcon color={iconColor} icon={'PickerHalf'}/> : customIcon} fallbackBackgroundColor={fallbackBackgroundColor} useSelectedAsBackground={useSelectedAsBackground} isDefault={isDefault} marginLeft={marginLeft} marginRight={marginRight} disabled={triggerButtonDisabled} />
            )}
            <Popover 
                open={open} 
                anchorEl={anchorEl} 
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                disableAutoFocus={true}
                disableEnforceFocus={true}
                disableRestoreFocus={true}
            >
                <Box sx={{
                    width: `${width}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} id={wrapperId ? wrapperId : ''}>
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
                    <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        {active === 'Swatches' ? (
                            <HCSwatchesPicker colors={colors} ref={() => {
                                const s = document.querySelectorAll('.swatches-picker > div > div');
                                s.forEach((d) => applyClassName(d));

                            }} color={color} width={swatchWidth} height={135} onChange={onColorChange} />
                        ) : (
                            <HCCustomPicker handleClose={handleClose} color={color} onColorChanged={onColorChange} updateLive={updateLive} />
                        )}

                    </Box>
                </Box>
            </Popover>
        </>
    );
});
HCColorPicker.displayName = 'HCColorPicker';
