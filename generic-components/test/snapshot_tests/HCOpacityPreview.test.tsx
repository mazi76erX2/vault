import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import HCOpacityPreview from '../../src/HCColorPicker/components/HCOpacityPreview';

it('should test a default HCOpacityPreview Default True', () => {
    const result = render(
        <HCStyledProvider>
            <HCOpacityPreview
                isDefault={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCOpacityPreview Default False', () => {
    const result = render(
        <HCStyledProvider>
            <HCOpacityPreview
                isDefault={false}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCOpacityPreview Default True Custom Color', () => {
    const result = render(
        <HCStyledProvider>
            <HCOpacityPreview
                isDefault={true}
                color={'#787878'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
