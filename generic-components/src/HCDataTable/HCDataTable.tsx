import React from 'react';
import {
    DataGrid,
    GridColDef, GridColumnGroupingModel,
    GridRenderCellParams, GridRowClassNameParams,
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridValidRowModel,
    GridRowParams,
} from '@mui/x-data-grid';
import {Box, styled, SxProps, Tooltip,} from '@mui/material';
import {GridInitialStateCommunity} from '@mui/x-data-grid/models/gridStateCommunity';
import Paper from '@mui/material/Paper';
import {SortedDown, SortedUp, Unsorted} from './components/HCHeaderIcons';
import {MUITheme} from '../theme';
import {HCDataTableFilterInput} from './components/HCDataTableFilterInput';
import {HCDataTablePagination} from './components/HCDataTablePagination';
import {HCLoader} from '../HCLoader';

const StyledDataGrid = styled(DataGrid)({
    '& .MuiDataGrid-columnHeaders': {
        background: '#e7ecee',
        borderRadius: 0,
        // padding: '15px'
        '& :first-of-type': {
            background: '#e7ecee'
        }
    },
    '& .aggregate': {
        background: '#e7ecee',
        fontWeight: '500',

        '& .MuiDataGrid-withBorderColor': {
            flexGrow: 1,
            borderColor: '#313131',

            '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                flexGrow: 1,

                '& .MuiDataGrid-columnHeaderTitle': {
                    flexGrow: 1,
                    textAlign: 'center'
                }
            }
        }
    },
    '& .header': {
        background: '#e7ecee',
        fontWeight: '500',
        paddingLeft: '25px',

        '& .MuiDataGrid-withBorderColor': {
            flexGrow: 1,
            borderColor: '#e7ecee'
        }
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: '500',
        fontSize: '16px'
    },
    '& .MuiDataGrid-cell': {
        padding: '0 25px',
        color: '#000',
        fontSize: '16px'
    },
    '& .MuiDataGrid-filler': {
        display: 'none'
    },
    '& .MuiDataGrid-overlayWrapper': {
        minHeight: '50px'
    }
});

type HCDataTableActionType = 'edit' | 'delete' | 'save';

export interface HCDataTableAction {
    icon: React.ReactNode;

    onClick(params: GridRenderCellParams): void;

    shouldRenderAction?(params: GridRenderCellParams): boolean;

    toolTip?: string;
}

interface HCDataTableActionButtonProps {
    action: HCDataTableAction;
    params: GridRenderCellParams;
}

const HCDataTableActionButton = React.memo((props: HCDataTableActionButtonProps) => {
    const {icon, onClick, toolTip} = props.action;
    const render = () => (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: 2,
            width: '30px',
            height: '100%',
        }} onClick={() => onClick(props.params)}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                p: '4px',
                ':hover': {
                    background: 'rgba(0,0,0,0.2)',
                    // width: '40px',
                    // height: '40px',
                }
            }}>{icon}</Box>
        </Box>
    );
    return toolTip ? (
        <Tooltip disableTouchListener title={toolTip} arrow>
            {render()}
        </Tooltip>
    ) : (
        <>{render()}</>
    );
});

HCDataTableActionButton.displayName = 'HCDataTableActionButton';

export type HCDataTableActions = Record<HCDataTableActionType | string, HCDataTableAction>;

export interface HCDataTableProps {
    columns: GridColDef[];
    rows: Record<string, unknown>[];
    columnGroupingModel?: GridColumnGroupingModel | undefined;
    initialState?: GridInitialStateCommunity;
    heading?: string;
    noFilter?: boolean;
    autoHeight?: boolean;
    containerSx?: SxProps;
    tableSx?: SxProps;
    headerPrefix?: React.ReactNode;
    customSearchInput?: React.ReactNode;
    noHeader?: boolean;
    actions?: ((c: GridRenderCellParams) => HCDataTableActions) | HCDataTableActions;
    loading?: boolean;
    onRowUpdate?: (params: GridValidRowModel) => void;
    onRowUpdateError?: (error: Error) => void;
    pageLimit?: number;
    noPagination?: boolean;
    getRowClassName?:(params: GridRowClassNameParams<GridValidRowModel>) => string;
    onRowClick?: (params: GridRowParams) => void;
}

