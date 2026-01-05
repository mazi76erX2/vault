import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Alignment } from "./alignment";

const meta = {
  title: "Layout/Alignment",
  component: Alignment,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Alignment>;

export default meta;
type Story = StoryObj<typeof meta>;

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary text-primary-foreground p-4 rounded">
      {children}
    </div>
  );
}

export const CenterCenter: Story = {
  args: {
    horizontal: "center",
    vertical: "center",
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    horizontal: "between",
    vertical: "center",
    children: (
      <>
        <Box>Left</Box>
        <Box>Center</Box>
        <Box>Right</Box>
      </>
    ),
  },
};

export const Column: Story = {
  args: {
    direction: "column",
    horizontal: "center",
    vertical: "center",
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
};

export const WithGap: Story = {
  args: {
    horizontal: "center",
    vertical: "center",
    gap: 8,
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
};
