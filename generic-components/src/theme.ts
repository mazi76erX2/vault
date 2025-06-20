import {createTheme} from '@mui/material';

export type Variant = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant'
export type Size = 'small' | 'medium' | 'large'

export const FontSize: Record<Size, string> = {
    'small': '12px !important',
    'medium': '14px !important',
    'large': '16px !important',
};

export type Keys = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'textColor';

export enum CheckBoxSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large'
}

type CheckBoxSizeDimens = { size: string; wxh: string; fontSize: string; }

export const CheckBoxSizeStyles: Record<CheckBoxSize, CheckBoxSizeDimens> = {
    [CheckBoxSize.Small]: {
        size: 'small',
        wxh: '16px',
        fontSize: '12px'
    },
    [CheckBoxSize.Medium]:{
        size: 'medium',
        wxh: '18px',
        fontSize: '14px'
    },
    [CheckBoxSize.Large]: {
        size: 'large',
        wxh: '20px',
        fontSize: '16px'
    }
};

type Colors = {
    hex: string
    rgb: string
    text?: string;
}

export type PartialKey = Partial<Keys>
type KeyedColor = Record<PartialKey, Colors>

type Property = Record<Partial<Variant>, Partial<KeyedColor>>;

type ThemeOptions = {
    palette: Property,
    textColor: {
        black: string;
        white: string;
    },
    error: Colors,
    success: Colors,
    info: Colors,
}

export const Theme: ThemeOptions = {
    palette: {
        primary: {
            100: {
                hex: '#FFE9E0',
                rgb: 'rgb(255, 233, 224)',
            },
            300: {
                hex: '#FFA785',
                rgb: 'rgb(255, 167, 133)',
            },
            500: {
                hex: '#FF5F2C',
                rgb: 'rgb(255, 95, 44)',
            },
        },
        secondary: {
            100: {
                hex: '#EBEEF0',
                rgb: 'rgb(235, 238, 240)',
            },
            300: {
                hex: '#B3BEC6',
                rgb: 'rgb(179, 190, 198)',
            },
            500: {
                hex: '#13334C',
                rgb: 'rgb(19, 51, 76)',
            },
            700: {
                hex: '#466374',
                rgb: 'rgb(70, 99, 116)'
            }
        },
        tertiary: {
            100: {
                hex: '#E4F0F4',
                rgb: 'rgb(228, 240, 244)',
            },
            300: {
                hex: '#97C4D6',
                rgb: 'rgb(151, 196, 214)',
            },
            500: {
                hex: '#2C86AB',
                rgb: 'rgb(44, 134, 171)',
            },
            700: {
                hex: '#226682',
                rgb: 'rgb(34, 102, 130)'
            }
        },
        neutral: {
            50: {
                hex: '#FFFFFF',
                rgb: 'rgb(255, 255, 255)',
            },
            100: {
                hex: '#e1dfdf',
                rgb: 'rgb(225, 223, 223)',
            },
            200: {
                hex: '#c5c0c0',
                rgb: 'rgb(197, 192, 192)',
            },
            300: {
                hex: '#a9a2a1',
                rgb: 'rgb(162, 162, 161)',
            },
            500: {
                hex: '#5a4f4d',
                rgb: 'rgb(90, 79, 77)',
            },
            700: {
                hex: '#413533',
                rgb: 'rgb(65, 53, 51)',
            },
            800: {
                hex: '#160301',
                rgb: 'rgb(22, 3, 1)',
            },
            900: {
                hex: '#030000',
                rgb: 'rgb(3, 0, 0)',
            },
        },
        neutralVariant: {
            500: {
                hex: '#E8E8E8',
                rgb: 'rgb(232, 232, 232)'
            }
        },
    },
    error: {
        hex: '#FB2047',
        rgb: 'rgb(251, 32, 71)'
    },
    success: {
        hex: '#1AA403',
        rgb: 'rgb(26, 164, 3)'
    },
    info: {
        hex: '#265CE9',
        rgb: 'rgb(38, 92, 233)'
    },
    textColor: {
        black: '#000000',
        white: '#ffffff'
    }
};

const fontFamily = 'Arial, serif';

export const MUITheme = createTheme({
    palette: {
        primary: {
            100: '#FFE9E0',
            300: '#FFA785',
            500: '#FF5F2C',
            main: '#FF5F2C',
        },
        error: {
            500: '#FB2047'
        },
        success: {
            500: '#1AA403',
        },
        info: {
            500: '#265CE9'
        },
        secondary: {
            100: '#EBEEF0',
            300: '#B3BEC6',
            500: '#13334C',
            700: '#466374',
            main: '#13334C',
        },
        common: {
            white: Theme.textColor.white,
            black: Theme.textColor.black,
        },
    },
    hcPalette: {
        ...Theme.palette,
    },
    error: {
        hex: '#FB2047',
        rgb: 'rgb(251, 32, 71)'
    },
    success: {
        hex: '#1AA403',
        rgb: 'rgb(26, 164, 3)'
    },
    info: {
        hex: '#265CE9',
        rgb: 'rgb(38, 92, 233)'
    },
    textColor: {
        black: '#000000',
        white: '#ffffff'
    },
    typography: {
        fontFamily,
        h1: {
            fontSize: '25px'
        },
        h2: {
            fontSize: '20px'
        },
        h3: {
            fontSize: '18px'
        },
    },
});

declare module '@mui/material/styles' {
    interface Theme {
        hcPalette: Property,
        textColor: {
            black: string;
            white: string;
        },
        error: Colors,
        success: Colors,
        info: Colors
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        hcPalette: Property,
        textColor: {
            black: string;
            white: string;
        },
        error: Colors,
        success: Colors,
        info: Colors
    }
}

export type ThemeType = typeof MUITheme