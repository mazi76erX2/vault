import type { Meta, StoryObj } from "@storybook/react";
import { RadioButtonGroup } from "./radio-group";

const meta = {
  title: "Forms/RadioGroup",
  component: RadioButtonGroup,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof RadioButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { id: "1", label: "Option 1" },
  { id: "2", label: "Option 2" },
  { id: "3", label: "Option 3" },
];

export const Default: Story = {
  args: {
    label: "Choose an option",
    options,
  },
};

export const Horizontal: Story = {
  args: {
    label: "Choose an option",
    options,
    orientation: "horizontal",
  },
};

export const WithValue: Story = {
  args: {
    label: "Choose an option",
    options,
    value: "2",
  },
};

export const WithError: Story = {
  args: {
    label: "Choose an option",
    options,
    error: "Please select an option",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Choose an option",
    options,
    helperText: "Select the option that best describes you",
  },
};

export const Disabled: Story = {
  args: {
    label: "Choose an option",
    options,
    disabled: true,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    label: "Choose an option",
    options: [
      { id: "1", label: "Available" },
      { id: "2", label: "Disabled", disabled: true },
      { id: "3", label: "Available" },
    ],
  },
};

export const Small: Story = {
  args: {
    label: "Small size",
    options,
    size: "small",
  },
};

export const Large: Story = {
  args: {
    label: "Large size",
    options,
    size: "large",
  },
};
