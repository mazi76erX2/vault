import {expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {HCStyledProvider} from '../../src/HCStyledProvider';
import React from 'react';
import {HCDataTable} from '../../src/HCDataTable';
import {GridColDef} from '@mui/x-data-grid';
import {HCIcon} from '../../src/HCIcon';

const columns: GridColDef[] = [
    {
        field: 'col1',
        headerName: 'Column 1',
        width: 150
    },
    {
        field: 'col2',
        headerName: 'Column 2',
        width: 150
    }
];

const rows: Record<string, unknown>[] = [
    {
        col1: 'Hello',
        col2: 'World',
        id: 1
    },
    {
        col1: 'DataGridPro',
        col2: 'is Awesome',
        id: 2
    },
    {
        col1: 'MUI',
        col2: 'is Amazing',
        id: 3
    }
];

it('should test a default HCDataTable Basic', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTable
                columns={columns}
                rows={rows}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDataTable Basic with Heading', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTable
                columns={columns}
                rows={rows}
                heading={'My Heading'}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDataTable Basic with Heading no filter', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTable
                columns={columns}
                rows={rows}
                heading={'My Heading'}
                noFilter
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDataTable Basic with Heading no pagination', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTable
                columns={columns}
                rows={rows}
                heading={'My Heading'}
                noPagination
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDataTable Basic with Heading no header', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTable
                columns={columns}
                rows={rows}
                heading={'My Heading'}
                noHeader
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});

it('should test a default HCDataTable Basic with All 3 actions', () => {
    const result = render(
        <HCStyledProvider>
            <HCDataTable
                columns={columns}
                rows={rows}
                heading={'My Heading'}
                actions={{
                    save: {
                        icon: (
                            <HCIcon icon={'Unlock'} style={{
                                color: '#000000',
                            }} title={'Activate?'}/>
                        ),
                        onClick() {}
                    },
                    edit: {
                        icon: (
                            <HCIcon icon={'Edit'} style={{
                                color: '#000000',
                            }} title={'Activate?'}/>
                        ),
                        onClick() {}
                    },
                    delete: {
                        icon: (
                            <HCIcon icon={'Trash'} style={{
                                color: '#000000',
                            }} title={'Activate?'}/>
                        ),
                        onClick() {}
                    }
                }}
            />
        </HCStyledProvider>
    );

    expect(result).toMatchSnapshot();
});
