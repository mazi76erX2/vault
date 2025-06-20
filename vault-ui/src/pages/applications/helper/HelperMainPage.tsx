import React from 'react';
import {useNavigate} from 'react-router-dom';
import {styled} from '@mui/material';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {HeaderContainer, WelcomeText} from '../../../components';

const Container = styled('div')({
    display: 'flex',
    width: '100%',
    // height: '100vh', // Full height of the viewport
});

const ActionContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    justifyContent: 'center',
});

const ActionCard = styled('div')({
    backgroundColor: '#d3d3d3',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    flex: 1,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    width: '500px',
    margin: '0 auto',



});

const HelperMainPage = () => {
    const navigate = useNavigate();

    return (
        <Container>
            {/* Middle Part (2/3 of the screen, split into two sections) */}
            <DancingBotGridComponent botState={'idling'}>
                {/* Upper part (header section) */}
                <HeaderContainer>
                    <WelcomeText>Welcome to HICO Vault Helper Chat.</WelcomeText>
                </HeaderContainer>

                {/* Action Cards */}
                <ActionContainer>
                    <ActionCard onClick={() => navigate('/applications/helper/chat', {state: {isResume: false}})}>
                        <h3>Start a new chat</h3>
                        <p>Click here to start a new chat conversation.</p>
                    </ActionCard>

                    <ActionCard onClick={() => navigate('/applications/helper/HelperPreviousChats', {state: {isResume: true}})}>
                        <h3>Previous chat sessions</h3>
                        <p>Click here to resume a previous chat conversation.</p>
                    </ActionCard>
                </ActionContainer>

            </DancingBotGridComponent>
        </Container>
    );
};

export default HelperMainPage;

