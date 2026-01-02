import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./text-field";
import { Mail, Search, Eye } from "lucide-react";

const meta = {
  title: "Components/Forms/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    label: "Username",
    placeholder: "Enter username",
  },
};

export const Required: Story = {
  args: {
    label: "Email",
    placeholder: "Enter email",
    required: true,
    type: "email",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Password",
    type: "password",
    helperText: "Must be at least 8 characters",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    placeholder: "Enter email",
    error: "Invalid email address",
    value: "invalid-email",
  },
};

export const WithStartIcon: Story = {
  args: {
    label: "Search",
    placeholder: "Search...",
    startIcon: <Search className="h-4 w-4" />,
  },
};

export const WithEndIcon: Story = {
  args: {
    label: "Email",
    placeholder: "Enter email",
    endIcon: <Mail className="h-4 w-4" />,
  },
};

export const Multiline: Story = {
  args: {
    label: "Description",
    placeholder: "Enter description",
    multiline: true,
    rows: 4,
  },
};

export const WithAction: Story = {
  args: {
    label: "Password",
    type: "password",
    endIcon: <Eye className="h-4 w-4" />,
    onAction: () => alert("Toggle password visibility"),
  },
};
