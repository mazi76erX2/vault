import type { Meta, StoryObj } from "@storybook/react";
import { StatusLabel } from "./StatusLabel";

const meta: Meta<typeof StatusLabel> = {
  title: "Components/StatusLabel",
  component: StatusLabel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusLabel>;

export const Success: Story = {
  args: {
    text: "Completed",
    type: "success",
  },
};

export const Warning: Story = {
  args: {
    text: "Pending",
    type: "warning",
  },
};

export const Danger: Story = {
  args: {
    text: "Critical Error",
    type: "danger",
  },
};

export const Info: Story = {
  args: {
    text: "Draft",
    type: "info",
  },
};

export const Loading: Story = {
  args: {
    text: "Optimizing...",
    type: "loading",
  },
};
