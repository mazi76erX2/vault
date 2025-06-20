import type { Meta, StoryObj } from '@storybook/react';

import {getStoryDescription} from '../utils';
import {HCTagSelection, HCTagSelectionOptionValue} from './HCTagSelection';

const meta = {
    title: 'Components/HCTagSelection',
    component: HCTagSelection,
    parameters: {
        docs: {
            description: {
                component: '## About\nSelect components are used for collecting user provided information from a list of options.'
            }
        }
    }
} satisfies Meta<typeof HCTagSelection>;

export default meta;

type Story = StoryObj<typeof HCTagSelection>;

const options: HCTagSelectionOptionValue[] = [
    {
        id: '1',
        name: 'One',
        companyRegNo: 'A001',
        queryId: ''
    },
    {
        id: '2',
        name: 'Two',
        companyRegNo: 'A001',
        queryId: ''
    },
    {
        id: '3',
        name: 'Three',
        companyRegNo: 'A001',
        queryId: ''
    },
    {
        id: '4',
        name: '8888888888888888888888888888888888888888888888888888888888888888888888888888888888',
        companyRegNo: 'A001',
        queryId: ''
    }
];
const helperText = 'Helper';
const errorText = 'Error';

export const BasicHCTagSelection: Story = {
    args: {
        label: 'Select',
        maxWidth: '250px',
        options,
        onDropdownClick: () => {
            console.log('Handle a custom action');
        }
    },
    parameters: getStoryDescription('story', 'A basic Select or dropdown input, with 3 options to select from.')
};

export const HCTagSelectionWithError: Story = {
    args: {
        label: 'Select',
        options,
        errorText,
    },
    parameters: getStoryDescription('story', 'A Select or dropdown input, with an `errorText` message.')
};

export const HCTagSelectionWithHelper: Story = {
    args: {
        label: 'Select',
        options,
        helperText,
    },
    parameters: getStoryDescription('story', 'A Select or dropdown input with a `helperText` message.')
};

export const HCTagSelectionWithBothHelperAndError: Story = {
    args: {
        label: 'Select',
        options,
        helperText,
        errorText,
    },
    parameters: getStoryDescription('story', 'A Select or dropdown input with both the `errorText` and the `helperText` set.')
};