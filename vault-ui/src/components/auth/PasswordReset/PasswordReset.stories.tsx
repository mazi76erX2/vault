import type { Meta, StoryObj } from "@storybook/react";
import { PasswordReset } from "./PasswordReset";

const meta: Meta<typeof PasswordReset> = {
  title: "Auth/PasswordReset",
  component: PasswordReset,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PasswordReset>;

export const Default: Story = {
  args: {
    email: "user@example.com",
    token: "valid-reset-token-123",
  },
};

export const WithoutParams: Story = {
  args: {},
};
