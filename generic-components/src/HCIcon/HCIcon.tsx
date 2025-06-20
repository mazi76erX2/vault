import * as React from 'react';
import {HTMLAttributes} from 'react';
import {ReactSVG} from 'react-svg';
import {Icon as IconSet, OldIcons} from '../icons';
import {styled} from '@mui/material';

const VaultStyledSVG = styled(ReactSVG)`
    & div {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    & svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
        stroke: currentColor;
        & *[stroke^="#"] {
            stroke: currentColor;
        }
        & *[stroke^="black"] {
            stroke: currentColor;
        }
        & * {
            stroke-width: ${(props) => props.strokeWidth};
        }
        & *[fill^="#"] {
            fill: currentColor;
        }
        & *[fill^="black"] {
            fill: currentColor;
        }
    }
`;

const TCStyledSVG = styled(ReactSVG)`
    & div {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    & svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: none;
        & *[stroke^="#"] {
            stroke: currentColor;
        }
        & *[stroke^="black"] {
            stroke: currentColor;
        }
        & * {
            stroke-width: ${(props) => props.strokeWidth};
        }
        & *[fill^="#"] {
            fill: currentColor;
        }
        & *[fill^="black"] {
            fill: currentColor;
        }
    }
`;

export interface HCIconProps extends HTMLAttributes<HTMLDivElement> {
    icon: keyof typeof IconSet;
    className?: string;
    color?: string;
    size?: number;
    // These props make styling component easier than creating new classes
    rotate?: number;
    strokeWidth?: number;
}

/**
 *
 * @param icon string key icon name
 * @param className string classes for styling
 * @param color
 * @param size
 * @param rotate optional number rotation of the icon
 * @param strokeWidth
 * @param rest
 * @returns HCIcon react component
 */
export const HCIcon = ({ icon, className, color, size = 24, rotate, strokeWidth = 1, ...rest }: HCIconProps) => {
    const iconSrc = IconSet[icon];

    const OldIconsKeys = Object.keys(OldIcons).map((key) => key);

    const isOldIcon = () => OldIconsKeys.includes(icon);

    return (
        <div
            className={className}
            aria-label={icon}
            role="img"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: rotate ? `rotate(${rotate}deg)` : undefined,
                color,
                width: size,
                height: size,
                ...rest.style,
            }}
            {...rest}
        >
            {isOldIcon() ? (
                <TCStyledSVG strokeWidth={strokeWidth} style={{
                    width: '100%',
                    height: '100%',
                    color,
                }} src={iconSrc} />
            ) : (
                <VaultStyledSVG strokeWidth={strokeWidth} style={{
                    width: '100%',
                    height: '100%',
                    color,
                }} src={iconSrc} />
            )}
        </div>
    );
};