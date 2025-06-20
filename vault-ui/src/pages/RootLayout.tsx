import {Outlet, useNavigate} from 'react-router-dom';
import {
    Box, Divider, IconButton,
    List,
    styled,
    Toolbar,
    Typography, useMediaQuery, useTheme
} from '@mui/material';
import Link from '@mui/material/Link';
import MuiDrawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';

import {useEffect, useState} from 'react';
import {MenuListItems} from './MenuItems';
import React from 'react';
import {ExternalMenuItems} from './ExternalMenuItems';
import Logo from '../assets/HICO_VAULT_LOGO.svg';
import {MUITheme} from 'generic-components/src/theme';
import {drawerWidth} from '../utils';
import {HCIcon, shouldForwardProp} from 'generic-components';
import {useAuthContext} from '../hooks/useAuthContext';
import {VERSION_FULL} from '../config';
import {getCurrentUser} from '../services/auth/Auth.service';


const closedDrawerWidth = 60;

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => shouldForwardProp(prop, ['open', 'theme'])})(
    ({ theme, open }) => ({
        width: open ? drawerWidth : closedDrawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: open ? drawerWidth : closedDrawerWidth,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: open ? theme.palette.background.default : theme.palette.grey[100],
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            overflowX: 'hidden',
            borderRight: open ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
            ...(!open && {
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                '& > *:not(.MuiToolbar-root)': {
                    display: 'none',
                },
                '& .MuiToolbar-root': {
                    minHeight: '64px',
                    padding: theme.spacing(0, 1),
                    justifyContent: 'center',
                },
            }),
        },
    }),
);

function RootLayout() {
    const isHeightLessThan700 = useMediaQuery(' screen and (max-height: 700px)');
    const isHeightLessThan800 = useMediaQuery(' screen and (max-height: 800px)');

    const authContext = useAuthContext();
    const isLoadingUser = authContext?.isLoadingUser;
    const theme: typeof MUITheme = useTheme();

    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const pathname = window.location.pathname;
    const user = getCurrentUser();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    // Navigate to log in screen if the user is not logged in.
    useEffect(() => {
        if (!user && !isLoadingUser) {
            navigate('/login');
        }

        // Redirect to home page if the path is not specified
        if (pathname && pathname === '/') {
            navigate('/home');
        }
    }, [user, isLoadingUser, navigate, pathname]);

    // Don't render anything if the user is not logged in.
    if (!user) {
        return (<></>);
    }

    const getAppVersion = () => VERSION_FULL;

    return (
        <>
            <style>{
                `
                div:has(.app-toast) {
                    /* Adjust toast position based on drawer state if needed */
                    left: ${open ? drawerWidth + 20 : closedDrawerWidth + 20}px!important;
                    transition: left 0.2s ease-in-out; /* Add transition */
                }
                `
            }</style>
            <Box sx={{ display: 'flex', position: 'relative', height: '100vh' }}>
                {/* Toggle Button: Positioned absolutely above everything */}
                <IconButton
                    onClick={handleDrawerToggle}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    title={open ? 'Close menu' : 'Open menu'}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: theme.zIndex.drawer + 2,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                        color: '#000',
                    }}
                >
                    {open ? <MenuIcon /> : <MenuIcon  style={{ transform: 'rotate(90deg)' }}/>}
                </IconButton>

                {/* Drawer with matching background when closed */}
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '64px',
                        }}
                    >
                        {/* Logo only shown when drawer is open */}
                        {open && (
                            <img
                                alt={'Brand logo'}
                                style={{
                                    height: 32,
                                    width: 125,
                                    display: 'block',
                                }}
                                src={Logo}
                            />
                        )}
                    </Toolbar>
                    {/* Rest of drawer content remains the same */}
                    {/* Rest of the Drawer Content */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}>
                        <List component="nav" sx={{
                            maxHeight: isHeightLessThan700 ? '210px' : isHeightLessThan800 ? '240px' : '60vh',
                            overflowY: 'auto',
                            py: 0,
                            flexShrink: 0,
                        }}>
                            <MenuListItems open={open} />
                        </List>
                        <Divider sx={{
                            borderRadius: '5px',
                            m: 1,
                            mx: '14.5px',
                            background: '#000',
                            flexShrink: 0,
                        }} />
                        {/* Inner Box structure */}
                        <Box sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            overflow: 'hidden',
                            my: isHeightLessThan800 ? 1 : 2,
                        }}>
                            {/* External Menu Items list */}
                            <Box sx={{
                                flexGrow: 1,
                                width: '100%',
                                overflowY: 'auto',
                            }}>
                                <List sx={{ width: '100%' }}>
                                    <ExternalMenuItems />
                                </List>
                            </Box>
                            {/* User Profile / Version Info (Footer elements) */}
                            <Box sx={{ flexShrink: 0, mt: 'auto', pb: 1 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    px: 2,
                                    visibility: open ? 'visible' : 'hidden'
                                }}>
                                    <button
                                        aria-label="User Profile"
                                        title="User Profile"
                                        style={{
                                            appearance: 'none',
                                            border: 'none',
                                            height: 40,
                                            width: 40,
                                            background: '#000',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            marginRight: open ? 12 : 0,
                                            flexShrink: 0,
                                        }}>
                                        <HCIcon icon={'CameraImage'} />
                                    </button>
                                    {open && <span>User Profile</span>}
                                </Box>
                                <Box sx={{
                                    px: '15px',
                                    visibility: open ? 'visible' : 'hidden'
                                }}>
                                    <Typography variant="body2" sx={{
                                        color: theme.textColor.black,
                                        fontSize: '12px',
                                    }} align="center">
                                        {getAppVersion()}
                                    </Typography>
                                    <Typography variant="body2"  sx={{
                                        color: theme.textColor.black,
                                        fontSize: '12px',
                                        textAlign: 'center',
                                    }}>
                                        {'© '}
                                        <Link color="inherit" style={{
                                            textDecoration: 'none',
                                        }} href="https://www.hico-group.com/">
                                             TRUECHART P/L
                                        </Link>{' '}
                                        {new Date().getFullYear()}
                                        {'.'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Drawer>

                {/* Main content remains the same */}
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        width: `calc(100% - ${open ? drawerWidth : 0}px)`,
                        height: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        boxSizing: 'border-box',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </>
    );
}

export default RootLayout;