import {ThemeProvider} from '@mui/material/styles';
import {
    Box, Typography,
    useTheme, useMediaQuery
} from '@mui/material';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import React from 'react';
import {HCButton, HCTextField, error} from 'generic-components';
import {HCIcon} from 'generic-components/src/HCIcon';
import Map from '../../assets/truechart_map.png';
import Logo from '../../assets/tclogo.svg';
import {PasswordInput} from '../../components/PasswordInput/PasswordInput';

function PasswordResetPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOnResetRequest, setIsOnResetRequest] = useState(true);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [buttonText , setButtonText] = useState('REQUEST PASSWORD RESET');
    const [queryKey, setQueryKey] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (!email) return  error({message: 'Email is required'});
        if(!isOnResetRequest){
            if(password.length < 8) return  error({message: 'Enter at least 8 characters'});
            if(password !== passwordConfirmation) return  error({message: 'The passwords do not match'});
        }
        setLoading(true);
        if(isOnResetRequest){
            // const response = await sendPasswordResetLink(email);
            // buildMessages(response);
        }
        else if(!isOnResetRequest){
            // const response = await saveNewPassword(email,queryKey,password,passwordConfirmation);
            // buildMessages(response);
        }
    };

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (event.code === 'Enter' ||  event.code === 'NumpadEnter') {
                onSubmit();
            }
        };
        document.addEventListener('keydown', listener);
        return () => {
            document.removeEventListener('keydown', listener);
        };
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const key = searchParams.get('key');
        const emailValue = searchParams.get('email');

        if (key && emailValue) {
            setIsOnResetRequest(false);
            setButtonText('UPDATE PASSWORD');
            setQueryKey(key);
            setEmail(emailValue);
        }else{
            setIsOnResetRequest(true);
            setButtonText('REQUEST PASSWORD RESET');
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '100%' : '44% 56%',
                height: '100vh'
            }}>
                <Box sx={{
                    background: 'gray',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 10,
                    [theme.breakpoints.down('md')]: {
                        p: 2,
                    },
                    [theme.breakpoints.down('lg')]: {
                        p: 4,
                    },
                }}>
                    <Box style={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <img style={{
                            width: 400,
                        }} src={Logo} alt={''}/>
                    </Box>
                    <Typography sx={{
                        color: '#fff',
                        fontSize: isMobile ? 24 : 25,
                        marginTop: '-16px',
                        textAlign: 'center',
                        mb: '56.4px',
                        fontWeight: 'bold',
                    }}>MANAGEMENT CONSOLE</Typography>
                    <Typography sx={{
                        color: '#fff',
                        fontSize: isMobile ? 24 : 25,
                        mb: '32px',
                        fontWeight: 'bold',
                    }}>PASSWORD RESET</Typography>

                    <HCTextField
                        id={'email'}
                        type={'text'}
                        label={'EMAIL'}
                        value={email}
                        textColor={'#fff'}
                        inputProps={{
                            startAdornment: <HCIcon icon={'Profile'}/>
                        }}
                        formControlSx={{
                            mb: '24px'
                        }}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {
                        queryKey.length > 10 && (<>
                            <PasswordInput
                                id={'password'}
                                type={'text'}
                                label={'PASSWORD'}
                                value={password}
                                textColor={'#fff'}
                                inputProps={{
                                    startAdornment: <HCIcon icon={'Lock'}/>,
                                }}
                                formControlSx={{
                                    mb: '24px'
                                }}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <PasswordInput
                                id={'password'}
                                type={'text'}
                                label={'CONFIRM PASSWORD'}
                                value={passwordConfirmation}
                                textColor={'#fff'}
                                inputProps={{
                                    startAdornment: <HCIcon icon={'Lock'}/>,
                                }}
                                formControlSx={{
                                    mb: '24px'
                                }}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                            />
                        </>)
                    }
                    <HCButton
                        disabled={loading}
                        sx={{mt: 2}}
                        text={loading ? 'PLEASE WAIT' : buttonText}
                        hcVariant={'primary'}
                        size={'small'}
                        onClick={onSubmit}/>
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
                    <Box sx={{
                        height: '100vh'
                    }}>
                        <img style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }} src={Map} alt={'Map'}/>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default PasswordResetPage;
