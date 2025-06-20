import type { Meta, StoryObj } from '@storybook/react';

import {HCDropDown} from './HCDropDown';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCDropDown',
    component: HCDropDown,
    parameters: {
        docs: {
            description: {
                component: '## About\nSelect components are used for collecting user provided information from a list of options.'
            }
        }
    }
} satisfies Meta<typeof HCDropDown>;

export default meta;

type Story = StoryObj<typeof HCDropDown>;

const options = [
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
];
const helperText = 'Helper';
const errorText = 'Error';

export const BasicDropDown: Story = {
    args: {
        label: 'Select',
        inputProps: {
            placeholder: 'Select'
        },
        options
    },
    parameters: getStoryDescription('story', 'A basic Select or dropdown input, with 3 options to select from.')
};

export const DropDownWithError: Story = {
    args: {
        label: 'Select',
        options,
        errorText,
        inputProps: {
            placeholder: 'Select'
        },
    },
    parameters: getStoryDescription('story', 'A Select or dropdown input, with an `errorText` message.')
};

export const DropDownWithHelper: Story = {
    args: {
        label: 'Select',
        options,
        helperText,
        inputProps: {
            placeholder: 'Select'
        },
    },
    parameters: getStoryDescription('story', 'A Select or dropdown input with a `helperText` message.')
};

export const DropDownWithBothHelperAndError: Story = {
    args: {
        label: 'Select',
        options,
        helperText,
        errorText,
        inputProps: {
            placeholder: 'Select'
        },
    },
    parameters: getStoryDescription('story', 'A Select or dropdown input with both the `errorText` and the `helperText` set.')
};

export const DropDownWithPlaceholder: Story = {
    args: {
        label: 'Select',
        options,
        inputProps: {
            placeholder: 'Select'
        },
        showPlaceholder: true
    },
    parameters: getStoryDescription('story', 'A Select or dropdown input with a placeholder.')
};