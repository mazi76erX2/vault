import * as React from 'react';
import {Box, Stack, Typography, SxProps} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

export interface HCAccordionProps {
    title: string;
    defaultOpen?: boolean;
    children?: React.ReactNode;
    containerSx?: SxProps;
    titleSx?: SxProps;
    headerSx?: SxProps;
    contentSx?: SxProps;
}

export const HCAccordion = (props: HCAccordionProps) => {
    const {title, children, titleSx, headerSx, contentSx, containerSx, defaultOpen} = props;

    const [isOpen, setIsOpen] = React.useState(defaultOpen ?? true);

    return (
        <Stack sx={{
            margin: '10px 0px',
            padding: '0px',
            ...containerSx,
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid black',
                p: '5px 15px',
                cursor: 'pointer',
                ...headerSx,
            }} onClick={() => setIsOpen((open) => !open)}>
                <Typography sx={{
                    fontWeight: '500',
                    fontSize: '16px',
                    ...titleSx,
                }}>{title}</Typography>
                <Box>
                    {isOpen ?
                        <ArrowDropDownIcon style={{color: 'black'}}/> :
                        <ArrowDropUpIcon style={{color: 'black'}}/>
                    }
                </Box>
            </Box>
            {isOpen &&
                <Box sx={{
                    p: '15px',
                    ...contentSx,
                }}>{children}</Box>}
        </Stack>
    );
};
