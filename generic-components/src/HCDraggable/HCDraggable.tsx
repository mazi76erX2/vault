import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {Box, Grid} from '@mui/material';

export interface DraggableItem{
    id: string;
    [key: string]: unknown;
}
export interface HCDraggableProps{
    data: DraggableItem [];
    renderItem: (item: DraggableItem, index: number) => React.ReactNode;
    keyExtractor: (item: DraggableItem, index: number) => string;
    droppableId?: string;
    isRow?: boolean;
    onReorder?: (newItems: DraggableItem[]) => void;
}

export const HCDraggable = React.memo(({
    data,
    renderItem,
    keyExtractor,
    droppableId = 'list',
    isRow = false,
    onReorder

}: HCDraggableProps):React.ReactElement => {
    const [items, setItems] = React.useState<DraggableItem[]>(data);

    React.useEffect(() => {
        setItems(data);
    }, [data]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);
        setItems(newItems);
        if (onReorder) {
            onReorder(newItems);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={droppableId}>
                {(provided) => (
                    isRow ? <Grid {...provided.droppableProps} ref={provided.innerRef} container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        {items.map((item:DraggableItem, index) => (
                            <Draggable key={keyExtractor(item, index)} draggableId={keyExtractor(item, index)} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        {renderItem(item, index)}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Grid>:
                        <Box {...provided.droppableProps} ref={provided.innerRef}>
                            {items.map((item, index) => (
                                <Draggable key={keyExtractor(item, index)} draggableId={keyExtractor(item, index)} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            {renderItem(item, index)}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                )}
            </Droppable>
        </DragDropContext>
    );
});

HCDraggable.displayName = 'HCDraggable';
