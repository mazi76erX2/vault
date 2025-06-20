import * as React from 'react';
import {HCSegmentTabs} from '../HCSegmentTabs';
import {Box, Stack, SxProps} from '@mui/material';
import {HCTextField} from '../HCTextField';
import {Icon} from '../icons';
import {FaIcons} from '../fa-icons';
import {LuiIcons} from '../lui-icons';
import {HCIcon} from './HCIcon';
import {MUITheme} from '../theme';

export const isFontAwesome = (icon: string) => {
    const iconParts = icon.split('-');
    return iconParts.includes('fa');
};

export const isLuiIcon = (icon: string) => {
    const iconParts = icon.split('-');
    return iconParts.includes('lui');
};

export const isHCIcon = (icon: string) => !isLuiIcon(icon) && !isFontAwesome(icon);

const iconClass = (icon: string) => {
    if (isFontAwesome(icon)) return 'fa';
    if (isLuiIcon(icon)) return 'lui-icon';
    return 'hc-icon';
};

export interface HCIconsPickerProps {
    value?: string;
    onChange?(iconName: string): void;
    cols?: number;
    height?: string;
    open?: boolean;
}

export const HCIconsPicker = (props: HCIconsPickerProps) => {
    const [search, setSearch] = React.useState('');
    const [value, setValue] = React.useState(props.value ?? '');

    const cols = props.cols || 10;

    const hcIconList = React.useMemo(() => {
        return  Object.keys(Icon).sort().filter((key) => key.toLowerCase().indexOf(search.toLowerCase()) > -1);
    }, [search]);

    const faIconList = React.useMemo(() => {
        return  Object.keys(FaIcons).sort().filter((key) => key.toLowerCase().indexOf(search.toLowerCase()) > -1);
    }, [search]);

    const luiIconList = React.useMemo(() => {
        return  Object.keys(LuiIcons).sort().filter((key) => key.toLowerCase().indexOf(search.toLowerCase()) > -1);
    }, [search]);

    const stackStyleSX: SxProps = {
        p: 2,
    };

    const boxStyleSx: SxProps = {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, auto)`,
        gridGap: '8px',
    };

    const iconStyleSx = (isSelected?: boolean) => {
        return {
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...isSelected ? {
                background: MUITheme!.hcPalette.primary['100']!['hex'],
            } : {},
            ':hover': {
                background: isSelected ? MUITheme!.hcPalette.primary['100']!['hex'] : '#eee',
            }
        } as SxProps;
    };

    const renderSearchInput = React.useCallback(() => {
        return (
            <HCTextField type={'text'} value={search} onChange={({target}) => {
                setSearch(target.value);
            }}/>
        );
    }, [search]);

    const renderHCIconList = React.useCallback(() => {
        return (
            <Stack sx={stackStyleSX}>
                {renderSearchInput()}
                <Box sx={boxStyleSx}>
                    {hcIconList.map((key) => {
                        const thisIcon = key as keyof typeof Icon;
                        const isSelected = !isLuiIcon(value) && !isFontAwesome(value) && value === key;

                        return (
                            <Box onClick={() => {
                                props.onChange && props.onChange(key);
                                setValue(key);
                            }} title={key} key={key} sx={iconStyleSx(isSelected)}>
                                <HCIcon className={thisIcon} icon={thisIcon} />
                            </Box>
                        );
                    })}
                </Box>
            </Stack>
        );
    }, [hcIconList, value]);

    const renderFaIconList = React.useCallback(() => {
        return (
            <Stack sx={stackStyleSX}>
                {renderSearchInput()}
                <Box sx={boxStyleSx}>
                    {faIconList.map((key) => {
                        const thisIcon = key as keyof typeof FaIcons;
                        const isSelected = isFontAwesome(value) && value === key;

                        return (
                            <Box onClick={() => {
                                props.onChange && props.onChange(key);
                                setValue(key);
                            }} title={FaIcons[thisIcon]} key={key} sx={iconStyleSx(isSelected)}>
                                <i className={`${iconClass(key)} ${thisIcon}`}/>
                            </Box>
                        );
                    })}
                </Box>
            </Stack>
        );
    }, [faIconList, value]);

    const renderLuiIconList = React.useCallback(() => {
        return (
            <Stack sx={stackStyleSX}>
                {renderSearchInput()}
                <Box sx={boxStyleSx}>
                    {luiIconList.map((key) => {
                        const thisIcon = key as keyof typeof LuiIcons;

                        const isSelected = isLuiIcon(value) && value === key;

                        return (
                            <Box onClick={() => {
                                props.onChange && props.onChange(key);
                                setValue(key);
                            }} title={LuiIcons[thisIcon]} key={key} sx={iconStyleSx(isSelected)}>
                                <i className={`${iconClass(key)} ${thisIcon}`}/>
                            </Box>
                        );
                    })}
                </Box>
            </Stack>
        );
    }, [luiIconList, value]);

    React.useEffect(() => {
        if (props.value && value !== props.value) {
            setValue(props.value);
        }
    }, [props.value]);

    return  (
        <Box sx={{
            display: !props.open ? 'none' : undefined,
        }}>
            <HCSegmentTabs fullWidth height={props.height} border items={[
                {
                    label: 'CIRCUM ICONS',
                    render: renderHCIconList,
                },
                {
                    label: 'Font Awesome',
                    render: renderFaIconList,
                },
                {
                    label: 'Leonardo UI',
                    render: renderLuiIconList,
                },
            ]} />
        </Box>
    );
};

export type HCButtonIconType = keyof typeof Icon | keyof typeof LuiIcons | keyof typeof FaIcons

export interface HCButtonIconProps {
    icon: HCButtonIconType;
    style?: React.CSSProperties;
    className?: string;
    id?: string;
}

export function HCButtonIcon(props: HCButtonIconProps) {
    if (isFontAwesome(props.icon)) return <i id={props.id} className={`${iconClass(props.icon)} ${props.icon} ${props.className}`} style={props.style} />;
    if (isLuiIcon(props.icon)) return <i id={props.id} className={`${iconClass(props.icon)} ${props.icon} ${props.className}`} style={props.style} />;
    return <HCIcon id={props.id} className={props.className} icon={props.icon as keyof typeof Icon} style={props.style} />;
}