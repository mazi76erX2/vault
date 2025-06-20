import {Box, ListItemButton, ListItemIcon, ListItemText, SxProps} from '@mui/material';
import React from 'react';
import {Link} from 'react-router-dom';
import {Logout} from '@mui/icons-material';
import {HCIcon} from 'generic-components';
import {logout} from '../services/auth/Auth.service';

interface ExternalMenuItem {
    href?: string
    title: string
    icon?: React.ReactNode | React.ReactElement
    img?: string;
    imgStyle?: React.CSSProperties | undefined;
    internal?: boolean
}

export const ExternalMenuItems = () => {
    const iconStyle: SxProps = {
        mr: '-3px',
    };

    const links: ExternalMenuItem[] = [
        {
            href: '/UserGuides',
            title: ' User Guides',
            internal: true, // Remove when not under maintenance.
            icon: <HCIcon icon={'News'} style={{
                marginRight: '-3px'
            }} />
        },
        {
            href: '/login',
            internal: true,
            title: 'Logout',
            icon: <Logout sx={iconStyle} />
        }
    ];
    
    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await logout();
        window.location.href = '/login';
    };
    
    return (
        <>
            {links.filter((link) => !!link.href).map((item, index)=> (
                <Link to={item.href!} onClick={(e) => {
                    if (item.href === '/login') {
                        handleLogout(e);
                    }
                }} style={{
                    display: 'block',
                    width: '100%',
                    textDecoration: 'none',
                }} {...item.internal ? {} : {
                    target: '_blank'
                }} key={index}>
                    <ListItemButton sx={{
                        background: 'transparent',
                        color: '#000000DD',
                        mt: 0,
                        mb: '6px',
                        p: 0,
                        pl: '28px'
                    }}>
                        {item.icon || item.img && (
                            <ListItemIcon sx={{
                                width: '24px',
                                minWidth: 0,
                                minHeight: 0,
                                justifyContent: 'flex-end',
                                height: '24px',
                                mr: '6px',
                            }}>
                                <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                }}>
                                    {item.icon ? (
                                        item.icon
                                    ) : (
                                        <img style={{
                                            width: '24px',
                                            height: '24px',
                                            ...item.imgStyle,
                                        }} src={item.img} alt={item.title}/>
                                    )}
                                </Box>
                            </ListItemIcon>
                        )}
                        <ListItemText sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            ml: item.icon ? 1 : 0,
                            '& span': {
                                width: '100%',
                                textWrap: 'wrap',
                                textAlign: 'left',
                                lineHeight: '18px',
                                p: 0.5,
                            }
                        }} primary={item.title} />
                    </ListItemButton>
                </Link>
            ))}
        </>
    );
};
