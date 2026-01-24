import type { Meta, StoryObj } from "@storybook/react";
import { UserListTable } from "./UserListTable";

const meta: Meta<typeof UserListTable> = {
  title: "Components/UserListTable",
  component: UserListTable,
  tags: ["autodocs"],
  argTypes: {
    onEdit: { action: "edit" },
    onDelete: { action: "delete" },
  },
};

export default meta;
type Story = StoryObj<typeof UserListTable>;

const mockUsers = [
  {
    id: "1",
    username: "jdoe",
    email: "john.doe@example.com",
    createdAt: "2023-10-01T10:00:00Z",
  },
  {
    id: "2",
    username: "asmith",
    email: "alice.smith@example.com",
    createdAt: "2023-11-15T14:30:00Z",
  },
];

export const Default: Story = {
  args: {
    users: mockUsers,
  },
};

export const Editable: Story = {
  args: {
    users: mockUsers,
    onEdit: (user) => console.log("Edit user:", user),
  },
};

export const Deletable: Story = {
  args: {
    users: mockUsers,
    onDelete: (user) => console.log("Delete user:", user),
  },
};

export const Empty: Story = {
  args: {
    users: [],
  },
};
