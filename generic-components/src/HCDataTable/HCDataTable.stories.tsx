import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HCDataTable, HCDataTableProps} from './HCDataTable';
import { useDemoData,  } from '@mui/x-data-grid-generator';
import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {HCIcon} from '../HCIcon';

const rows = [
    { id: 1, col1: 'Hello', col2: 'World' },
    { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 3, col1: 'MUI', col2: 'is Amazing' },
];

const columns: GridColDef[] = [
    { field: 'col1', headerName: 'Column 1', width: 150 },
    { field: 'col2', headerName: 'Column 2', width: 150 },
];

const meta: Meta<HCDataTableProps> = {
    title: 'Components/HCDataTable',
    component: HCDataTable,
} satisfies Meta<typeof HCDataTable>;

export default meta;

type Story = StoryObj<typeof HCDataTable>;

export const HCDataTableBasic: Story = {
    args: {
        columns,
        rows,
    }
};

export const HCDataTableBasicActions: Story = {
    args: {
        columns,
        rows,
        actions: {
            save: {
                icon: (
                    <HCIcon icon={'Share2'} />
                ),
                onClick(params: GridRenderCellParams) {
                    console.log(params.row);
                }
            },
            delete: {
                icon: (
                    <HCIcon icon={'Trash'} />
                ),
                onClick(params: GridRenderCellParams) {
                    console.log(params.row);
                }
            },
            'camera': {
                icon: (
                    <HCIcon icon={'Camera'} />
                ),
                onClick(p) {
                    console.log(p.row);
                }
            }
        }
    }
};

export const HCDataTableFromMUICommodity: Story = {
    args: {
        columns: [],
        rows: [],
    },
    render(props) {
        const { data } = useDemoData({
            dataSet: 'Commodity',
            rowLength: 400,
            maxColumns: 14,
        });
        return (
            <HCDataTable {...props}  {...data} />
        );
    }
};

export const HCDataTableFromMUIEmployee: Story = {
    args: {
        columns: [],
        rows: [],
    },
    render(props) {
        const { data } = useDemoData({
            dataSet: 'Employee',
            rowLength: 200,
            maxColumns: 12,
        });
        return (
            <HCDataTable {...props}  {...data} />
        );
    }
};

export const HCDataTableFromMUIEmployeeLoading: Story = {
    args: {
        columns: [],
        rows: [],
    },
    render(props) {
        const { data } = useDemoData({
            dataSet: 'Employee',
            rowLength: 200,
            maxColumns: 12,
        });
        return (
            <HCDataTable {...props}  {...data} loading={true} />
        );
    }
};


