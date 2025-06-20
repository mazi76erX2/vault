import type { Meta, StoryObj } from '@storybook/react';

import { HCButton } from './HCButton';
import {KeyboardArrowLeft, KeyboardArrowRight} from '@mui/icons-material';
import React from 'react';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCButton',
    component: HCButton,
    parameters: getStoryDescription('component', '## About\nButtons allow users to take actions, and make choices, with a single tap.\n')
} satisfies Meta<typeof HCButton>;

export default meta;
type Story = StoryObj<typeof HCButton>

export const Primary: Story = {
    args: {
        text: 'Primary',
        size: 'large'
    },
    parameters: getStoryDescription('story', 'A `primary` button, no elevation or box shadow')
};

export const Secondary: Story = {
    args: {
        text: 'Secondary',
        hcVariant: 'secondary'
    },
    parameters: getStoryDescription('story', 'A `secondary` button, no elevation or box shadow')
};

export const Tertiary: Story = {
    args: {
        text: 'Tertiary',
        hcVariant: 'tertiary'
    },
    parameters: getStoryDescription('story', 'A `tertiary` or outlined button')
};

export const PrimaryOutlined: Story = {
    args: {
        text: 'Primary Outlined',
        size: 'large',
        outlined: true,
    },
    parameters: getStoryDescription('story', 'A `primary` button, no elevation or box shadow')
};

export const SecondaryOutlined: Story = {
    args: {
        text: 'Secondary Outlined',
        hcVariant: 'secondary',
        outlined: true,
    },
    parameters: getStoryDescription('story', 'A `secondary` button, no elevation or box shadow')
};

export const TertiaryOutlined: Story = {
    args: {
        text: 'Tertiary Outlined',
        hcVariant: 'tertiary',
        outlined: true,
    },
    parameters: getStoryDescription('story', 'A `tertiary` or outlined button')
};

export const Elevated: Story = {
    args: {
        text: 'Elevated',
        hcVariant: 'primary',
    },
    parameters: getStoryDescription('story', 'A `primary` button with elevation or box shadow')
};

export const Disabled: Story = {
    args: {
        text: 'Disabled',
        hcVariant: 'tertiary',
        disabled: true
    },
    parameters: getStoryDescription('story', 'A disabled `tertiary` button')
};

export const Small: Story = {
    args: {
        text: 'Small',
        hcVariant: 'primary',
        size: 'small'
    },
    parameters: getStoryDescription('story', 'A small `primary` button')
};

export const Medium: Story = {
    args: {
        text: 'Medium',
        hcVariant: 'secondary',
        size: 'medium'
    },
    parameters: getStoryDescription('story', 'A medium `secondary` button')
};

export const Large: Story = {
    args: {
        text: 'Large',
        hcVariant: 'primary',
        size: 'large'
    },
    parameters: getStoryDescription('story', 'A large `primary` button')
};

export const IconLeft: Story = {
    args: {
        startIcon: <KeyboardArrowLeft />,
        text: 'Icon left'
    },
    parameters: getStoryDescription('story', 'An icon (left) button - `primary`')
};

export const IconRight: Story = {
    args: {
        endIcon: <KeyboardArrowRight />,
        text: 'Icon right'
    },
    parameters: getStoryDescription('story', 'An icon (right) button - `primary`')
};

export const IconLeftRight: Story = {
    args: {
        endIcon: <KeyboardArrowRight />,
        text: 'Icon left Right',
        startIcon: <KeyboardArrowLeft />,
    },
    parameters: getStoryDescription('story', 'An icon (left & right) button - `primary`')
};

export const IconOnly: Story = {
    args: {
        startIcon: <KeyboardArrowLeft />,
        size: 'small'
    }
};

export const IconOnlySecondary: Story = {
    args: {
        startIcon: <KeyboardArrowLeft />,
        size: 'medium',
        hcVariant: 'secondary'
    }
};

export const IconOnlyTertiary: Story = {
    args: {
        startIcon: <KeyboardArrowLeft />,
        size: 'large',
        hcVariant: 'tertiary'
    }
};
