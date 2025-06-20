import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {HCCodeEditor} from './HCCodeEditor';


const meta = {
    title: 'Components/HCCodeEditor',
    component: HCCodeEditor,
    parameters: {
        docs: {
            description: {
                component: '## About\nSelect components are used for collecting user provided information from a list of options.'
            }
        }
    }
} satisfies Meta<typeof HCCodeEditor>;

export default meta;

type Story = StoryObj<typeof HCCodeEditor>;


export const BasicHCCodeEditor: Story = {
    args: {
        label: 'Code',
    }
};

export const StateHCCodeEditor: Story = {
    args: {
        label: 'Code With State',
    },
    render(args) {
        const [value, setValue] = React.useState<string>();
        return (
            <HCCodeEditor {...args} id={'items'} value={value} onChange={(val) => {
                console.log(val);
                setValue(val);
            }} />
        );
    }
};
