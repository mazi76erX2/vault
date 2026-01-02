import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './date-picker';

const meta = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Birth Date',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Birth Date',
    value: new Date(),
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Appointment Date',
    helperText: 'Choose your preferred date',
  },
};

export const WithError: Story = {
  args: {
    label: 'Date',
    error: 'Please select a date',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Date',
    disabled: true,
  },
};
