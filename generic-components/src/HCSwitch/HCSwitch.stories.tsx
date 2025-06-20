import type { Meta, StoryObj } from '@storybook/react';

import {HCSwitch} from './HCSwitch';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCSwitch',
    component: HCSwitch,
    parameters: getStoryDescription('component', '## About\nSwitches toggle the state of a single setting on or off.\n')
} satisfies Meta<typeof HCSwitch>;

export default meta;

type Story = StoryObj<typeof HCSwitch>;

export  const BasicSwitch: Story = {};