import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { MarkdownView } from "./markdown-view";

const meta = {
  title: "Data Display/MarkdownView",
  component: MarkdownView,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof MarkdownView>;

export default meta;
type Story = StoryObj<typeof meta>;

const simpleContent = "# Hello World\n\nThis is a simple markdown example.";

const complexContent = [
  "# Markdown Demo",
  "",
  "## Features",
  "",
  "- **Bold text**",
  "- *Italic text*",
  "- `inline code`",
  "- [Links](https://example.com)",
  "",
  "### Code Block",
  "",
  "```javascript",
  "function hello() {",
  '  console.log("Hello World!");',
  "}",
  "```",
  "",
  "### Table",
  "",
  "| Name | Age | City |",
  "|------|-----|------|",
  "| John | 30  | NYC  |",
  "| Jane | 25  | LA   |",
  "",
  "### Blockquote",
  "",
  "> This is a blockquote",
  "> with multiple lines",
  "",
  "### Task List",
  "",
  "- [x] Completed task",
  "- [ ] Pending task",
].join("\n");

const codeContent = [
  "```python",
  "def hello():",
  '    print("Hello World!")',
  "```",
].join("\n");

export const Simple: Story = {
  args: {
    content: simpleContent,
  },
};

export const Complex: Story = {
  args: {
    content: complexContent,
  },
};

export const CodeOnly: Story = {
  args: {
    content: codeContent,
  },
};
