import type { Meta, StoryObj } from "@storybook/react";
import { ThemeToggle } from "./theme-toggle";
import { ThemeProvider } from "./theme-provider";

const meta: Meta<typeof ThemeToggle> = {
  title: "Theme/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light" storageKey="storybook-theme">
        <div className="p-8 flex justify-center">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  args: {},
};
