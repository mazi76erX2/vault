import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCDropDown, HCDropDownValue} from '../../src/HCDropDown';

const options: HCDropDownValue[] = [
    {
        id: '1',
        value: 'Item 1'
    },
    {
        id: '2',
        value: 'Item 2'
    },
    {
        id: '3',
        value: 'Item 3'
    }
];

it('should test a default HCDropDown', () => {
    const result = render(
        <HCStyledProvider>
            <HCDropDown
                options={options}
                label={'Default DropDown'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDropDown with placeholder', () => {
    const result = render(
        <HCStyledProvider>
            <HCDropDown
                options={options}
                label={'Default DropDown'}
                inputProps={{
                    placeholder: 'Select Option'
                }}
                showPlaceholder
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDropDown with Error', () => {
    const result = render(
        <HCStyledProvider>
            <HCDropDown
                options={options}
                label={'Default DropDown with Error'}
                errorText={'This is some error text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDropDown with Helper', () => {
    const result = render(
        <HCStyledProvider>
            <HCDropDown
                options={options}
                label={'Default DropDown with Helper'}
                helperText={'This is some helper text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDropDown with Error and Helper', () => {
    const result = render(
        <HCStyledProvider>
            <HCDropDown
                options={options}
                label={'Default DropDown with Error and Helper'}
                errorText={'This is some error text'}
                helperText={'This is some helper text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
