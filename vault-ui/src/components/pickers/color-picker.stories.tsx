import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from './color-picker';

const meta = {
  title: 'Pickers/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Theme Color',
    value: '#3b82f6',
  },
};

export const Red: Story = {
  args: {
    label: 'Brand Color',
    value: '#ef4444',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Primary Color',
    value: '#10b981',
    helperText: 'Choose your brand primary color',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Color',
    value: '#6366f1',
    disabled: true,
  },
};
