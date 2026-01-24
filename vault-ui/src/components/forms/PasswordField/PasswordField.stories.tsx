import type { Meta, StoryObj } from "@storybook/react";
import { PasswordField } from "./password-field";

const meta = {
  title: "Forms/PasswordField",
  component: PasswordField,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
    helperText: "Must be at least 8 characters",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
    error: "Password is too short",
  },
};

export const Required: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
    required: true,
  },
};

export const WithoutToggle: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
    showToggle: false,
  },
};

export const Disabled: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
    disabled: true,
  },
};
