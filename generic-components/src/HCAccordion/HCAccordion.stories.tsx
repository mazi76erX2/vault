import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {HCAccordion} from './HCAccordion';
import {Box} from '@mui/material';

const meta = {
    title: 'Components/HCAccordion',
    component: HCAccordion,
} satisfies Meta<typeof HCAccordion>;

export default meta;

type Story = StoryObj<typeof HCAccordion>;

export const BasicAccordion: Story = {
    args: {
        title: 'Test Title',
        children: (
            <Box>Test content</Box>
        ),
        titleSx: {
            color: 'red'
        },
        contentSx: {},
        containerSx: {
            // border: '1px solid #000'
        },
        headerSx: {},
    }
};
