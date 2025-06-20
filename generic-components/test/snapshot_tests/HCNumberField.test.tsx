import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCNumberField} from '../../src/HCNumberField';

it('should test a default HCNumberField', () => {
    const result = render(
        <HCStyledProvider>
            <HCNumberField
                label={'Basic NumberField'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNumberField: Small', () => {
    const result = render(
        <HCStyledProvider>
            <HCNumberField
                label={'Basic NumberField'}
                size={'small'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNumberField: Medium', () => {
    const result = render(
        <HCStyledProvider>
            <HCNumberField
                label={'Basic NumberField'}
                size={'medium'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNumberField: Large', () => {
    const result = render(
        <HCStyledProvider>
            <HCNumberField
                label={'Basic NumberField'}
                size={'large'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNumberField: Required', () => {
    const result = render(
        <HCStyledProvider>
            <HCNumberField
                label={'Basic NumberField'}
                required
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNumberField: Placeholder', () => {
    const result = render(
        <HCStyledProvider>
            <HCNumberField
                label={'Basic NumberField'}
                inputProps={{
                    placeholder: 'Number Field Placeholder'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCNumberField: Text Color Red', () => {
    const result = render(
        <HCStyledProvider>
            <HCNumberField
                label={'Basic NumberField'}
                textColor={'#FF0000'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
