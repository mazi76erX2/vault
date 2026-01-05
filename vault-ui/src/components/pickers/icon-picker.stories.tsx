import type { Meta, StoryObj } from "@storybook/react";
import { IconPicker } from "./icon-picker";

const meta = {
  title: "Pickers/IconPicker",
  component: IconPicker,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof IconPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Choose Icon",
  },
};

export const WithValue: Story = {
  args: {
    label: "Menu Icon",
    value: "Home",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Feature Icon",
    helperText: "Select an icon to represent this feature",
  },
};

export const Disabled: Story = {
  args: {
    label: "Icon",
    value: "Settings",
    disabled: true,
  },
};
