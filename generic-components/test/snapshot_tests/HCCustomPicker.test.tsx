import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCCustomPicker} from '../../src/HCColorPicker/components';

it('should test a default HCCustomPicker', () => {
    const result = render(
        <HCStyledProvider>
            <HCCustomPicker

            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCCustomPicker with a custom color', () => {
    const result = render(
        <HCStyledProvider>
            <HCCustomPicker
                color={'#454545'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
