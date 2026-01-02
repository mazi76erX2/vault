import type { Meta, StoryObj } from '@storybook/react';
import { Draggable } from './draggable';
import React from 'react';

const meta = {
  title: 'Interaction/Draggable',
  component: Draggable,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Draggable>;

export default meta;
type Story = StoryObj<typeof meta>;

const simpleItems = [
  { id: '1', content: 'Item 1' },
  { id: '2', content: 'Item 2' },
  { id: '3', content: 'Item 3' },
  { id: '4', content: 'Item 4' },
];

const richItems = [
  {
    id: '1',
    content: (
      <div>
        <h3 className="font-semibold">Task 1</h3>
        <p className="text-sm text-muted-foreground">Complete project documentation</p>
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div>
        <h3 className="font-semibold">Task 2</h3>
        <p className="text-sm text-muted-foreground">Review pull requests</p>
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div>
        <h3 className="font-semibold">Task 3</h3>
        <p className="text-sm text-muted-foreground">Update dependencies</p>
      </div>
    ),
  },
];

export const Simple: Story = {
  args: {
    items: simpleItems,
  },
};

export const RichContent: Story = {
  args: {
    items: richItems,
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      { id: '1', content: 'Item 1' },
      { id: '2', content: 'Item 2' },
      { id: '3', content: 'Item 3' },
      { id: '4', content: 'Item 4' },
      { id: '5', content: 'Item 5' },
      { id: '6', content: 'Item 6' },
      { id: '7', content: 'Item 7' },
      { id: '8', content: 'Item 8' },
      { id: '9', content: 'Item 9' },
      { id: '10', content: 'Item 10' },
    ],
  },
};
