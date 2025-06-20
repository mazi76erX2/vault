import type {Meta, StoryObj} from '@storybook/react';

import React from 'react';
import {HCRadioButton, HCRadioButtonOption} from './HCRadioButton';
import {getStoryDescription} from '../utils';
import {Box} from '@mui/material';
import {CheckBoxSize} from '../theme';

const meta = {
    title: 'Components/HCRadioButton',
    component: HCRadioButton,
    parameters: {
        docs: {
            description: {
                component: '## About\nRadioButtons allow the user to select one item from a set of items.\n.'
            }
        }
    }
} satisfies Meta<typeof HCRadioButton>;

export default meta;

type Story = StoryObj<typeof HCRadioButton>;

export const BasicRadioButton: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'RadioButton',
        size: CheckBoxSize.Large,
        onRadioSelect(checked, item: HCRadioButtonOption) {
            console.log(checked, item);
        }
    },
    parameters: getStoryDescription('story', 'A simple RadioButton input - primary')
};

export const BasicChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            checked: true,
        },
        label: 'RadioButton'
    },
    parameters: getStoryDescription('story', 'A simple RadioButton input - primary - `checked`')
};

export const BasicNeutralRadioButton: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'RadioButton',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple RadioButton input - neutral')
};

export const BasicNeutralChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            checked: true,
        },
        label: 'RadioButton',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple RadioButton input - neutral `checked`')
};

export const BasicDisabledUnChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            disabled: true,
        },
        label: 'RadioButton',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple RadioButton input - disabled `unchecked`')
};
export const BasicDisabledChecked: Story = {
    args: {
        hcType: {
            type: 'single',
            disabled: true,
            checked: true
        },
        label: 'RadioButton',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A simple RadioButton input - disabled `checked`')
};

const options: HCRadioButtonOption[] = [
    {
        disabled: true,
        label: 'Disabled',
        id: 'RadioButton1',
    },
    {
        disabled: true,
        label: 'Disabled - Unchecked',
        id: 'RadioButton2',
    },
    {
        label: 'Active',
        id: 'RadioButton3',
    },
    {
        label: 'Inactive',
        id: 'RadioButton4',
    }
];
export const BasicGroupColumn: Story = {
    args: {
        hcType: {
            type: 'group',
            options,
            name: 'ButtonTest',
            defaultValue: options[0]
        },
        label: 'RadioButton group',
        hcVariant: 'neutral'
    },
    parameters: getStoryDescription('story', 'A group of RadioButton inputs`')
};

export const BasicGroupRow: Story = {
    args: {
        hcType: {
            type: 'group',
            options,
            name: 'ButtonTest',
            defaultValue: options[0],
            row: true
        },
        label: 'RadioButton group',
        hcVariant: 'neutral',
    },
    parameters: getStoryDescription('story', 'A group of RadioButton inputs - `row`')
};

export const MediumNeutralRadioButton: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'RadioButton',
        hcVariant: 'neutral',
        size: CheckBoxSize.Medium
    },
    parameters: getStoryDescription('story', 'Medium RadioButton input - neutral')
};

export const SmallPrimaryRadioButton: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'RadioButton',
        radioButtonProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Small
    },
    parameters: getStoryDescription('story', 'Small RadioButton input - primary')
};

export const SmallLongLabelRadioButton: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'RadioButton - Long text label test',
        radioButtonProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Small
    },
    render(args) {
        return (
            <Box sx={{
                maxWidth: '100px'
            }}>
                <HCRadioButton {...args} />
            </Box>
        );
    },
    parameters: getStoryDescription('story', 'Small RadioButton input with a long label text - primary')
};

export const MediumLongLabelRadioButton: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'RadioButton - Long text label test',
        radioButtonProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Medium
    },
    render(args) {
        return (
            <Box sx={{
                maxWidth: '100px'
            }}>
                <HCRadioButton {...args} />
            </Box>
        );
    },
    parameters: getStoryDescription('story', 'Medium RadioButton input with a long label text - primary')
};

export const LargeLongLabelRadioButton: Story = {
    args: {
        hcType: {
            type: 'single',
        },
        label: 'RadioButton - Long text label test',
        radioButtonProps: {
            defaultChecked: true
        },
        size: CheckBoxSize.Large
    },
    render(args) {
        return (
            <Box sx={{
                maxWidth: '100px'
            }}>
                <HCRadioButton {...args} />
            </Box>
        );
    },
    parameters: getStoryDescription('story', 'Large RadioButton input with a long label text - primary')
};