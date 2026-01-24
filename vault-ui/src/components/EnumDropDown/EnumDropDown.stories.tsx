import type { Meta, StoryObj } from "@storybook/react";
import { EnumDropDown } from "./EnumDropDown";

const meta: Meta<typeof EnumDropDown> = {
  title: "Components/EnumDropDown",
  component: EnumDropDown,
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
};

export default meta;
type Story = StoryObj<typeof EnumDropDown>;

export const Default: Story = {
  args: {
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
    value: "active",
  },
};

export const CustomPlaceholder: Story = {
  args: {
    label: "Role",
    placeholder: "Select a role...",
    options: [
      { label: "Administrator", value: "admin" },
      { label: "User", value: "user" },
    ],
  },
};
