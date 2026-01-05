import type { Meta, StoryObj } from "@storybook/react";
import { NumberField } from "./number-field";

const meta = {
  title: "Forms/NumberField",
  component: NumberField,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Quantity",
    value: 1,
  },
};

export const WithMinMax: Story = {
  args: {
    label: "Age",
    value: 25,
    min: 0,
    max: 120,
  },
};

export const WithStep: Story = {
  args: {
    label: "Price",
    value: 99.99,
    step: 0.01,
    min: 0,
  },
};

export const WithoutControls: Story = {
  args: {
    label: "Amount",
    value: 100,
    showControls: false,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Items",
    value: 5,
    helperText: "Maximum 10 items per order",
    max: 10,
  },
};

export const WithError: Story = {
  args: {
    label: "Quantity",
    value: 15,
    error: "Maximum quantity exceeded",
  },
};

export const Disabled: Story = {
  args: {
    label: "Quantity",
    value: 5,
    disabled: true,
  },
};
