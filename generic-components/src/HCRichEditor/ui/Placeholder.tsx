import * as React from 'react';
import { ReactNode } from 'react';
import { styled } from '@mui/material';

interface PlaceholderDivProps {
    customColor?: string;
}

const PlaceholderDiv = styled('div')<PlaceholderDivProps>`
    width: 100%;
    font-size: 15px;
    color: ${props => props.customColor || '#858484'};
    overflow: hidden;
    position: absolute;
    text-overflow: ellipsis;
    top: 0px;
    left: 2px;
    user-select: none;
    white-space: nowrap;
    display: inline-block;
    pointer-events: none;
`;

interface PlaceholderProps {
    children: ReactNode;
    className?: string;
    color?: string;
}

export default function Placeholder({
    children,
    className,
    color,
}: PlaceholderProps): JSX.Element {
    return (
        <PlaceholderDiv
            className={className || 'Placeholder__root'}
            customColor={color}
        >
            {children}
        </PlaceholderDiv>
    );
}