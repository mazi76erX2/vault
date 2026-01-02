import type { Meta, StoryObj } from "@storybook/react";
import { RichEditor } from "./rich-editor";

const meta = {
  title: "Editors/RichEditor",
  component: RichEditor,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof RichEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Description",
    placeholder: "Enter your description...",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Post Content",
    placeholder: "Write your post...",
    helperText: "Supports rich text formatting",
  },
};

export const WithError: Story = {
  args: {
    label: "Content",
    error: "Content is required",
  },
};

export const ReadOnly: Story = {
  args: {
    label: "Preview",
    readOnly: true,
  },
};

export const Tall: Story = {
  args: {
    label: "Article",
    placeholder: "Write your article...",
    minHeight: "400px",
  },
};
