import type { Preview } from "@storybook/react";
import React from "react";
import "../src/index.css";
import { Toaster } from "sonner";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a1a" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 max-w-4xl mx-auto">
        <Story />
        <Toaster position="bottom-right" richColors />
      </div>
    ),
  ],
};

export default preview;
