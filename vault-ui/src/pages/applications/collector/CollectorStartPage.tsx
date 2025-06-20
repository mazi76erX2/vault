import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {error as showError, HCButton, HCLoader, HCTextField, success as showSuccess} from 'generic-components';
import {HCIcon} from 'generic-components/src/HCIcon';
import {useAuthContext} from '../../../hooks/useAuthContext';
import {styled} from '@mui/material';
import {DancingBotGridComponent} from '../../../components/DancingBotGridComponent';
import {HeaderContainer, LoaderContainer, WelcomeText} from '../../../components';
import Api from '../../../services/Instance';
import { AxiosError } from 'axios';

const Container = styled('div')({
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
});

const FormSection = styled('div')({
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
});

const FormBox = styled('div')({
    backgroundColor: '#d3d3d3',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'min-content',
});

const UploadSection = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
});

const ButtonContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '5px',
});

const CollectorStartPage = () => {
    const [fullName, setFullName] = useState('');
    const [yearsExperience, setYearsExperience] = useState('');
    const [expertise, setExpertise] = useState('');
    const [department, setDepartment] = useState('');
    
    const authContext = useAuthContext();
    if (!authContext) {
        return <HCLoader />;
    }
    const {user} = authContext;

    const [cvText, setCvText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!authContext?.user?.user?.id) { 
                if (!authContext?.isLoadingUser) {
                    showError({message: 'User not logged in or user ID not available'});
                }
                return;
            }
            const userId = authContext.user.user.id;

            try {
                setLoading(true);
                const response = await Api.post('/api/v1/collector/fetch_user_profile', {
                    user_id: userId
                }
                );

                const data = response.data;

                setFullName(data.full_name || '');
                setYearsExperience(data.years_of_experience || '');
                setExpertise(data.field_of_expertise || '');
                setDepartment(data.department || '');
                setCvText(data.CV_text || null);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                if (!(err instanceof AxiosError && err.response?.status === 401)) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch user profile.';
                    showError({ message });
                }
            } finally {
                setLoading(false);
            }
        };

        if (authContext && authContext.user && !authContext.isLoadingUser) { 
            fetchUserProfile(); 
        }
    }, [authContext]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            await handleUploadCV(event.target.files[0]);
        }
    };

    const handleUploadCV = async (selectedFile: File) => {
        if (!user?.user?.id) {
            showError({message: 'User not logged in or user ID not available'});
            return;
        }

        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('user_id', user.user.id);
        setLoading(true);

        try {
            const response = await Api.post('/api/v1/collector/update_cv_text', formData);

            if (!response.data || !response.data.cv_text) {
                showError({message: 'Invalid response from the server.'});
                setLoading(false);
                return;
            }

            const uploadedCvText = response.data.cv_text;
            setCvText(uploadedCvText);
            showSuccess({message: 'CV uploaded successfully.'});
        } catch (error: unknown) {
            console.error('File upload error:', error);
            if (!(error instanceof AxiosError && error.response?.status === 401)) {
                const message = error instanceof Error ? error.message : 'File upload failed.';
                showError({ message });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.user?.id) {
            showError({message: 'User not logged in or user ID not available'});
            return;
        }

        if (!cvText) {
            showError({message: 'Please upload your CV before continuing.'});
            return;
        }
        setLoading(true);
        try {
            const response = await Api.post('/api/v1/collector/update_profile', {
                user_id: user.user.id,
                full_name: fullName,
                years_of_experience: yearsExperience,
                field_of_expertise: expertise,
                department: department,
            }
            );

            const data = response.data;
            console.log('Profile updated:', data);
            navigate('/applications/collector/CollectorInitQuestionsPage');
        } catch (err) {
            console.error('Error updating profile:', err);
            if (!(err instanceof AxiosError && err.response?.status === 401)) {
                const message = err instanceof Error ? err.message : 'There was an issue updating your profile.';
                showError({ message });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            {loading && (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            )}
            <DancingBotGridComponent botState={'default'}>
                <HeaderContainer>
                    <WelcomeText>I need some primary details</WelcomeText>
                </HeaderContainer>

                <FormSection>
                    <FormBox>
                        <form onSubmit={handleSubmit}>
                            <HCTextField type={'text'} label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                required/>
                            <HCTextField type={'text'} label="Years of Experience" value={yearsExperience}
                                onChange={(e) => setYearsExperience(e.target.value)} required/>
                            <HCTextField type={'text'} label="Field of Expertise" value={expertise}
                                onChange={(e) => setExpertise(e.target.value)} required/>
                            <HCTextField type={'text'} label="Department" value={department}
                                onChange={(e) => setDepartment(e.target.value)} required/>

                            <UploadSection>
                                {cvText ? (
                                    <>
                                        <p>📄 Current CV uploaded</p>
                                        <input type="file" onChange={handleFileChange} aria-label="Upload CV"/>
                                    </>
                                ) : (
                                    <input type="file" onChange={handleFileChange} aria-label="Upload CV"/>
                                )}
                            </UploadSection>

                            <ButtonContainer>
                                <HCButton sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}} hcVariant="primary" size="large" endIcon={<HCIcon icon="ArrowRight1"/>}
                                    text="Continue" type="submit" disabled={!cvText || loading}/>
                            </ButtonContainer>
                        </form>
                    </FormBox>
                </FormSection>
            </DancingBotGridComponent>
        </Container>
    );
};

export default CollectorStartPage;
