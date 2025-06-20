import * as React from 'react';
import {Box, Divider, MenuItem, Pagination, Select, styled, Typography, useTheme} from '@mui/material';
import {MUITheme} from '../../theme';
import {
    gridFilteredSortedRowEntriesSelector, gridPageCountSelector,
    gridPageSelector,
    gridPageSizeSelector,
    useGridApiContext
} from '@mui/x-data-grid';

export const HCDataTablePaginationBox = styled(Box)({
    border: 'solid 1px #e4e4e7',
    // boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(9, 9, 11, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    height: '36px'
});

export function HCDataTablePagination() {
    const theme: typeof MUITheme = useTheme();

    const apiRef = useGridApiContext();

    const filteredSortedRowEntriesSelector = gridFilteredSortedRowEntriesSelector(apiRef);

    const resultsCount = filteredSortedRowEntriesSelector.length;

    const pageSize = gridPageSizeSelector(apiRef);

    const pageSelector = gridPageSelector(apiRef);

    const page = pageSelector + 1;

    const pageToCount = React.useMemo(() => {
        const pageResults = pageSize * page;
        if (pageResults > resultsCount) return resultsCount;
        return pageResults;
    }, [pageSize, resultsCount, page]);

    const pageFromCount = React.useMemo(() => {
        if (resultsCount <= 0) return 0;
        return pageSize * pageSelector + 1;
    }, [pageSize, pageSelector, resultsCount]);

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        apiRef.current.setPage(value - 1);
    };

    // console.log(countSelector, pageNo);

    return (
        <>
            <Divider />
            <Box sx={{
                py: '15px',
                px: '25px',
                display: 'flex',
                alignItems: 'center',
            }}>
                <Typography sx={{
                    fontSize: '14px',
                    fontWeight: '500',
                    lineHeight: '1.43',
                }}>Showing {pageFromCount} to {pageToCount} of {resultsCount} results</Typography>
                <Box sx={{flex: 1}}/>
                <HCDataTablePaginationBox>
                    <Typography sx={{
                        py: '8px',
                        px: '12px',
                        fontSize: '14px',
                        lineHeight: '1.43',
                        borderRight: '1px solid #e4e4e7'
                    }}>Per page:</Typography>
                    <Select
                        value={pageSize}
                        onChange={({target}) => {
                            apiRef.current.setPageSize(target.value as number);
                        }}
                        sx={{
                            maxWidth: '90px',
                            height: '40px',
                            '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'transparent',
                                color: theme.textColor.black,
                                borderRadius: 0,
                            },
                            '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {

                            },
                            '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'transparent'
                            },
                            '&.MuiOutlinedInput-root.Mui-error  .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'transparent'
                            },
                            '&.MuiOutlinedInput-root.MuiOutlinedInput-inputAdornedEnd': {

                            },
                            '& .MuiSvgIcon-root': {
                                display: 'none'
                            }
                        }}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                    </Select>
                </HCDataTablePaginationBox>
                <Box sx={{flex: 1}}/>
                <HCDataTablePaginationBox sx={{
                    py: '4px'
                }}>
                    <Pagination page={page} boundaryCount={2} onChange={handleChange} count={gridPageCountSelector(apiRef)} />
                </HCDataTablePaginationBox>
            </Box>
        </>
    );
}
