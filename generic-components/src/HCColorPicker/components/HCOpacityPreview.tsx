import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

const CheckeredSquare = styled(Box, {
    shouldForwardProp: (prop) => prop !== '$isDefault'
})<{ $isDefault?: boolean }>(({ theme, $isDefault  }) => ({
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: $isDefault ? theme.shape.borderRadius : 0,
    overflow: 'hidden',
    aspectRatio: '1 / 1',
}));

const CheckerboardBackground = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%)
  `,    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
});

const ColorOverlay = styled(Box)<{ color: string }>(({ color }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color,
}));

const HCOpacityPreview: React.FC<{ color?: string; isDefault: boolean,handleOnClick?: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>)=>void }> = ({ color = '', isDefault = true, handleOnClick }) => {
    return (
        <CheckeredSquare onClick={(e)=>handleOnClick && handleOnClick(e)} $isDefault={isDefault}>
            {color && <CheckerboardBackground />}
            <ColorOverlay color={color} />
        </CheckeredSquare>
    );
};

export default HCOpacityPreview;