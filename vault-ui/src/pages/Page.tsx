import React from 'react';
import {usePageContext} from '../hooks/usePageContext';
import {Breadcrumbs, Container as MDContainer, Box, useTheme, styled} from '@mui/material';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import {PageHeader, PageHeaderProps} from '../components/PageHeader/PageHeader';
import {drawerWidth} from '../utils';
import {Link} from 'react-router-dom';

const Container = styled(MDContainer)({
    padding: '0 24px !important',
    marginLeft: '0px !important',
    marginRight: '0px !important',
    maxWidth: `calc(100vw - ${drawerWidth}px) !important`
});

export interface PageProps {
    view: React.ReactNode | React.ReactElement,
    headerProps?: PageHeaderProps;
}

export const Page = ({ view, headerProps }: PageProps) => {
    const {breadcrumbs, updateBreadCrumbs} = usePageContext();
    const theme = useTheme();

    const breadcrumbsRow = breadcrumbs && breadcrumbs.length > 0 ? '32px ': '';
    const actionsRow = headerProps ? '67px ' : '';

    React.useEffect(() => {
        return () => {
            updateBreadCrumbs([]);
        };
    }, []);

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateRows: `${breadcrumbsRow}${actionsRow}auto`,
            width: '100%',
            pt: '24px'
        }}>
            {breadcrumbs && breadcrumbs.length > 0 ? (
                <Container sx={{ mb: 1.5, background: 'transparent' }}>
                    <Breadcrumbs separator={<ChevronRightOutlinedIcon style={{
                        color: theme.palette.primary.main
                    }} />} aria-label={'breadcrumb'}>
                        {breadcrumbs.map((item, index) => (
                            <Link style={{
                                display: 'flex',
                                height: '100%',
                                textDecoration: 'none',
                                color: '#71717a',
                                cursor: item.href ? 'pointer' : '',
                                fontSize: '12px'
                            }} to={item.href ?? ''} key={index}>
                                {item.text}
                            </Link>
                        ))}
                    </Breadcrumbs>
                </Container>
            ) : null}
            {headerProps && (
                <Container sx={{ mb: 4, background: 'transparent' }}>
                    <PageHeader {...headerProps} />
                </Container>
            )}
            <Container sx={{ mb: 2, background: 'transparent' }}>
                {view}
            </Container>
        </Box>
    );
};
