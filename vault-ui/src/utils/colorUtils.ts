/**
 * Adds a # prefix to a color string if it's missing.
 * @param colorStr The color string.
 * @returns The color string with a # prefix, or an empty string if input is null/undefined.
 */
export const formatColor = (colorStr: string | undefined | null): string => {
    if (!colorStr) return '';
    return colorStr.startsWith('#') ? colorStr : `#${colorStr}`;
};

/**
 * Converts a hex color string to an rgba string.
 * @param hex The hex color string (e.g., "#FF8234" or "FF8234" or "F83").
 * @param alpha The alpha transparency value (0 to 1).
 * @returns The rgba string (e.g., "rgba(255,130,52,0.3)"). Defaults to black with alpha if hex is invalid.
 */
export const hexToRgba = (hex: string | undefined | null, alpha: number): string => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const hexValue = (hex.startsWith('#') ? hex.slice(1) : hex).trim();
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hexValue)) {
        return `rgba(0,0,0,${alpha})`;
    }
    let r = 0, g = 0, b = 0;
    if (hexValue.length === 3) {
        r = parseInt(hexValue[0] + hexValue[0], 16);
        g = parseInt(hexValue[1] + hexValue[1], 16);
        b = parseInt(hexValue[2] + hexValue[2], 16);
    } else if (hexValue.length === 6) {
        r = parseInt(hexValue.substring(0, 2), 16);
        g = parseInt(hexValue.substring(2, 4), 16);
        b = parseInt(hexValue.substring(4, 6), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
};

/**
 * Adds a # prefix to a color string if it's missing. (Alias for formatColor for specific contexts if needed)
 * @param color The color string.
 * @returns The color string with a # prefix, or an empty string if input is null/undefined.
 */
export const addHashIfMissing = (color: string | undefined | null): string => {
    if (!color) return '';
    return color.startsWith('#') ? color : `#${color}`;
};

/**
 * Removes a # prefix from a color string if it's present.
 * @param color The color string.
 * @returns The color string without a # prefix, or an empty string if input is null/undefined.
 */
export const stripHashPrefix = (color: string | undefined | null): string => {
    if (!color) return '';
    return color.startsWith('#') ? color.substring(1) : color;
};

/**
 * Calculates linear RGB value according to the WCAG formula.
 * @param value - RGB channel value between 0 and 1.
 * @returns Linear RGB value.
 */
const calculateLinearRGB = (value: number): number => {
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
};

/**
 * Calculates the relative luminance of a color based on W3C formula.
 * @param hexColor - Hex color code (e.g., "#FF8234").
 * @returns Relative luminance value between 0 and 1. Defaults to mid-luminance (0.5) on error.
 */
export const calculateRelativeLuminance = (hexColor: string): number => {
    try {
        const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
        const fullHex = hex.length === 3 
            ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
            : hex;
        
        if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
            console.warn(`Invalid hex color for luminance: ${hexColor}, defaulting to mid-luminance`);
            return 0.5;
        }
        
        const r = parseInt(fullHex.substring(0, 2), 16) / 255;
        const g = parseInt(fullHex.substring(2, 4), 16) / 255;
        const b = parseInt(fullHex.substring(4, 6), 16) / 255;
        
        const R = calculateLinearRGB(r);
        const G = calculateLinearRGB(g);
        const B = calculateLinearRGB(b);
        
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    } catch (error) {
        console.error(`Error calculating luminance for ${hexColor}:`, error);
        return 0.5;
    }
};

/**
 * Determines whether to use black or white text based on background color's luminance.
 * @param backgroundColor - Background color in hex format.
 * @returns Text color in hex format ("#000000" or "#FFFFFF"). Defaults to black on error.
 */
export const getContrastColor = (backgroundColor: string | undefined | null): string => {
    if (!backgroundColor) return '#000000'; // Default to black if no background color
    try {
        const bgWithHash = backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`;
        const luminance = calculateRelativeLuminance(bgWithHash);
        return luminance > 0.55 ? '#000000' : '#FFFFFF';
    } catch (error) {
        console.error('Error in getContrastColor:', error);
        return '#000000';
    }
};

/**
 * Calculates contrast ratio between two colors.
 * @param color1 - First color in hex format.
 * @param color2 - Second color in hex format.
 * @returns Contrast ratio (1-21). Defaults to 1 on error.
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
    try {
        const luminance1 = calculateRelativeLuminance(color1);
        const luminance2 = calculateRelativeLuminance(color2);
        
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        
        return (lighter + 0.05) / (darker + 0.05);
    } catch (error) {
        console.error(`Error calculating contrast ratio between ${color1} and ${color2}:`, error);
        return 1;
    }
};

/**
 * Determines if a color combination is readable based on WCAG AA standards (4.5:1 for normal text).
 * @param bgColor - Background color in hex format.
 * @param textColor - Text color in hex format.
 * @returns Boolean indicating if the combination is readable. Defaults to false on error.
 */
export const isColorReadable = (bgColor: string, textColor: string): boolean => {
    if (!bgColor || !textColor) return false;
    try {
        const contrastRatio = calculateContrastRatio(bgColor, textColor);
        return contrastRatio >= 4.5;
    } catch (error) {
        console.error('Error checking color readability:', error);
        return false;
    }
}; 