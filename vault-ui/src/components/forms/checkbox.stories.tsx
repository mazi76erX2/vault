import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function CheckboxWrapper({ label, ...props }: any) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox {...props} id={props.id || "checkbox"} />
      {label && <Label htmlFor={props.id || "checkbox"}>{label}</Label>}
    </div>
  );
}

const meta = {
  title: "Forms/Checkbox",
  component: CheckboxWrapper,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof CheckboxWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
};

export const Checked: Story = {
  args: {
    label: "Accept terms",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled Checked",
    disabled: true,
    defaultChecked: true,
  },
};
