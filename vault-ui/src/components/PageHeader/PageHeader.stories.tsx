import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./PageHeader";
import { Button } from "../ui/button/button";

const meta: Meta<typeof PageHeader> = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "User Management",
    description: "Manage your team members and their roles here.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Dashboard",
    description: "Welcome back, Admin!",
    children: (
      <div className="flex gap-2">
        <Button variant="outline">Export</Button>
        <Button>Add User</Button>
      </div>
    ),
  },
};
