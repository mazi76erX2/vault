import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Label Text",
  },
};

export const Required: Story = {
  render: (args) => (
    <div className="flex items-center gap-1">
      <Label {...args}>{args.children}</Label>
      <span className="text-destructive">*</span>
    </div>
  ),
  args: {
    children: "Required Field",
  },
};
