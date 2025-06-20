import type { Meta, StoryObj } from '@storybook/react';

import {HCRichEditor} from './HCRichEditor';
import {getStoryDescription} from '../utils';

const meta = {
    title: 'Components/HCRichEditor',
    component: HCRichEditor,
    parameters: getStoryDescription('component', '## About\nButtons allow users to take actions, and make choices, with a single tap.\n')
} satisfies Meta<typeof HCRichEditor>;

export default meta;
type Story = StoryObj<typeof HCRichEditor>

const DEFAULT_CELL_VALUE = '{"root": {"children": [{"children": [{"detail": 0,"format": 0,"mode": "normal","style": "font-size: 14px;font-family: Arial;","text": "","type": "text","version": 1}],"direction": null,"format": "","indent": 0,"style": "font-size: 14px;font-family: Arial;","type": "paragraph","version": 1}],"direction": null,"format": "","indent": 0,"type": "root","version": 1}}';
export const Primary: Story = {
    args: {
        editMode: true,
        inputBackgroundColor: '',
        onValueChange: () => {},
        value: DEFAULT_CELL_VALUE
    },
    parameters: getStoryDescription('story', 'A `primary` button, no elevation or box shadow')
};
