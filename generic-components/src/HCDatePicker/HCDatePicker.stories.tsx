import type { Meta, StoryObj } from '@storybook/react';
import {HCDatePicker, HCDatePickerProps} from './HCDatePicker';
import * as React from 'react';

const meta: Meta<HCDatePickerProps> = {
    title: 'Components/HCDatePicker',
    component: HCDatePicker,
} satisfies Meta<typeof HCDatePicker>;

export default meta;

type Story = StoryObj<typeof HCDatePicker>;

export const BasicDatePicker: Story = {
    args: {
        required: true,
        label: 'Date',
        value: new Date(),
        dateError: '',
    },
};

export const ControlledDatePicker: Story = {
    render() {
        const [date, setDate] = React.useState<Date | undefined>();
        return (
            <HCDatePicker value={date} onDateChange={(value) => {
                console.log('DateChanged', value);
                setDate(value);
            }} />
        );
    }
};