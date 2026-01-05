import type { Meta, StoryObj } from "@storybook/react";
import { DancingBot } from "./dancing-bot";

const meta = {
  title: "Media/DancingBot",
  component: DancingBot,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DancingBot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    size: "xl",
  },
};

export const NoLoop: Story = {
  args: {
    size: "md",
    loop: false,
  },
};
