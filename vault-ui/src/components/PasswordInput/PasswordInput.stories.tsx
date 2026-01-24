import type { Meta, StoryObj } from "@storybook/react";
import { PasswordInput } from "./PasswordInput";

const meta: Meta<typeof PasswordInput> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
  },
};

export const WithValue: Story = {
  args: {
    label: "Account Password",
    value: "secret123",
  },
};

export const ErrorState: Story = {
  args: {
    label: "Password",
    error: "Password must be at least 8 characters",
    value: "short",
  },
};

export const Disabled: Story = {
  args: {
    label: "Password",
    disabled: true,
    value: "cannot-edit-this",
  },
};
