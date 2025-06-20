import React from 'react';
import {HCButton} from 'generic-components';
import { Link } from 'react-router-dom';
import {styled} from '@mui/material';
import {drawerWidth} from '../../utils';

const Container = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    flexWrap: 'wrap',
    marginLeft: `-${drawerWidth}px`,
    width: `calc(100% + ${drawerWidth}px)`,
    '@media (max-width: 1279px)': {
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
});

const ButtonContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'center',
});

const Button = styled(HCButton)({
    width: '220px', // Set a fixed width for uniformity
    height: '50px', // Set a fixed height for uniformity
    textAlign: 'center', // Ensure text is centered
    fontSize: '16px', // Standardized text size
    fontWeight: 'bold', // Make text bold
});

function OrganisationPage() {
    return (
        <Container>
            {/* Buttons Section */}
            <ButtonContainer>
                <Link to="/users/OrganisationDetailsPage">
                    <Button sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} hcVariant="primary" size="small" text="ORGANISATION DETAILS" />
                </Link>
                <Link to="/users/UserManagementPage">
                    <Button sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} hcVariant="primary" size="small" text="USER MANAGEMENT" />
                </Link>
            </ButtonContainer>
        </Container>
    );
}

export default OrganisationPage;
