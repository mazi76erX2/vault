import {styled} from '@mui/material';
import {SwatchesPicker} from 'react-color';
import {Hue} from 'react-color/lib/components/common';

export const HCSwatchesPicker = styled(SwatchesPicker)({
    '& > div': {
        width: '100% !important'
    },
    '& .no-shadow': {
        boxShadow: 'none !important',
        width: '100% !important',
        '& > div': {
            overflow: 'hidden !important'
        },
    }
});

export const HCSHue = styled(Hue)({
    '& .arrow-left': {
        width: 0,
        height: 0,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderRight:'10px solid blue',
    }
});