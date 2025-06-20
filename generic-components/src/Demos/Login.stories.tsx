import {Box, Typography} from '@mui/material';
import {HCTextField} from '../HCTextField';
import React from 'react';
import {Meta, StoryObj} from '@storybook/react';
import {HCButton} from '../HCButton';
import {Visibility, VisibilityOff} from '@mui/icons-material';

const meta = {
    title: 'Demos/Login',
} satisfies Meta<unknown>;

export default meta;

type Story = StoryObj<unknown>;

export const LoginScreen: Story = {
    render() {
        const [username, setUsername] = React.useState<string>('');

        const [password, setPassword] = React.useState<string>('');

        const [usernameError, setUsernameError] = React.useState<string>('');

        const [passwordError, setPasswordError] = React.useState<string>('');

        const [showPassword, setShowPassword] = React.useState<boolean>(false);

        function loginHandle() {
            if (username.length <= 0) {
                setUsernameError('Please enter username!');
                return;
            } else if (password.length <= 0) {
                setPasswordError('Please enter password');
                return;
            }
            alert('logging you in!');
        }
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 10
            }}>
                <Typography variant={'h1'} sx={{
                    mb: 2
                }}>LOGIN</Typography>
                <HCTextField required errorText={usernameError} type={'text'} onChange={({ currentTarget }) => {
                    setUsername(currentTarget.value);
                    setUsernameError('');
                }} value={username} inputProps={{}} label={'Username'} />
                <HCTextField required errorText={passwordError} type={'text'} onChange={({ currentTarget }) => {
                    setPassword(currentTarget.value);
                    setPasswordError('');
                }} value={password} inputProps={{ type: showPassword ? 'text' : 'password' }} label={'Password'} action={{
                    hcVariant: 'secondary',
                    startIcon: showPassword ? <VisibilityOff /> : <Visibility />,
                    onClick() {
                        setShowPassword(!showPassword);
                    }
                }} />
                <HCButton hcVariant={'primary'} sx={{
                    mt: 2,
                }} text={'SUBMIT'} onClick={loginHandle}/>
            </Box>
        );
    }
};