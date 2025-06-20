import * as React from 'react';
import {Box, OutlinedInput, OutlinedInputProps, Stack, TextFieldProps, useTheme} from '@mui/material';
import {MUITheme} from '../../theme';
import {HCHeaderLabel} from '../../HCHeaderLabel';
import {HCButton} from '../../HCButton';
import {FilterAltOutlined} from '@mui/icons-material';
import {HCDataTableProps} from '../HCDataTable';
import {BaseTextFieldPropsOverrides} from '@mui/x-data-grid';

export interface HCDataTableFilterInputProps extends OutlinedInputProps {
    tableProps: Partial<HCDataTableProps>;
    bTFProps?: TextFieldProps & BaseTextFieldPropsOverrides;
}

export function HCDataTableFilterInput(props: HCDataTableFilterInputProps) {
    const theme: typeof MUITheme = useTheme();
    const {tableProps, bTFProps, ...restInputProps} = props;
    const {heading, noFilter, headerPrefix, customSearchInput} = tableProps;

    const sx = {
        fontSize: '14px',
        height: '40px',
        '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
            // borderColor: 'transparent',
            color: theme.textColor.black,
        },
        '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {},
        '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.hcPalette.primary['500']!['hex']
        },
        '&.MuiOutlinedInput-root.Mui-error  .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.error.hex
        },
        '&.MuiOutlinedInput-root.MuiOutlinedInput-inputAdornedEnd': {},
        '& input': {
            padding: '10px 12px 6px 12px'
        }
    };

    return (
        <Stack sx={{
            width: '100%',
            borderBottom: '1px solid #b2b1b1',
            ...props.sx,
        }}>
            {headerPrefix && headerPrefix}
            <Box sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: !noFilter ? 'auto 250px' : 'auto 250px 40px',
                gridGap: '16px',
                px: '25px',
                py: 2.75
            }}>
                <HCHeaderLabel title={heading ?? ''} infoIcon={true} />
                {/*<HCTextField {...inputProps} />*/}
                {customSearchInput ? (
                    <>{customSearchInput}</>
                ) : (bTFProps ? (<OutlinedInput
                    aria-label={bTFProps['aria-label']}
                    className={bTFProps.className}
                    onChange={bTFProps.onChange}
                    placeholder={bTFProps.placeholder}
                    type={bTFProps.type}
                    inputProps={bTFProps.inputProps}
                    sx={sx}
                />) : (<OutlinedInput
                    {...restInputProps}
                    sx={sx}
                />))}
                {!!noFilter && (
                    <HCButton hcVariant={'tertiary'} size={'small'} startIcon={
                        <FilterAltOutlined sx={{
                            color: '#292929'
                        }} />
                    } />
                )}
            </Box>
        </Stack>
    );
}
