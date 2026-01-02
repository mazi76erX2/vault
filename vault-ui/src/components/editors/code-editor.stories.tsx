import type { Meta, StoryObj } from '@storybook/react';
import { CodeEditor } from './code-editor';

const meta = {
  title: 'Editors/CodeEditor',
  component: CodeEditor,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CodeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const JavaScript: Story = {
  args: {
    label: 'JavaScript Code',
    language: 'javascript',
    value: 'function hello() {\n  console.log("Hello World!");\n}',
  },
};

export const Python: Story = {
  args: {
    label: 'Python Code',
    language: 'python',
    value: 'def hello():\n    print("Hello World!")',
  },
};

export const JSON: Story = {
  args: {
    label: 'JSON Data',
    language: 'json',
    value: '{\n  "name": "John",\n  "age": 30\n}',
  },
};

export const HTML: Story = {
  args: {
    label: 'HTML',
    language: 'html',
    value: '<div>\n  <h1>Hello World</h1>\n</div>',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    language: 'javascript',
    value: 'const greeting = "Hello World";',
    readOnly: true,
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Code',
    placeholder: 'Enter your code here...',
  },
};

export const Tall: Story = {
  args: {
    label: 'Large Editor',
    language: 'javascript',
    height: '400px',
    value: 'function example() {\n  // Add your code here\n}',
  },
};
