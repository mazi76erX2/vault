import type { Meta, StoryObj } from '@storybook/react';
import { HCIconSearchField } from './HCIconSearchField';
import { getStoryDescription } from '../utils';
import { createEditor } from 'lexical';

const meta = {
    title: 'Components/HCIconSearchField',
    component: HCIconSearchField,
    parameters: getStoryDescription(
        'component',
        '## About\nThe `HCIconSearchField` allows users to search for icons and insert them into the editor.'
    ),
} satisfies Meta<typeof HCIconSearchField>;

export default meta;
type Story = StoryObj<typeof HCIconSearchField>;

const editor = createEditor({});

export const Default: Story = {
    args: {
        placeholder: 'Search icon',
        editor,
    },
    parameters: getStoryDescription('story', 'Default `HCIconSearchField` with search functionality.')
};

export const WithPredefinedValue: Story = {
    args: {
        placeholder: 'Search icon',
        editor,
    },
    parameters: getStoryDescription('story', 'HCIconSearchField with a predefined placeholder.')
};

export const Disabled: Story = {
    args: {
        placeholder: 'Search icon',
        editor,
    },
    parameters: getStoryDescription('story', 'A disabled `HCIconSearchField` where users cannot search for icons.')
};

export const CustomWidth: Story = {
    args: {
        placeholder: 'Search icon',
        editor,
    },
    parameters: getStoryDescription('story', 'HCIconSearchField with custom width styling.')
};
