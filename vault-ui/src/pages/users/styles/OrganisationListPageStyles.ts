import { styled, Box, Typography, Grid } from '@mui/material';
import { HCButton } from 'generic-components';

// ================== STYLED COMPONENTS ==================

export const Container = styled('div')({
    width: '100%',
    margin: '0 auto',
    padding: '0 20px',
});

export const ButtonContainer = styled('div')({
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    justifyContent: 'flex-end',
});

export const CheckboxRow = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '20px',
});

export const Title = styled('h2')({
    marginBottom: '20px',
    fontWeight: 'bold'
});

export const Subtitle = styled('h3')({
    marginTop: '30px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
});

export const FieldLabel = styled('div')({
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
    '&::after': {
        content: '"*"',
        color: 'red',
        marginLeft: '2px'
    }
});

export const InfoIconText = styled('span')({
    color: '#888',
    cursor: 'pointer',
    fontSize: '18px',
    marginLeft: '5px'
});

// Directory Browser Styles
export const DirectoryTableContainer = styled(Box)({
    width: '100%',
    minWidth: '800px',
    overflow: 'auto'
});

export const DirectoryUserFormContainer = styled(Box)({
    marginTop: '24px'
});

export const FormLabelTypography = styled(Typography)({
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: 'black',
    fontSize: '14px'
});

export const RequiredFieldSpan = styled('span')({
    color: 'red'
});

export const GridSpacingTop = styled(Grid)({
    marginTop: '8px'
});

export const RolesContainer = styled(Box)({
    marginTop: '24px'
});

export const ImportButtonsContainer = styled(Box)({
    marginTop: '32px',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
});

// Main Table Styles  
export const MainTableContainer = styled(Box)({
    marginTop: '16px',
    marginBottom: '32px'
});

export const AddFromDirectoryButton = styled(HCButton)({
    marginTop: '16px',
    marginBottom: '32px',
    background: '#e66334',
    '&:hover': {
        background: '#FF8234'
    }
});

export const AddUserButton = styled(HCButton)({
    marginTop: '16px',
    marginBottom: '32px',
    background: '#e66334',
    '&:hover': {
        background: '#FF8234'
    }
});

export const CancelButton = styled(HCButton)({
    marginTop: '16px',
    marginBottom: '32px'
});

export const SaveButton = styled(HCButton)({
    marginTop: '16px',
    background: '#e66334',
    '&:hover': {
        background: '#FF8234'
    }
});

export const SaveDirectoryButton = styled(HCButton)({
    marginTop: '16px',
    background: '#e66334',
    '&:hover': {
        background: '#FF8234'
    }
});

export const CancelDirectoryButton = styled(HCButton)({
    marginTop: '16px'
});

// Table styling objects
export const directoryTableSx = {
    minWidth: '100%',
    width: '100%',
    '& .MuiDataGrid-root': {
        minHeight: 400,
    },
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        fontWeight: 'bold'
    },
    '& .MuiDataGrid-cell': {
        fontSize: '14px',
        padding: '8px 12px',
    },
    '& .MuiDataGrid-row': {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#f9f9f9'
        }
    },
    '& .MuiDataGrid-row.selected': {
        backgroundColor: '#e3f2fd !important',
        '&:hover': {
            backgroundColor: '#bbdefb !important'
        }
    }
};

export const mainTableSx = {
    height: '50vh',
    '& .MuiDataGrid-row': {
        cursor: 'pointer'
    },
    '& .MuiDataGrid-row:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
    },
    '& .selected-row': {
        backgroundColor: '#e6f2ff !important'
    },
    '& .selected-row:hover': {
        backgroundColor: '#d4e8ff !important'
    }
}; 