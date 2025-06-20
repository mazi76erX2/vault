import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';
import {HCCheckBox, HCCheckBoxOption} from './HCCheckBox';
import {getStoryDescription} from '../utils';
import {Box} from '@mui/material';
import {CheckBoxSize} from '../theme';

const meta = {
    title: 'Components/HCCheckBox',
    component: HCCheckBox,
    parameters: {
        docs: {
            description: {
                component: '## About\nCheckboxes allow the user to select one or more items from a set.\n.'
            }
        }
    }
} satisfies Meta<typeof HCCheckBox>;

export default meta;

type Story = StoryObj<typeof HCCheckBox>;

export const BasicCheckbox: Story = {
    args: {
        hcType: {
            type: 'single',
            checked: true,
        },
        label: 'Checkbox',
        size: CheckBoxSize.Large
    },
    parameters: getStoryDescription('story', 'A simple checkbox input - primary')
};

export const BasicChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            checked: true,
        },
        label: 'Checkbox'
    },
    parameters: getStoryDescription('story', 'A simple checkbox input - primary - `checked`')
};

export const BasicNeutralCheckbox: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'Checkbox',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple checkbox input - neutral')
};

export const BasicNeutralChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            checked: true,
        },
        label: 'Checkbox',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple checkbox input - neutral `checked`')
};

export const BasicDisabledUnChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            disabled: true,
        },
        label: 'Checkbox',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple checkbox input - disabled `unchecked`')
};
export const BasicDisabledChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            disabled: true,
            checked: true
        },
        label: 'Checkbox',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple checkbox input - disabled `checked`')
};

const options: HCCheckBoxOption[] = [
    {
        disabled: true,
        checked: true,
        label: 'Disabled',
        id: 'checkbox1',
    },
    {
        disabled: true,
        checked: false,
        label: 'Disabled - Unchecked',
        id: 'checkbox2',
    },
    {
        checked: true,
        label: 'Active',
        id: 'checkbox3',
    },
    {
        label: 'Inactive',
        id: 'checkbox4',
    }
];
export const BasicGroupChecked: Story = {
    args: {
        hcType: {
            type: 'group',
            options
        },
        label: 'Checkbox group',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A group of checkbox inputs`')
};

export const MediumNeutralCheckbox: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'Checkbox',
        hcVariant: 'neutral',
        size: CheckBoxSize.Medium
    },
    parameters: getStoryDescription('story', 'Medium checkbox input - neutral')
};

export const SmallPrimaryCheckbox: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'Checkbox',
        checkBoxProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Small
    },
    parameters: getStoryDescription('story', 'Small checkbox input - primary')
};

export const SmallLongLabelCheckbox: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'Checkbox - Long text label test',
        checkBoxProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Small
    },
    render(args) {
        return (
            <Box sx={{
                maxWidth: '100px'
            }}>
                <HCCheckBox {...args} />
            </Box>
        );
    },
    parameters: getStoryDescription('story', 'Small checkbox input with a long label text - primary')
};

export const MediumLongLabelCheckbox: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'Checkbox - Long text label test',
        checkBoxProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Medium
    },
    render(args) {
        return (
            <Box sx={{
                maxWidth: '100px'
            }}>
                <HCCheckBox {...args} />
            </Box>
        );
    },
    parameters: getStoryDescription('story', 'Medium checkbox input with a long label text - primary')
};

export const LargeLongLabelCheckbox: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'Checkbox - Long text label test',
        checkBoxProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Large
    },
    render(args) {
        return (
            <Box sx={{
                maxWidth: '100px'
            }}>
                <HCCheckBox {...args} />
            </Box>
        );
    },
    parameters: getStoryDescription('story', 'Large checkbox input with a long label text - primary')
};