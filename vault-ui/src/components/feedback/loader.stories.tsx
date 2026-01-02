import type { Meta, StoryObj } from '@storybook/react';
import { Loader } from './loader';

const meta = {
  title: 'Feedback/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

export const WithText: Story = {
  args: {
    text: 'Loading...',
  },
};

export const WithCustomText: Story = {
  args: {
    size: 'lg',
    text: 'Please wait while we process your request',
  },
};
