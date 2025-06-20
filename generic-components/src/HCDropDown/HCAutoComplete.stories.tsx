import type { Meta, StoryObj } from '@storybook/react';

import {HCAutoComplete} from './HCAutoComplete';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCAutoComplete',
    component: HCAutoComplete,
    parameters: {
        docs: {
            description: {
                component: '## About\nSelect components are used for collecting user provided information from a list of options.'
            }
        }
    }
} satisfies Meta<typeof HCAutoComplete>;

export default meta;

type Story = StoryObj<typeof HCAutoComplete>;

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

export const BasicHCAutoComplete: Story = {
    args: {
        label: 'Select',
        inputProps: {
            placeholder: 'Select'
        },
        options,
        value: options[0],
    },
    parameters: getStoryDescription('story', 'A basic Select or dropdown input, with 3 options to select from.')
};

export const HCAutoCompleteWithError: Story = {
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

export const HCAutoCompleteWithHelper: Story = {
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

export const HCAutoCompleteWithBothHelperAndError: Story = {
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