import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Type something...",
    disabled: false,
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "user@example.com",
  },
};

export const Disabled: Story = {
  args: {
    value: "Cannot edit this",
    disabled: true,
  },
};

export const FileInput: Story = {
  args: {
    type: "file",
  },
};
