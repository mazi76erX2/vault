import type { Meta, StoryObj } from "@storybook/react";
import { LogoutButton } from "./LogoutButton";
import { Provider } from "react-redux";
import { store } from "@/store";

const meta: Meta<typeof LogoutButton> = {
  title: "Auth/LogoutButton",
  component: LogoutButton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Provider store={store}>
        <div className="p-4 max-w-xs border rounded">
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LogoutButton>;

export const Default: Story = {
  args: {},
};
