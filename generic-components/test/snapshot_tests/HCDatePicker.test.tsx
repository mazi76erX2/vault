import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCDatePicker} from '../../src/HCDatePicker';

it('should test a default HCDatePicker', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker Open', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                testDefaultOpen={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker SaveOnly', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                saveOnly={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker SaveOnly Open', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                testDefaultOpen={true}
                saveOnly={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker Vertical', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                vertical={true}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker with label', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                label={'Some Date Label'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker with label Required', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                label={'Some Date Label'}
                required
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker with value', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                value={'2024-10-10'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker with invalid value', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                value={'2024-20-50'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker with min Date', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                minDate={new Date('2030-01-01')}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDatePicker with max Date', () => {
    const result = render(
        <HCStyledProvider>
            <HCDatePicker
                maxDate={new Date('2024-01-01')}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
