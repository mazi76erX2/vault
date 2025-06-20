import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {HCDraggable, HCDraggableProps, DraggableItem} from './HCDraggable';
import {HCHeaderLabel} from '../HCHeaderLabel';
import {Box} from '@mui/material';
interface ExtendedDragItem extends DraggableItem {
     name: string;
 }


const meta: Meta<HCDraggableProps> = {
    title: 'Components/HCDraggable',
    component: HCDraggable,
} satisfies Meta<typeof HCDraggable>;

export default meta;

type Story = StoryObj<typeof HCDraggable>;

export const BasicDraggable: Story = {
    args: {
        data: [
            {id: '1', name: 'Item 1'},
            {id: '2', name: 'Item 2'},
            {id: '3', name: 'Item 3'}
        ],
        keyExtractor: (item: DraggableItem) => item.id,
        onReorder: (newItems: DraggableItem[]) => {
            return newItems;
        },
        renderItem: (item: DraggableItem, index: number) => {
            const exampleItem = item as ExtendedDragItem;
            return (
                <Box sx={{m:2}} key={index}>
                    <HCHeaderLabel title={exampleItem.name}/>
                </Box>
            );
        },
        isRow: false
    },
};