import {FormHelperText, FormHelperTextProps} from '@mui/material';
import * as React from 'react';

export interface HCFormHelperTextProps extends Omit<FormHelperTextProps, 'sx'> {
    vertical?: boolean;
}

export const HCFormHelperText = ({vertical, ...props}: HCFormHelperTextProps) => {
    return (
        <FormHelperText {...props} sx={{
            mx: 0,
            mt: 1.5,
            ...vertical ? {
                pl: '50%'
            } : {}
        }}/>
    );
};