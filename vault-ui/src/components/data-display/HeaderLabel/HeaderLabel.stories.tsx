import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Settings } from "lucide-react";
import React from "react";
import { HeaderLabel } from "./header-label";
import { Button } from "@/components/ui/button/button";

const meta = {
  title: "Data Display/HeaderLabel",
  component: HeaderLabel,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof HeaderLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Dashboard",
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "User Settings",
    subtitle: "Manage your account settings and preferences",
  },
};

export const WithIcon: Story = {
  args: {
    title: "Projects",
    subtitle: "Manage your active projects",
    icon: <Settings className="h-6 w-6" />,
  },
};

export const WithActions: Story = {
  args: {
    title: "Team Members",
    subtitle: "Manage your team and permissions",
    actions: (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Member
      </Button>
    ),
  },
};

export const Small: Story = {
  args: {
    title: "Section Title",
    subtitle: "Section description",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    title: "Welcome Back",
    subtitle: "Continue where you left off",
    size: "lg",
  },
};
