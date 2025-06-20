import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import {HCTextField} from './HCTextField';
import {KeyboardArrowRight, LockOutlined, Person2Outlined} from '@mui/icons-material';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCTextField',
    component: HCTextField,
    parameters: getStoryDescription('component', '## About\nText Fields let users enter and edit text.\n')
} satisfies Meta<typeof HCTextField>;

export default meta;

type Story = StoryObj<typeof HCTextField>;

export const BasicTextField: Story = {
    args: {
        inputProps: {
            placeholder: 'Basic Text Field'
        },
        label: 'LABEL'
    }
};

export const RequiredTextField: Story = {
    args: {
        inputProps: {
            placeholder: 'Basic Text Field',
        },
        required: true,
        label: 'LABEL'
    }
};

export const TextFieldWithHelperText: Story = {
    args: {
        inputProps: {
            placeholder: 'Text Field With Helper Text'
        },
        label: 'LABEL',
        helperText: 'Helper Text here!!!'
    },
    parameters: getStoryDescription('story', 'Text Field With Helper Text')
};

export const TextFieldWithErrorText: Story = {
    args: {
        inputProps: {
            placeholder: 'Text Field With Error Text'
        },
        label: 'LABEL',
        errorText: 'Error Text here!!!'
    },
    parameters: getStoryDescription('story', 'Text Field With Error Text')
};

export const TextFieldWithErrorHelperText: Story = {
    args: {
        inputProps: {
            placeholder: 'Text Field With Error Text'
        },
        label: 'LABEL',
        errorText: 'Error Text here!!!',
        helperText: 'Helper Text here!!'
    },
    parameters: getStoryDescription('story', '')
};

export const TextFieldWithIcons: Story = {
    args: {
        inputProps: {
            placeholder: 'Text Field With Icons',
            startAdornment: (
                <Person2Outlined />
            ),
            endAdornment: (
                <LockOutlined />
            )
        },
        label: 'LABEL',
        errorText: 'Error Text here!!!'
    },
    parameters: getStoryDescription('story', 'Text Field With Error Text')
};

export const TextFieldWithAction: Story = {
    args: {
        inputProps: {
            placeholder: 'Text Field'
        },
        label: 'LABEL',
        action: {
            hcVariant: 'secondary',
            startIcon: <KeyboardArrowRight />,
            onClick() {
                console.log('clicked');
            }
        }
    },
    parameters: getStoryDescription('story', 'Text Field With an action button')
};

export const MultilineTextField: Story = {
    args: {
        inputProps: {
            placeholder: 'Basic TextArea, default 4 rows',
        },
        required: true,
        type: 'textArea',
        label: 'LABEL'
    },
    parameters: getStoryDescription('story', 'A `<teaxtarea />` input with 4 rows')
};

export const MultilineTextField8Rows: Story = {
    args: {
        inputProps: {
            placeholder: 'Basic Text Field',
            rows: 8
        },
        required: true,
        type: 'textArea',
        label: 'LABEL',
    },
    parameters: getStoryDescription('story', 'A `<textarea />` input with 8 rows')
};