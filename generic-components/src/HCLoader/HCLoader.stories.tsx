import type { Meta, StoryObj } from '@storybook/react';

import {HCLoader} from './HCLoader';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCLoader',
    component: HCLoader,
    parameters: getStoryDescription('component', '## About\nLoading spinner.\n')
} satisfies Meta<typeof HCLoader>;

export default meta;

type Story = StoryObj<typeof HCLoader>;

export  const BasicHCLoader: Story = {
    args: {
        className: 'HCLoader'
    },
};