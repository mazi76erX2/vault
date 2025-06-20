import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCImageCropper} from '../../src/HCImageCropper';

it('should test a default HCImageCropper', () => {
    const result = render(
        <HCStyledProvider>
            <HCImageCropper
                onClose={() => {}}
                updateAvatar={() => {}}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCImageCropper with imgSrc', () => {
    const result = render(
        <HCStyledProvider>
            <HCImageCropper
                onClose={() => {}}
                updateAvatar={() => {}}
                imgSrc={'https://www.truechart.com/wp-content/uploads/2020/02/1.20_01_22_TRUE-CHART-Logo-V3-ohne-rand.png'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
