import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [], // No addons - pure Storybook 10
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {},
};

export default config;
