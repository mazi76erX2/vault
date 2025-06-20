import type { Meta, StoryObj } from '@storybook/react';

import {HCSegmentTabs} from './HCSegmentTabs';
import {getStoryDescription} from '../utils';
import React from 'react';

const meta = {
    title: 'Components/HCSegmentTabs',
    component: HCSegmentTabs,
    parameters: getStoryDescription('component', '## About\nSwitches toggle Tab vies.\n')
} satisfies Meta<typeof HCSegmentTabs>;

export default meta;

type Story = StoryObj<typeof HCSegmentTabs>;

export  const BasicSegmentTab: Story = {
    args: {
        items: [
            {
                label: 'One',
                render(): React.ReactNode {
                    return 'One';
                }
            },
            {
                label: 'TwoTwoTwoTwoTwoTwo TwoTwoTwoTwoTwoTwo',
                render(): React.ReactNode {
                    return 'Two';
                }
            },
            {
                label: 'Three',
                render(): React.ReactNode {
                    return 'Three';
                }
            }
        ]
    }
};