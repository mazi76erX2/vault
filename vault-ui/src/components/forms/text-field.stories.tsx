import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

// Create a wrapper component for better story display
const TextFieldWrapper = ({ label, ...props }: any) => (
  <div className="w-[350px] space-y-2">
    {label && <Label htmlFor={props.id}>{label}</Label>}
    <Input {...props} />
  </div>
);

const meta = {
  title: 'Forms/TextField',
  component: TextFieldWrapper,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TextFieldWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    id: 'username',
  },
};

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email',
    id: 'email',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    id: 'password',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    placeholder: 'Cannot edit',
    disabled: true,
    id: 'disabled',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Username',
    value: 'johndoe',
    id: 'with-value',
  },
};
