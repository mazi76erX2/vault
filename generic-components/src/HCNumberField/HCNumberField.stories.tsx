import type { Meta, StoryObj } from '@storybook/react';

import {getStoryDescription} from '../utils';
import {HCNumberField} from './HCNumberField';

const meta = {
    title: 'Components/HCNumberField',
    component: HCNumberField,
    parameters: getStoryDescription('component', '## About\nNumber Fields let users enter and edit `integer` values.\n')
} satisfies Meta<typeof HCNumberField>;

export default meta;

type Story = StoryObj<typeof HCNumberField>;

export const BasicNumberField: Story = {
    args: {
        inputProps: {
            placeholder: 'Basic Number Field',
        },
        required: true,
        label: 'LABEL'
    },
};