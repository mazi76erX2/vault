import type { Meta, StoryObj } from '@storybook/react';
import { Draggable, DraggableItem } from './draggable';
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

// Wrapper component to manage state
const DraggableWrapper = ({ initialItems }: { initialItems: DraggableItem[] }) => {
  const [items, setItems] = React.useState(initialItems);
  
  return (
    <div>
      <Draggable items={items} onChange={setItems} />
      <div className="mt-4 p-4 bg-muted rounded-md">
        <p className="text-sm font-semibold mb-2">Current Order:</p>
        <ol className="text-sm space-y-1">
          {items.map((item, index) => (
            <li key={item.id}>{index + 1}. {item.id}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const simpleItems: DraggableItem[] = [
  { id: '1', content: 'Item 1' },
  { id: '2', content: 'Item 2' },
  { id: '3', content: 'Item 3' },
  { id: '4', content: 'Item 4' },
];

const richItems: DraggableItem[] = [
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
  render: () => <DraggableWrapper initialItems={simpleItems} />,
};

export const RichContent: Story = {
  render: () => <DraggableWrapper initialItems={richItems} />,
};

export const ManyItems: Story = {
  render: () => (
    <DraggableWrapper
      initialItems={Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        content: `Item ${i + 1}`,
      }))}
    />
  ),
};
