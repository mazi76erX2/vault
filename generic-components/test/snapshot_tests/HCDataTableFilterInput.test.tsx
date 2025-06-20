import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCDataTableFilterInput} from '../../src/HCDataTable';

it('should test a default HCDataTableFilterInput', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTableFilterInput
                tableProps={{

                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDataTableFilterInput Custom header Prefix', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTableFilterInput
                tableProps={{
                    headerPrefix: (<span>123</span>)
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
