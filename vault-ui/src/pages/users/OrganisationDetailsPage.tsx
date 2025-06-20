import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material';
import { HCButton, HCLoader, HCTextField, error as showError, success } from 'generic-components';
import { useAuthContext } from '../../hooks/useAuthContext';
import { VAULT_API_URL } from '../../config';
import { LoaderContainer } from '../../components';
import { getTodayISO, formatDateForDisplay } from '../../utils/dateUtils';

interface OrganisationDetails {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    company: string;
    registeredSince: string;
}

const Container = styled('div')({
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
});

export const FormSection = styled('div')({
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
});

export const FormBox = styled('div')({
    backgroundColor: '#d3d3d3',
    padding: '25px',
    borderRadius: '0px 8px 8px 8px',
    border: '1px solid #e66334',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'min-content',
});

export const TabContainer = styled('div')({
    display: 'flex',
    gap: '2px',
    marginTop: '20px',
});

export const Tab = styled('div')<{ active: boolean }>(({ active }) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: active ? '#e66334' : '#d3d3d3',
    color: active ? 'white' : 'black',
    borderRadius: '4px 4px 0 0',
    '&:hover': {
        backgroundColor: active ? '#e66334' : '#c3c3c3',
    },
}));

export const ButtonContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
});

export const FormRow = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
});

function OrganisationDetailsPage() {
    const [activeTab, setActiveTab] = useState<'details' | 'license'>('details');
    const [loading, setLoading] = useState(false);
    const authContext = useAuthContext();
    const [formData, setFormData] = useState<OrganisationDetails>({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        company: '',
        registeredSince: getTodayISO(),
    });

    const [displayDate, setDisplayDate] = useState<string>(formatDateForDisplay(getTodayISO()));

    useEffect(() => {
        if (authContext?.user?.user?.id) {
            fetchCompanyContactDetails(authContext.user.user.id);
        }
    }, [authContext?.user]);

    const fetchCompanyContactDetails = async (userId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${VAULT_API_URL}/api/company/contact_details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authContext?.user?.token || ''}`
                },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || 'Failed to fetch company contact details';
                console.error(errorMessage);
                showError(errorMessage);
                return;
            }

            const data = await response.json();
            
            if (data) {
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    telephone: data.telephone || '',
                    company: data.company || '',
                    registeredSince: data.registeredSince || getTodayISO()
                });
                
                setDisplayDate(formatDateForDisplay(data.registeredSince || getTodayISO()));
            }
        } catch (err) {
            console.error('Error fetching company contact details:', err);
            showError('Failed to fetch company contact details');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const requiredFields = ['firstName', 'lastName', 'email', 'telephone'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof OrganisationDetails]);

        if (missingFields.length > 0) {
            const formattedFields = missingFields.map(field =>
                field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()
            ).join(', ');

            showError(`Please fill in the following required fields: ${formattedFields}`);
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!authContext?.isLoggedIn) {
            showError('You must be logged in to continue');
            return;
        }

        if (!validateForm()) {
            return;
        }

        const dataToSend = {
            user_id: authContext?.user?.user?.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            telephone: formData.telephone
        };

        try {
            setLoading(true);
            
            const response = await fetch(`${VAULT_API_URL}/api/company/update_contact_details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authContext?.user?.token || ''}`
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || 'Failed to save company contact details';
                showError(errorMessage);
                return;
            }

            const responseData = await response.json();
            
            // Update form data with response
            setFormData({
                firstName: responseData.firstName || '',
                lastName: responseData.lastName || '',
                email: responseData.email || '',
                telephone: responseData.telephone || '',
                company: responseData.company || '',
                registeredSince: responseData.registeredSince || getTodayISO()
            });
            
            success('Company contact details have been updated successfully');
        } catch (err) {
            console.error('Error saving company contact details:', err);
            showError('Failed to save company contact details');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (authContext?.user?.user?.id) {
            fetchCompanyContactDetails(authContext.user.user.id);
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                telephone: '',
                company: '',
                registeredSince: getTodayISO(),
            });
            setDisplayDate(formatDateForDisplay(getTodayISO()));
        }
    };

    return (
        <Container>
            {loading && (
                <LoaderContainer>
                    <HCLoader />
                </LoaderContainer>
            )}
            { !authContext ? <HCLoader /> : (
                <>
                    <TabContainer>
                        <Tab
                            active={activeTab === 'details'}
                            onClick={() => setActiveTab('details')}
                        >
                        Details
                        </Tab>
                    </TabContainer>

                    <FormSection>
                        <FormBox>
                            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Edit Your Company Contact Details</h3>
                            <form onSubmit={handleSubmit}>
                                {activeTab === 'details' ? (
                                    <>
                                        <FormRow>
                                            <HCTextField
                                                type="text"
                                                label="First Name"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                required
                                            />
                                            <HCTextField
                                                type="text"
                                                label="Last Name"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                required
                                            />
                                        </FormRow>
                                        <FormRow>
                                            <HCTextField
                                                type="text"
                                                label="Email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                required
                                            />
                                            <HCTextField
                                                type="text"
                                                label="Telephone Number"
                                                value={formData.telephone}
                                                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                                                required
                                            />
                                        </FormRow>
                                        <FormRow>
                                            <HCTextField
                                                type="text"
                                                label="Company"
                                                value={formData.company}
                                                disabled
                                            />
                                        </FormRow>
                                        <FormRow>
                                            <HCTextField
                                                type="text"
                                                label="Registered Since"
                                                value={displayDate}
                                                disabled
                                            />
                                        </FormRow>
                                    </>
                                ) : null}

                                <ButtonContainer>
                                    <HCButton
                                        sx={{mt: 2}}
                                        hcVariant="secondary"
                                        size="large"
                                        text="Cancel"
                                        type="reset"
                                        onClick={handleReset}
                                    />
                                    <HCButton
                                        sx={{mt: 2, background: '#e66334', ':hover': { background: '#FF8234' }}}
                                        hcVariant="primary"
                                        size="large"
                                        text="Save"
                                        type="submit"
                                    />
                                </ButtonContainer>
                            </form>
                        </FormBox>
                    </FormSection>
                </>
            )}
        </Container>
    );
}

export default OrganisationDetailsPage;