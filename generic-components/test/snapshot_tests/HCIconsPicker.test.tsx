import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCIconsPicker} from '../../src/HCIcon';

it('should test a default HCIconsPicker', () => {
    const result = render(
        <HCStyledProvider>
            <HCIconsPicker

            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCIconsPicker opened', () => {
    const result = render(
        <HCStyledProvider>
            <HCIconsPicker
                open={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCIconsPicker opened with 5 Columns', () => {
    const result = render(
        <HCStyledProvider>
            <HCIconsPicker
                open={true}
                cols={5}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCIconsPicker opened with 10 Columns', () => {
    const result = render(
        <HCStyledProvider>
            <HCIconsPicker
                open={true}
                cols={10}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCIconsPicker opened with 10 Columns and 250px height', () => {
    const result = render(
        <HCStyledProvider>
            <HCIconsPicker
                open={true}
                cols={10}
                height={'250px'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCIconsPicker opened with 5 Columns and 500px height', () => {
    const result = render(
        <HCStyledProvider>
            <HCIconsPicker
                open={true}
                cols={5}
                height={'500px'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