export const HCDataTable = React.memo((props: HCDataTableProps) => {
    const {
        columns,
        rows,
        autoHeight,
        initialState,
        tableSx,
        containerSx,
        noHeader,
        actions,
        loading,
        columnGroupingModel,
        onRowUpdate,
        onRowUpdateError,
        pageLimit,
        noPagination,
        getRowClassName,
        onRowClick,
    } = props;
    const actionsRef = React.useRef();
    const style: SxProps = {
        height: '100%',
        width: '100%',
        '& .MuiDataGrid-iconButtonContainer': {
            ':focus': {
                outline: 'none !important',
            }
        },
        '& .MuiDataGrid-cell': {
            ':focus': {
                outline: 'none !important',
            },
            ':focus-within': {
                outline: 'none !important',
            },
        },
        '& .MuiDataGrid-columnHeader': {
            ':focus': {
                outline: 'none !important',
            },
            ':focus-within': {
                outline: 'none !important',
            },
        },
        '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: MUITheme!.hcPalette.primary['100']!['hex']
        },
        '& .MuiDataGrid-row.Mui-selected.Mui-hovered': {
            backgroundColor: MUITheme!.hcPalette.primary['100']!['hex']
        },
        ...tableSx,
    };

    const tableRows = React.useMemo(() => {
        if (!actions) return rows;
        return rows.map((row) => {
            return {
                ...row,
                dataTableActions: actions
            };
        });
    }, [actions, rows]);

    const tableColumns = React.useMemo(() => {
        if (!actions) return columns;

        const col: GridColDef = {
            field: 'dataTableActions',
            headerName: '',
            headerClassName: 'data-table-action',
            sortable: false,
            width: Object.keys(actions).length === 1 ? 100 : 70 * Object.keys(actions).length,
            renderCell(params: GridRenderCellParams) {
                const thisActions = typeof actions === 'function' ? actions(params) : actions;
                return (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                        height: '100%',
                    }} ref={actionsRef}>
                        {Object.keys(thisActions).map((k) => {
                            const key = k as HCDataTableActionType;
                            const action = thisActions[key];
                            const shouldRender = action.shouldRenderAction ? action.shouldRenderAction(params) : true;
                            if (!shouldRender) return null;
                            return (
                                <HCDataTableActionButton key={key} action={thisActions[key]} params={params} />
                            );
                        })}
                    </Box>
                );
            }
        };

        return [...columns, col];
    }, [actions, columns]);

    return (
        <Paper sx={{
            height: rows.length === 0 ? '200px' : '100%',
            width: '100%',
            ...containerSx,
        }}>
            <StyledDataGrid
                pageSizeOptions={[5, 10, 25, 50, 100]}
                initialState={{
                    ...initialState,
                    pagination: {paginationModel: {pageSize: pageLimit ? pageLimit : 10}},
                }}
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
                {...autoHeight ? {autoHeight} : {}}
                loading={loading}
                onProcessRowUpdateError={onRowUpdateError}
                processRowUpdate={(params) => {
                    if (onRowUpdate)
                        onRowUpdate(params);
                    return params;
                }}
                slots={{
                    toolbar(props) {
                        if (noHeader) return null;
                        return (
                            <GridToolbarContainer {...props}>
                                <GridToolbarQuickFilter/>
                            </GridToolbarContainer>
                        );
                    },
                    columnSortedDescendingIcon: () => <SortedDown />,
                    columnSortedAscendingIcon: () => <SortedUp />,
                    columnUnsortedIcon: () => <Unsorted />,
                    loadingOverlay() {
                        return (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.5)',
                            }}>
                                <HCLoader />
                            </Box>
                        );
                    },
                    baseTextField: (bTFProps) => {
                        const {value} = bTFProps;

                        return (
                            <HCDataTableFilterInput tableProps={props} value={value} type={'text'} bTFProps={bTFProps} />
                        );
                    },
                    footer() {
                        if (noPagination) return <></>;
                        return (
                            <HCDataTablePagination/>
                        );
                    },
                // pagination(props) {
                //     return <GridPagination ActionsComponent={HCDataTablePagination} {...props} />
                // },
                }}
                slotProps={{
                    toolbar: {
                        variant: 'outlined',
                        sx: {
                            px: 0,
                        },
                    },
                    baseTextField: {},
                }} rowSelection={false} disableColumnMenu
                columns={tableColumns.map((col) => ({
                    ...col,
                    resizable: !!col.resizable,
                    headerClassName: col.headerClassName ? `header ${col.headerClassName}` : 'header',
                }))}
                rows={tableRows}
                onRowClick={onRowClick}
                sx={{
                    ...style, background: 'white',
                    '& .MuiDataGrid-iconButtonContainer': {
                        ':focus': {
                            outline: 'none !important',
                        }
                    },
                    '& .MuiDataGrid-cell': {
                        ':focus': {
                            outline: 'none !important',
                        },
                        ':focus-within': {
                            outline: 'none !important',
                        },
                    },
                    '& .MuiDataGrid-columnHeader': {
                        ':focus': {
                            outline: 'none !important',
                        },
                        ':focus-within': {
                            outline: 'none !important',
                        },
                    },
                    '& .MuiDataGrid-row.Mui-selected': {
                        backgroundColor: MUITheme!.hcPalette.primary['100']!['hex']
                    },
                    '& .MuiDataGrid-row.Mui-selected.Mui-hovered': {
                        backgroundColor: MUITheme!.hcPalette.primary['100']!['hex']
                    }
                }} onFilterModelChange={(e) => {
                    console.log(e);
                }}
                columnGroupingModel={columnGroupingModel?.map((col) => ({
                    ...col,
                    headerClassName: col.headerClassName ? `${col.headerClassName}` : '',
                }))} getRowClassName={getRowClassName}/>
        </Paper>
    );
});

HCDataTable.displayName = 'HCDataTable';
