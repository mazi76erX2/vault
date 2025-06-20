import {Box, Tooltip, Typography, TypographyProps} from '@mui/material';
import {InfoOutlined} from '@mui/icons-material';
import React from 'react';
export interface HCHeaderLabelProps {
    typographyProps?: TypographyProps,
    title: React.ReactNode;
    infoIcon?: boolean;
    toolTip?: string;
}
export function HCHeaderLabel(props: HCHeaderLabelProps) {
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
        }}>
            <Typography {...props?.typographyProps} variant={props?.typographyProps?.variant ?? 'h2'} sx={{
                ...props?.typographyProps?.sx,
                mr: 2,
                fontWeight: '500'
            }}>{props.title}</Typography>
            {typeof props.title === 'string' && props.title.length > 0 && (
                <>
                    {
                        props.infoIcon && (
                            props.toolTip ? (
                                <Tooltip title={props.toolTip}>
                                    <InfoOutlined sx={{
                                        color: '#bbb',
                                        cursor: 'pointer'
                                    }} />
                                </Tooltip>
                            ) : (
                                <InfoOutlined sx={{
                                    color: '#bbb',
                                    cursor: 'pointer'
                                }} />
                            )
                        )
                    }
                </>
            )}
        </Box>
    );
}