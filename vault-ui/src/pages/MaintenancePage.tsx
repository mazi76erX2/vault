import React from 'react';
import {DancingBotGridComponentMiddle} from '../components/DancingBotGridComponentMiddle';
import {styled} from '@mui/material';
import {drawerWidth} from '../utils';
import {HeaderContainer, MiddleText} from '../components';

const Container = styled('div')({
    display: 'grid',
    gridTemplateColumns: `${drawerWidth}px 1fr`,
    padding: '20px',
});

const MaintenancePage = () => {
    return (
        <Container>
            <DancingBotGridComponentMiddle botState={'thinking'}>
                <HeaderContainer>
                    <MiddleText>Oops! <br /> Under Maintenance</MiddleText>
                </HeaderContainer>
            </DancingBotGridComponentMiddle>
        </Container>
    );
};

export default MaintenancePage;