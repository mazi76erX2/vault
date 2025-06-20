import type { Meta, StoryObj } from '@storybook/react';

import {HCDancingBot} from './HCDancingBot';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCDancingBot',
    component: HCDancingBot,
    parameters: getStoryDescription('component', '## About\nLoading bots.\n')
} satisfies Meta<typeof HCDancingBot>;

export default meta;

type Story = StoryObj<typeof HCDancingBot>;

export  const BasicHCDancingBot: Story = {
    args: {
        className: 'HCDancingBot'
    },
};