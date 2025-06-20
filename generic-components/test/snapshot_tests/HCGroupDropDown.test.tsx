import {HCDropDownValue, HCGroupDropDown} from '../../src/HCDropDown';
import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';

const options: Record<string, HCDropDownValue[]> = {
    One: [
        {
            id: '1',
            value: 'One'
        },
        {
            id: '2',
            value: 'Two'
        },
        {
            id: '3',
            value: 'Three'
        }
    ],
    Two: [
        {
            id: '1-0',
            value: 'One'
        },
        {
            id: '2-1',
            value: 'Two'
        },
        {
            id: '3-2',
            value: 'Three'
        }
    ]
};

it('should test a default HCGroupDropDown', () => {
    const result = render(
        <HCStyledProvider>
            <HCGroupDropDown
                groupOptions={options}
                label={'Default DropDown'}
                id={'Test-ID'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCGroupDropDown with value selected', () => {
    const result = render(
        <HCStyledProvider>
            <HCGroupDropDown
                groupOptions={options}
                label={'Default DropDown'}
                id={'Test-ID'}
                value={{
                    id: '3-2',
                    value: 'Three'
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCGroupDropDown with Error', () => {
    const result = render(
        <HCStyledProvider>
            <HCGroupDropDown
                groupOptions={options}
                label={'Default DropDown with Error'}
                id={'Test-ID'}
                errorText={'Some Error text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCGroupDropDown with Helper', () => {
    const result = render(
        <HCStyledProvider>
            <HCGroupDropDown
                groupOptions={options}
                label={'Default DropDown with Helper'}
                id={'Test-ID'}
                helperText={'Some Helper text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCGroupDropDown with Error and Helper', () => {
    const result = render(
        <HCStyledProvider>
            <HCGroupDropDown
                groupOptions={options}
                label={'Default DropDown with Error and Helper'}
                id={'Test-ID'}
                errorText={'Some Error text'}
                helperText={'Some Helper text'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
