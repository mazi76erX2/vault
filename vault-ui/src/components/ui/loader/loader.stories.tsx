import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "./loader";

const meta: Meta<typeof Loader> = {
  title: "UI/Loader",
  component: Loader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    className: "h-8 w-8 text-primary",
  },
};

export const Large: Story = {
  args: {
    className: "h-16 w-16 text-muted-foreground",
  },
};
