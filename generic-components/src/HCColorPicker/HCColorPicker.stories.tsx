import type { Meta, StoryObj } from '@storybook/react';

import { HCColorPicker } from './HCColorPicker';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCColorPicker',
    component: HCColorPicker,
    parameters: getStoryDescription('component', '## About\nA color picker is a graphical user interface widget, usually found within graphics software or online, used to select colors and, in some cases, to create color schemes.\n'),
    argTypes: {
        color: {
            control: { type: 'text' }
        },
        iconColor: {
            control: { type: 'text' }
        },
        fallbackBackgroundColor: {
            control: { type: 'text' }
        },
        updateLive: {
            control: { type: 'boolean' }
        },
        useSelectedAsBackground: {
            control: { type: 'boolean' }
        },
        isDefault: {
            control: { type: 'boolean' }
        },
        triggerButtonDisabled: {
            control: { type: 'boolean' }
        },
        useThemeAsBackground: {
            control: { type: 'boolean' }
        }
    }
} satisfies Meta<typeof HCColorPicker>;

export default meta;
type Story = StoryObj<typeof HCColorPicker>;

export const BasicColorPicker: Story = {
    args: {
        updateLive: true,
        useSelectedAsBackground: false,
        isDefault: true,
        fallbackBackgroundColor: '#fff',
        iconColor:'#000',
        marginRight: '0px',
        marginLeft: '0px',
        triggerButtonDisabled: false,
        useThemeAsBackground: false,
    }
};