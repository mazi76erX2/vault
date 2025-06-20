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

const NotFoundPage = () => {
    return (
        <Container>
            <DancingBotGridComponentMiddle botState={'confusing'}>
                <HeaderContainer>
                    <MiddleText>Page not found</MiddleText>
                </HeaderContainer>
            </DancingBotGridComponentMiddle>
        </Container>
    );
};

export default NotFoundPage;