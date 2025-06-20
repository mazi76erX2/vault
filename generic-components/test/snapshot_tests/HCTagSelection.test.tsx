import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCTagSelection, HCTagSelectionOptionValue} from '../../src/HCTagSelection';

const options: HCTagSelectionOptionValue[] = [
    {
        companyRegNo: 'A001',
        id: '1',
        name: 'One',
        queryId: ''
    },
    {
        companyRegNo: 'A001',
        id: '2',
        name: 'Two',
        queryId: ''
    },
    {
        companyRegNo: 'A001',
        id: '3',
        name: 'Three',
        queryId: ''
    },
    {
        companyRegNo: 'A001',
        id: '4',
        name: '8888888888888888888888888888888888888888888888888888888888888888888888888888888888',
        queryId: ''
    }
];

it('should test a default HCTagSelection', () => {
    const result = render(
        <HCStyledProvider>
            <HCTagSelection
                label={'Default TagSelection'}
                selectedTags={[]}
                options={options}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCTagSelection with Selected Tags', () => {
    const result = render(
        <HCStyledProvider>
            <HCTagSelection
                label={'Default TagSelection'}
                selectedTags={[
                    {
                        companyRegNo: 'A001',
                        id: '3',
                        name: 'Three',
                        queryId: ''
                    },
                    {
                        companyRegNo: 'A001',
                        id: '4',
                        name: '8888888888888888888888888888888888888888888888888888888888888888888888888888888888',
                        queryId: ''
                    }
                ]}
                options={options}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

