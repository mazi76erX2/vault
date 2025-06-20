import React, {PropsWithChildren} from 'react';
import {Link} from 'react-router-dom';
import {HCButton} from 'generic-components';
import {HCIcon} from 'generic-components/src/HCIcon';
import {styled} from '@mui/material';
import {DancingBotGridComponent} from '../components/DancingBotGridComponent';
import {HeaderContainer, WelcomeText} from '../components';

interface CollectorPageProps extends PropsWithChildren {
    showContinueButton: boolean;
    botStatus?: string;
    continueLink?: string;
    headline1?: string;
    headline2?: string;
}

const Container = styled('div')({
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
});

const ContentSection = styled('div')({
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '800px',
});

const FormBox = styled('div')({
    backgroundColor: '#d3d3d3', // Gray background
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    // height: '80%',
});

const ButtonsContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    gap: '50px',
    margin: '30px 0',
});

const CollectorPageLayout = (props: CollectorPageProps) => {
    return (
        <Container>
            {/* Right Container: Header and Content */}
            <DancingBotGridComponent botFixed botState={'winning'}>
                {/* Header Section */}
                <HeaderContainer>
                    <WelcomeText>{props.headline1 || ''}</WelcomeText>
                    <WelcomeText>{props.headline2 || ''}</WelcomeText>
                </HeaderContainer>

                {/* Content Section (Gray Box) */}
                <ContentSection>
                    <FormBox>
                        {props.children}

                        {/* Optionally render a Continue button */}
                        {props.showContinueButton && (
                            <ButtonsContainer>
                                <Link to={props.continueLink || '/applications/collector/CollectorSummaryPage'}>
                                    <HCButton
                                        hcVariant="primary"
                                        size="large"
                                        endIcon={<HCIcon icon={'ArrowRight1'}/>}
                                        text="Continue"
                                    />
                                </Link>
                            </ButtonsContainer>
                        )}
                    </FormBox>
                </ContentSection>
            </DancingBotGridComponent>
        </Container>
    );
};

export default CollectorPageLayout;
