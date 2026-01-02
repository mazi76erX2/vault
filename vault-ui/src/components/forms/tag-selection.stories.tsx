import type { Meta, StoryObj } from "@storybook/react";
import { TagSelection } from "./tag-selection";

const meta = {
  title: "Forms/TagSelection",
  component: TagSelection,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof TagSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Skills",
    tags: [],
    placeholder: "Add a skill...",
  },
};

export const WithTags: Story = {
  args: {
    label: "Technologies",
    tags: ["React", "TypeScript", "Tailwind CSS"],
  },
};

export const WithMaxTags: Story = {
  args: {
    label: "Select up to 3 tags",
    tags: ["Tag 1", "Tag 2"],
    maxTags: 3,
    helperText: "Maximum 3 tags allowed",
  },
};

export const WithError: Story = {
  args: {
    label: "Tags",
    tags: [],
    error: "At least one tag is required",
  },
};

export const Disabled: Story = {
  args: {
    label: "Tags",
    tags: ["React", "TypeScript"],
    disabled: true,
  },
};
