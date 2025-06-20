import React from 'react';
import {HCButton, HCDancingBot} from 'generic-components';
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
    width: '220px', // Set a fixed width for uniformity
    height: '50px', // Set a fixed height for uniformity
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
    return (
        <Container>
            {/* Image Section */}
            <ImageContainer>
                <HCDancingBot className="HCDancingBot" state="greeting" style={{ width: '600px', height: '600px' }}/>
            </ImageContainer>

            {/* Buttons Section */}
            <ButtonContainer>
                <Link to="/applications/collector/CollectorMainPage">
                    <Button sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} hcVariant="primary" size="large" text="COLLECTOR" />
                </Link>
                <Link to="/applications/helper/HelperMainPage">
                    <Button sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} hcVariant="primary" size="large" text="HELPER"  />
                </Link>

                <Link to="/applications/console/ConsoleMainPage">
                    <Button sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} hcVariant="primary" size="large" text="VALIDATOR"   />
                </Link>
            </ButtonContainer>
        </Container>
    );
}

export default HomePage;
