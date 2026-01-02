import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Modal } from "./modal";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Feedback/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    title: "Modal Title",
    description: "This is a modal description",
    children: <p>Modal content goes here</p>,
  },
};

export const WithCustomFooter: Story = {
  args: {
    open: true,
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
    children: <p>This action cannot be undone.</p>,
    footer: (
      <>
        <Button variant="outline">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </>
    ),
  },
};

export const LargeModal: Story = {
  args: {
    open: true,
    title: "Large Modal",
    size: "lg",
    children: <p>This is a large modal with more content space</p>,
  },
};

export const SmallModal: Story = {
  args: {
    open: true,
    title: "Small Modal",
    size: "sm",
    children: <p>Compact modal</p>,
  },
};
