import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { HCButton, HCTextField, error, success, HCIcon } from 'generic-components';
import Map from '../../assets/truechart_map.png';
import Logo from '../../assets/HICO_VAULT_LOGO_ORANGE_NEW.svg';
import axios from 'axios';
import { VAULT_API_URL } from '../../config';

function PasswordResetPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleResetRequest = async () => {
        if (!email) {
            error({ message: 'Email is required.' });
            return;
        }

        setIsSubmitting(true);
        try {
            // API call to request password reset
            const { data } = await axios.post(
                `${VAULT_API_URL}/api/auth/reset-password-request`,
                { email }
            );
            if (data.status === 'success') {
                setIsSubmitted(true);
                success({ message: data.message });
            } else {
                error({ message: data.message || 'Failed to process password reset.' });
            }
        } catch (err) {
            error({ message: 'An error occurred while processing your request.' });
            console.error('Password reset request error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '100%' : '44% 56%',
                    height: '100vh'
                }}
            >
                <Box
                    sx={{
                        background: 'gray',
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: 10,
                        [theme.breakpoints.down('md')]: { p: 2 },
                        [theme.breakpoints.down('lg')]: { p: 4 }
                    }}
                >
                    <Box style={{ display: 'flex', justifyContent: 'center' }}>
                        <img style={{ width: 400 }} src={Logo} alt={''} />
                    </Box>
                    <Typography
                        sx={{
                            color: '#fff',
                            fontSize: isMobile ? 24 : 25,
                            marginTop: '-16px',
                            textAlign: 'center',
                            mb: '56.4px',
                            fontWeight: 'bold'
                        }}
                    >
                        MANAGEMENT CONSOLE
                    </Typography>
                    <Typography
                        sx={{
                            color: '#fff',
                            fontSize: isMobile ? 24 : 25,
                            mb: '32px',
                            fontWeight: 'bold'
                        }}
                    >
                        RESET PASSWORD
                    </Typography>

                    {!isSubmitted ? (
                        <>
                            <Typography sx={{ color: '#fff', mb: 2 }}>
                                Enter your email address to reset your password. You will receive an email with instructions.
                            </Typography>

                            <HCTextField
                                id="email"
                                type="text"
                                label="EMAIL"
                                value={email}
                                textColor="#fff"
                                inputProps={{ startAdornment: <HCIcon icon="Profile" /> }}
                                formControlSx={{ mb: '24px' }}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <HCButton
                                sx={{ mt: 2, background: '#e66334', ':hover': { background: '#FF8234' } }}
                                text={isSubmitting ? 'Sending...' : 'Reset Password'}
                                hcVariant="primary"
                                size="small"
                                onClick={handleResetRequest}
                                disabled={isSubmitting}
                            />
                        </>
                    ) : (
                        <>
                            <Typography sx={{ color: '#fff', mb: 3 }}>
                                A password reset link has been sent to your email address if it exists in our system.
                                Please check your inbox and follow the instructions.
                            </Typography>
                            
                            <HCButton
                                sx={{ mt: 2, background: '#e66334', ':hover': { background: '#FF8234' } }}
                                text="Back to Login"
                                hcVariant="primary"
                                size="small"
                                onClick={() => navigate('/login')}
                            />
                        </>
                    )}

                    <span
                        style={{
                            marginTop: '10px',
                            color: '#FFF',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </span>
                </Box>
                {!isMobile && (
                    <Box sx={{ height: '100vh' }}>
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src={Map}
                            alt="Map"
                        />
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default PasswordResetPage; 