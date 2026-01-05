import type { Meta, StoryObj } from "@storybook/react";
import { Rocket, Settings, Users, Mail } from "lucide-react";
import React from "react";
import { CardButton } from "./card-button";

const meta = {
  title: "Data Display/CardButton",
  component: CardButton,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof CardButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Create Project",
    description: "Start a new project from scratch",
  },
};

export const WithIcon: Story = {
  args: {
    title: "Quick Start",
    description: "Get started with a template",
    icon: <Rocket className="h-6 w-6" />,
  },
};

export const Selected: Story = {
  args: {
    title: "Selected Option",
    description: "This option is currently selected",
    icon: <Settings className="h-6 w-6" />,
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    title: "Disabled Option",
    description: "This option is not available",
    icon: <Users className="h-6 w-6" />,
    disabled: true,
  },
};

export const WithContent: Story = {
  args: {
    title: "Email Campaign",
    description: "Send emails to your subscribers",
    icon: <Mail className="h-6 w-6" />,
    children: (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Features:</p>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Automated sending</li>
          <li>Analytics tracking</li>
          <li>A/B testing</li>
        </ul>
      </div>
    ),
  },
};
