import React from 'react';
import {MUITheme, Theme as HCTheme} from '../theme';
import {ScopedCssBaseline, SxProps, ThemeProvider} from '@mui/material';
import './HCStyledContext.css';

export interface HCStyledContextData {
    theme?: typeof MUITheme,
    hcTheme: typeof HCTheme,
    DataTableStyle: SxProps
}

export const HCStyledContext = React.createContext({} as HCStyledContextData);

interface HCStyledProviderProps {
    children: React.ReactNode;
}

export function HCStyledProvider(props: HCStyledProviderProps){
    const {children} = props;
    const DataTableStyle: SxProps = {
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
    };
    return (
        <ThemeProvider theme={MUITheme}>
            <ScopedCssBaseline style={{height: '100%', fontFamily: 'Arial, serif'}}>
                <HCStyledContext.Provider value={{hcTheme: HCTheme, theme: MUITheme, DataTableStyle}}>
                    {children}
                </HCStyledContext.Provider>
            </ScopedCssBaseline>
        </ThemeProvider>
    );
}

export const useHCStyledContext = () => React.useContext(HCStyledContext);