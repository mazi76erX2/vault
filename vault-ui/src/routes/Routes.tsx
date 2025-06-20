import { createBrowserRouter, useNavigate, Navigate } from 'react-router-dom';
import PasswordResetPage from '../pages/auth/PasswordResetPage';
import LoginPage from '../pages/login/LoginPage';
import HomePage from '../pages/HomePage';
import RootLayout from '../pages/RootLayout';
// import AdminsPage from '../pages/users/AdminsPage';
import React, { useEffect, ReactNode } from 'react';
import { Page } from '../pages/Page';
import { PageContextProvider } from '../contexts/PageContext';
import { PageHeaderProps } from '../components/PageHeader/PageHeader';
// import { getCurrentUser } from '../services/auth/Auth.service';
import ApplicationsPage from '../pages/applications/ApplicationsPage';
import CollectorMainPage from '../pages/applications/collector/CollectorMainPage';
import HelperMainPage from '../pages/applications/helper/HelperMainPage';
import CollectorStartPage from '../pages/applications/collector/CollectorStartPage';
import CollectorInitQuestionsPage from '../pages/applications/collector/CollectorInitQuestionsPage';
import CollectorChatPage from '../pages/applications/collector/CollectorChatPage';
import CollectorSummaryPage from '../pages/applications/collector/CollectorSummaryPage';
import CollectorMetaDataPage from '../pages/applications/collector/CollectorMetaDataPage';
import HelperChatPage from '../pages/applications/helper/HelperChatPage';
import CollectorResumePage from '../pages/applications/collector/CollectorResumePage';
import CollectorDocumentsStatusPage from '../pages/applications/collector/CollectorDocumentsStatusPage';
import ConsoleMainPage from '../pages/applications/console/ConsoleMainPage';
import ValidatorStartPage from '../pages/applications/console/ValidatorStartPage';
import ValidatorDocPage from '../pages/applications/console/ValidatorDocPage';
import ExpertDocPage from '../pages/applications/console/ExpertDocPage';
import ExpertStartPage from '../pages/applications/console/ExpertStartPage';
import ValidatorStartExpertReviewPage from '../pages/applications/console/ValidatorStartExpertReviewPage';
import ValidatorStartCompletedPage from '../pages/applications/console/ValidatorStartCompletedPage';
import ExpertPreviousReviewsPage from '../pages/applications/console/ExpertPreviousReviewsPage';
import PreviousChatPage from '../pages/applications/helper/HelperPreviousChats';
import {useAuthContext} from '../hooks/useAuthContext';
import NotFoundPage from '../pages/NotFoundPage';
import MaintenancePage from '../pages/MaintenancePage';
import OrganisationDetailsPage from '../pages/users/OrganisationDetailsPage';
import UserDirectoryPage from '../pages/users/UserDirectoryPage';
import OrganisationPage from '../pages/users/OrganisationPage';
import OrganisationListPage from '../pages/users/OrganisationListPage';
import BusinessThemePage from '../pages/theme/BusinessThemePage';


interface ChildrenProps {
    children: ReactNode;
}

const RequireAuth: React.FC<ChildrenProps> = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            navigate('/login');
        }
    }, [navigate]);

    return <>{children}</>;
};

// Login route protection - redirect to dashboard if already logged in
const PublicRoute: React.FC<ChildrenProps> = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return <>{children}</>;
};

// Local interface extending LoginResponseDTO to include roles - THIS IS NO LONGER ACCURATE for authUser
// interface AuthenticatedUser extends LoginResponseDTO { // We get roles directly from context now
//     roles?: string[];
// }

