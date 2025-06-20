import {HCDropDownValue} from '../../src/HCDropDown';
import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCAutoComplete} from '../../src/HCDropDown/HCAutoComplete';

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

it('should test a default HCAutoComplete', () => {
    const result = render(
        <HCStyledProvider>
            <HCAutoComplete
                options={options}
                label={'Default DropDown'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCAutoComplete with value selected', () => {
    const result = render(
        <HCStyledProvider>
            <HCAutoComplete
                options={options}
                label={'Default DropDown'}
                value={{
                    id: '2',
                    value: 'Item 2'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCAutoComplete with Error', () => {
    const result = render(
        <HCStyledProvider>
            <HCAutoComplete
                options={options}
                label={'Default DropDown with Error'}
                errorText={'Some error text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCAutoComplete with Helper', () => {
    const result = render(
        <HCStyledProvider>
            <HCAutoComplete
                options={options}
                label={'Default DropDown with Helper'}
                helperText={'Some helper text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCAutoComplete with Error and Helper', () => {
    const result = render(
        <HCStyledProvider>
            <HCAutoComplete
                options={options}
                label={'Default DropDown with Error and Helper'}
                errorText={'Some error text'}
                helperText={'Some helper text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
