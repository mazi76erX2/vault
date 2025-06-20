import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCSwitch} from '../../src/HCSwitch';

it('should test a default HCSwitch', () => {
    const result = render(
        <HCStyledProvider>
            <HCSwitch />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCSwitch Checked', () => {
    const result = render(
        <HCStyledProvider>
            <HCSwitch
                checked={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
