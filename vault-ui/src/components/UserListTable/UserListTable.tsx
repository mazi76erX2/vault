/* eslint linebreak-style: 0 */
import React from 'react';
import {useTheme} from '@mui/material';
import {GridColDef} from '@mui/x-data-grid';
import moment from 'moment';

import {MUITheme} from 'generic-components/src/theme';
import {
    HCIcon,
    HCDataTable as DataTable,
    HCDataTableActions as DataTableActions,
    HCDataTableProps as DataTableProps
} from 'generic-components';
import {getCurrentUser} from '../../services/auth/Auth.service';

/** Adjust these fields to match your new user schema. */
export interface UserDTO {
    id: string;
    username?: string;
    email?: string;
    createdAt?: string;
}

/** Props for the UserListTable */
interface UserListTableProps {
    users: UserDTO[];

    onEdit?(user: UserDTO): void;

    onDelete?(user: UserDTO): void;

    dataTableProps?: Partial<DataTableProps>;
}

export function UserListTable({
    users,
    onEdit,
    onDelete,
    dataTableProps
}: UserListTableProps) {
    const theme: typeof MUITheme = useTheme();
    const currentUser = getCurrentUser();

    /** Define table actions (edit/delete buttons). */
    const actions: DataTableActions = React.useMemo(() => {
        const actionsObject: DataTableActions = {
            edit: {
                icon: (
                    <HCIcon
                        icon="Edit"
                        style={{color: theme.textColor.black}}
                    />
                ),
                onClick(params) {
                    if (onEdit) onEdit(params.row as UserDTO);
                },
                shouldRenderAction: () => !!onEdit
            },
            delete: {
                icon: (
                    <HCIcon
                        icon="Trash"
                        style={{color: theme.error.hex}}
                    />
                ),
                onClick(params) {
                    if (onDelete) onDelete(params.row as UserDTO);
                },
                shouldRenderAction(): boolean {
                    // Only render delete if onDelete is provided (no further checks)
                    return !!onDelete;
                }
            }
        };

        return actionsObject;
    }, [onEdit, onDelete, currentUser, theme]);

    /** Define the columns displayed in the table. */
    const columns: GridColDef[] = [
        {field: 'username', headerName: 'Username', flex: 1},
        {field: 'email', headerName: 'Email', flex: 1},
        {
            field: 'dateAdded',
            headerName: 'Date Added',
            flex: 1
        }
    ];

    /** Convert the raw users into the row data for DataTable. */
    const rows = React.useMemo(() => {
        return users.map((u) => {
            const data: Record<string, unknown> = {
                ...u,
                dateAdded: u.createdAt
                    ? moment(u.createdAt).format('DD MMM YYYY')
                    : 'N/A'
            };
            return data;
        });
    }, [users]);

    /**
     * If there are no edit/delete actions, we might remove the "actions" column.
     * But if you have a dedicated "actions" column in your table, handle it here.
     */
    const filteredCols = React.useMemo(() => {
        return columns;
    }, [columns]); // or filter out 'actions' if needed

    return (
        <DataTable
            heading="USER LIST"
            initialState={{
                sorting: {
                    sortModel: [{field: 'username', sort: 'asc'}]
                }
            }}
            columns={filteredCols}
            rows={rows}
            actions={actions}
            {...dataTableProps}
        />
    );
}
