import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';
import {HCTextareaAutosize} from './HCTextareaAutosize';
import { HCIcon } from '../HCIcon';
import { Box } from '@mui/material';

const meta = {
    title: 'Components/HCTextareaAutosize',
    component: HCTextareaAutosize,
} satisfies Meta<typeof HCTextareaAutosize>;

export default meta;

type Story = StoryObj<typeof HCTextareaAutosize>;

export const BasicTextareaAutosize: Story = {
    args: {
        inputProps: {
            placeholder: 'Basic Text Field'
        },
        label: 'LABEL',
    }
};

export const RequiredTextareaAutosize: Story = {
    args: {
        inputProps: {
            placeholder: 'Basic Text Field',
        },
        required: true,
        label: 'LABEL'
    }
};

export const TextareaAutosizeWithHelperText: Story = {
    args: {
        inputProps: {
            placeholder: 'Text Field With Helper Text'
        },
        label: 'LABEL',
        helperText: 'Helper Text here!!!'
    },
};

export const TextareaAutosizeWithAction: Story = {
    args: {
        inputProps: {
            endAdornment: (
                <Box sx={{
                    display: 'flex',
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    padding: '16px 14px',
                }}>
                    <HCIcon icon='Send'/>
                </Box>
            ),
            placeholder: 'Placeholder'
        },
        label: 'LABEL',
        inputPadding: '0 16px 0 0 !important'
    }
};