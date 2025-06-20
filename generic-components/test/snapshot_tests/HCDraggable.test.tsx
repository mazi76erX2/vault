import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {DraggableItem, HCDraggable} from '../../src/HCDraggable';
import {ListItemButton, ListItemText, Tooltip} from '@mui/material';

const options: DraggableItem[] = [
    {
        id: '1',
        name: 'Item 1'
    },
    {
        id: '2',
        name: 'Item 2'
    },
    {
        id: '3',
        name: 'Item 3'
    },
    {
        id: '4',
        name: 'Item 4'
    }
];

it('should test a default HCDraggable', () => {
    const result = render(
        <HCStyledProvider>
            <HCDraggable
                data={options}
                keyExtractor={(item: DraggableItem) => (item as { id: string }).id}
                renderItem={(m:DraggableItem, index: number) => {
                    const name = (m.name as string);
                    const id = (m.id as string);

                    return (
                        <Tooltip key={index} title={name} arrow placement={'right'}>
                            <ListItemButton key={index} onClick={() => {}} >
                                <ListItemText>{id}_{name}</ListItemText>
                            </ListItemButton>
                        </Tooltip>
                    );
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDraggable Row', () => {
    const result = render(
        <HCStyledProvider>
            <HCDraggable
                isRow={true}
                data={options}
                keyExtractor={(item: DraggableItem) => (item as { id: string }).id}
                renderItem={(m:DraggableItem, index: number) => {
                    const name = (m.name as string);
                    const id = (m.id as string);

                    return (
                        <Tooltip key={index} title={name} arrow placement={'right'}>
                            <ListItemButton key={index} onClick={() => {}} >
                                <ListItemText>{id}_{name}</ListItemText>
                            </ListItemButton>
                        </Tooltip>
                    );
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