// Role-based route guard
const RoleRoute: React.FC<{roles: string[]; children: React.ReactNode}> = ({roles, children}) => {
    const authContext = useAuthContext();

    // It's crucial to handle the case where authContext itself might be undefined initially
    if (!authContext) {
        console.log('[RoleRoute] AuthContext is undefined, returning null (should be temporary)');
        return null; // Or a global loading spinner
    }

    const { user: authUser, isLoadingUser, userRoles: contextUserRoles } = authContext;

    // While user data is loading from the context
    if (isLoadingUser) {
        console.log('[RoleRoute] isLoadingUser is true, returning null');
        return null; // Or a loading spinner
    }

    // If no authenticated user is found in the context after loading
    if (!authUser) {
        console.log('[RoleRoute] No authUser after loading, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // Roles are now directly from the context's userRoles state
    const currentUserRoles = Array.isArray(contextUserRoles) ? contextUserRoles : [];
    console.log('[RoleRoute] authUser present. isLoadingUser false. Roles from context:', currentUserRoles, 'Required roles:', roles);

    // Check if the user has 'Administrator' role or any of the required roles for the route
    if (currentUserRoles.includes('Administrator') || roles.some(r => currentUserRoles.includes(r))) {
        console.log('[RoleRoute] Access GRANTED for user roles:', currentUserRoles, 'to route requiring:', roles);
        return <>{children}</>;
    }

    // If roles do not match, and user is not Administrator
    console.log('[RoleRoute] Access DENIED for user roles:', currentUserRoles, 'to route requiring:', roles, '. Redirecting to dashboard.');
    return <Navigate to="/dashboard" replace />;
};

const renderPage = (view: React.ReactNode, headerProps?: PageHeaderProps) => {
    return (
        <Page view={view} headerProps={headerProps} />
    );
};

const RouterContainer = () => {
    return (
        <RequireAuth>
            <PageContextProvider>
                <RootLayout />
            </PageContextProvider>
        </RequireAuth>
    );
};

const router = createBrowserRouter([
    {
        path: '/login',
        element: <PublicRoute><LoginPage /></PublicRoute>
    },
    {
        path: '/password-reset',
        element: <PublicRoute><PasswordResetPage /></PublicRoute>
    },
    {
        path: '/',
        element: <RouterContainer />,
        errorElement: <NotFoundPage />,
        id: 'Root',
        children: [
            // Root path redirects to dashboard
            {
                index: true,
                element: <Navigate to="/dashboard" replace />
            },
            // /home path redirects to dashboard
            {
                path: 'home',
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: '/dashboard',
                element: renderPage(<HomePage />),
                id: 'Dashboard'
            },
            {
                path: '/users/OrganisationPage',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<OrganisationPage />)}
                    </RoleRoute>
                ),
                id: 'Organisation'
            },
            {
                path: '/applications/ApplicationsPage',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<ApplicationsPage />)}
                    </RoleRoute>
                ),
                id: 'Applications'
            },
            {
                path: '/applications/collector/CollectorMainPage',
                element: (
                    <RoleRoute roles={[ 'Collector', 'Administrator' ]}>
                        {renderPage(<CollectorMainPage />)}
                    </RoleRoute>
                ),
                id: 'CollectorMainPage'
            },
            {
                path: '/applications/collector/CollectorStartPage',
                element: (
                    <RoleRoute roles={['Collector', 'Administrator']}>
                        {renderPage(<CollectorStartPage />)}
                    </RoleRoute>
                ),
                id: 'CollectorStartPage'
            },
            {
                path: '/applications/collector/CollectorInitQuestionsPage',
                element: (
                    <RoleRoute roles={[ 'Collector', 'Administrator' ]}>
                        {renderPage(<CollectorInitQuestionsPage />)}
                    </RoleRoute>
                ),
                id: 'CollectorInitQuestionsPage'
            },
            {
                path: '/applications/collector/CollectorChatPage',
                element: (
                    <RoleRoute roles={[ 'Collector', 'Administrator' ]}>
                        {renderPage(<CollectorChatPage />)}
                    </RoleRoute>
                ),
                id: 'CollectorChatPage'
            },
            {
                path: '/applications/collector/CollectorSummaryPage',
                element: (
                    <RoleRoute roles={[ 'Collector', 'Administrator' ]}>
                        {renderPage(<CollectorSummaryPage />)}
                    </RoleRoute>
                ),
                id: 'CollectorSummaryPage'
            },
            {
                path: '/applications/collector/CollectorDocumentsStatusPage',
                element: (
                    <RoleRoute roles={[ 'Collector', 'Administrator' ]}>
                        {renderPage(<CollectorDocumentsStatusPage />)}
                    </RoleRoute>
                ),
                id: 'CollectorDocumentsStatusPage'
            },
            {
                path: '/applications/collector/CollectorMetaDataPage',
                element: (
                    <RoleRoute roles={[ 'Collector', 'Administrator' ]}>
                        {renderPage(<CollectorMetaDataPage />)}
                    </RoleRoute>
                ),
                id: 'CollectorMetaDataPage'
            },
            {
                path: '/applications/collector/CollectorResumePage',
                element: (
                    <RoleRoute roles={[ 'Collector', 'Administrator' ]}>
                        {renderPage(<CollectorResumePage />)}
                    </RoleRoute>
                ),
                id: 'CollectorResumePage'
            },
            {
                path: '/applications/helper/HelperMainPage',
                element: (
                    <RoleRoute roles={[ 'Helper', 'Administrator' ]}>
                        {renderPage(<HelperMainPage />)}
                    </RoleRoute>
                ),
                id: 'HelperMainPage'
            },
            {
                path: '/applications/helper/chat',
                element: (
                    <RoleRoute roles={[ 'Helper', 'Administrator' ]}>
                        {renderPage(<HelperChatPage />)}
                    </RoleRoute>
                ),
                id: 'Chat'
            },
            {
                path: '/applications/console/ConsoleMainPage',
                element: (
                    <RoleRoute roles={[ 'Validator', 'Administrator' ]}>
                        {renderPage(<ConsoleMainPage />)}
                    </RoleRoute>
                ),
                id: 'ConsoleMainPage'
            },
            {
                path: '/applications/console/ValidatorStartPage',
                element: (
                    <RoleRoute roles={[ 'Validator', 'Administrator' ]}>
                        {renderPage(<ValidatorStartPage />)}
                    </RoleRoute>
                ),
                id: 'ValidatorStartPage'
            },
            {
                path: '/applications/console/ValidatorDocPage',
                element: (
                    <RoleRoute roles={[ 'Validator', 'Administrator' ]}>
                        {renderPage(<ValidatorDocPage />)}
                    </RoleRoute>
                ),
                id: 'ValidatorDocPage'
            },
            {
                path: '/applications/console/ExpertDocPage',
                element: (
                    <RoleRoute roles={[ 'Expert', 'Administrator' ]}>
                        {renderPage(<ExpertDocPage />)}
                    </RoleRoute>
                ),
                id: 'ExpertDocPage'
            },
            {
                path: '/applications/console/ExpertStartPage',
                element: (
                    <RoleRoute roles={[ 'Expert', 'Administrator' ]}>
                        {renderPage(<ExpertStartPage />)}
                    </RoleRoute>
                ),
                id: 'ExpertStartPage'
            },
            {
                path: '/applications/console/ValidatorStartExpertReviewPage',
                element: (
                    <RoleRoute roles={[ 'Validator', 'Administrator' ]}>
                        {renderPage(<ValidatorStartExpertReviewPage />)}
                    </RoleRoute>
                ),
                id: 'ValidatorStartExpertReviewPage'
            },
            {
                path: '/applications/console/ValidatorStartCompletedPage',
                element: (
                    <RoleRoute roles={[ 'Validator', 'Administrator' ]}>
                        {renderPage(<ValidatorStartCompletedPage />)}
                    </RoleRoute>
                ),
                id: 'ValidatorStartCompletedPage'
            },
            {
                path: '/applications/console/ExpertPreviousReviewsPage',
                element: (
                    <RoleRoute roles={[ 'Expert', 'Administrator' ]}>
                        {renderPage(<ExpertPreviousReviewsPage />)}
                    </RoleRoute>
                ),
                id: 'ExpertPreviousReviewsPage'
            },
            {
                path: '/applications/helper/HelperPreviousChats',
                element: (
                    <RoleRoute roles={[ 'Helper', 'Administrator' ]}>
                        {renderPage(<PreviousChatPage />)}
                    </RoleRoute>
                ),
                id: 'PreviousChatPage'
            },
            {
                path: '/UserGuides',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<MaintenancePage />)}
                    </RoleRoute>
                ),
                id: 'UserGuides'
            },
            {
                path: '/AdminPortal',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<MaintenancePage />)}
                    </RoleRoute>
                ),
                id: 'Admin Portal'
            },
            {
                path: '/helper',
                element: (
                    <RoleRoute roles={[ 'Helper', 'Administrator' ]}>
                        {renderPage(<MaintenancePage />)}
                    </RoleRoute>
                ),
                id: 'Helper'
            },
            {
                path: '/users/OrganisationDetailsPage',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<OrganisationDetailsPage />)}
                    </RoleRoute>
                ),
                id: 'OrganisationDetailsPage'
            },
            {
                path: '/users/UserDirectoryPage',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<UserDirectoryPage />)}
                    </RoleRoute>
                ),
                id: 'UserDirectoryPage'
            },
            {
                path: '/users/UserManagementPage',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<OrganisationListPage />)}
                    </RoleRoute>
                ),
                id: 'UserManagementPage'
            },
            {
                path: '/theme/BusinessThemePage',
                element: (
                    <RoleRoute roles={[ 'Administrator' ]}>
                        {renderPage(<BusinessThemePage />)}
                    </RoleRoute>
                ),
                id: 'ThemeSettings',
            },
            { path: '*', element: <NotFoundPage /> },
        ]
    }
]);

export default router;
