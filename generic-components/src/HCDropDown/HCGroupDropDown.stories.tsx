import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {HCGroupDropDown} from './HCGroupDropDown';
import {HCDropDownValue} from './HCDropDown';

const meta = {
    title: 'Components/HCGroupDropDown',
    component: HCGroupDropDown,
    parameters: {
        docs: {
            description: {
                component: '## About\nSelect components are used for collecting user provided information from a list of options.'
            }
        }
    }
} satisfies Meta<typeof HCGroupDropDown>;

export default meta;

type Story = StoryObj<typeof HCGroupDropDown>;

const options = [
    {
        id: '1',
        value: 'One'
    },
    {
        id: '2',
        value: 'Two'
    },
    {
        id: '3',
        value: 'Three'
    }
];

const groupOptions = {
    'One': options,
    'Two': options.map((o, index) => ({
        ...o,
        id: `${o.id}-${index}`,
    }))
};

export const GroupDropDown: Story = {
    args: {
        label: 'Group Select',
        inputProps: {
            placeholder: 'Select'
        },
        groupOptions,
        // value: options[0]
    }
};

export const StateFulGroupDD: Story = {
    args: {
        label: 'Group Select',
        inputProps: {
            placeholder: 'Select'
        },
        groupOptions,
    },
    render(args) {
        const [value, setValue] = React.useState<HCDropDownValue>();
        return (
            <HCGroupDropDown {...args} id={'items'} value={value} onChange={(val) => {
                console.log(val);
                setValue(val);
            }} />
        );
    }
};
