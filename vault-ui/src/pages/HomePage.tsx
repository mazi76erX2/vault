import React from 'react';
import { HCButton, HCDancingBot } from 'generic-components';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material';
import { drawerWidth } from '../utils';
import { useAuthContext } from '../hooks/useAuthContext';


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
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
    },
});

const ButtonContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    justifyContent: 'center',
});

const Button = styled(HCButton)({
    width: '250px', // Set a fixed width for uniformity
    height: '60px', // Set a fixed height for uniformity
    textAlign: 'center', // Ensure text is centered
    fontSize: '16px', // Standardized text size
    fontWeight: 'bold', // Make text bold
});

const ImageContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});


function HomePage() {
    const authContext = useAuthContext();

    // Handle cases where context might still be loading or not available
    if (!authContext || authContext.isLoadingUser) {
        // Optionally return a loader or null if waiting for auth context
        return null; // Or <HCLoader /> if you have one
    }

    const { userRoles: contextUserRoles } = authContext; // Get userRoles directly from the context

    // Ensure contextUserRoles is an array before using it
    const roles = Array.isArray(contextUserRoles) ? contextUserRoles : [];
    
    // Check for specific roles
    const hasRole = (roleName: string): boolean => {
        return roles.some(role => 
            role.toLowerCase() === roleName.toLowerCase()
        );
    };
    
    const isAdmin = hasRole('Administrator');
    const isCollector = hasRole('Collector');
    const isHelper = hasRole('Helper');
    const isValidator = hasRole('Validator');

    console.log('[HomePage] Roles from context:', roles, 'isAdmin:', isAdmin);

    return (
        <Container>
            {/* Image Section */}
            <ImageContainer>
                <HCDancingBot style={{ width: '600px', height: '600px' }} state={'greeting'}/>
            </ImageContainer>

            {/* Buttons Section */}
            <ButtonContainer>
                <Link to="/applications/collector/CollectorMainPage">
                    <Button 
                        sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} 
                        hcVariant="primary" 
                        size="large" 
                        text="COLLECTOR" 
                        disabled={!isCollector && !isAdmin}
                    />
                </Link>
                
                <Link to="/applications/helper/HelperMainPage">
                    <Button 
                        sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} 
                        hcVariant="primary" 
                        size="large" 
                        text="HELPER" 
                        disabled={!isHelper && !isAdmin}
                    />
                </Link>
                
                <Link to="/applications/console/ConsoleMainPage">
                    <Button 
                        sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} 
                        hcVariant="primary" 
                        size="large" 
                        text="VALIDATOR" 
                        disabled={!isValidator && !isAdmin}
                    />
                </Link>
            </ButtonContainer>
        </Container>
    );
}

export default HomePage;
