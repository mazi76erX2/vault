import { createBrowserRouter, useNavigate, Navigate } from "react-router-dom";
import React, { useEffect, ReactNode } from "react";
import PasswordResetPage from "@/features/auth/pages/reset-password/PasswordResetPage";
import LoginPage from "@/features/auth/pages/login/LoginPage";
import HomePage from "@/features/dashboard/pages/HomePage";
import RootLayout from "@/features/layout/RootLayout";
import { Page } from "@/features/layout/Page";
import { PageContextProvider } from "../contexts/PageContext";
import { PageHeaderProps } from "../components/PageHeader/PageHeader";
import OrganisationDetailsPage from "@/features/users/pages/OrganisationDetailsPage";
import UserDirectoryPage from "@/features/users/pages/UserDirectoryPage";
import OrganisationPage from "@/features/users/pages/OrganisationPage";
import OrganisationListPage from "@/features/users/pages/OrganisationListPage";
import ApplicationsPage from "@/features/applications/pages/ApplicationsPage";
import CollectorMainPage from "@/features/applications/pages/collector/CollectorMainPage";
import HelperMainPage from "@/features/applications/pages/helper/HelperMainPage";
import CollectorStartPage from "@/features/applications/pages/collector/CollectorStartPage";
import CollectorInitQuestionsPage from "@/features/applications/pages/collector/CollectorInitQuestionsPage";
import CollectorChatPage from "@/features/applications/pages/collector/CollectorChatPage";
import CollectorSummaryPage from "@/features/applications/pages/collector/CollectorSummaryPage";
import CollectorMetaDataPage from "@/features/applications/pages/collector/CollectorMetaDataPage";
import HelperChatPage from "@/features/applications/pages/helper/HelperChatPage";
import CollectorResumePage from "@/features/applications/pages/collector/CollectorResumePage";
import CollectorDocumentsStatusPage from "@/features/applications/pages/collector/CollectorDocumentsStatusPage";
import ConsoleMainPage from "@/features/applications/pages/console/ConsoleMainPage";
import ValidatorStartPage from "@/features/applications/pages/console/ValidatorStartPage";
import ValidatorDocPage from "@/features/applications/pages/console/ValidatorDocPage";
import ExpertDocPage from "@/features/applications/pages/console/ExpertDocPage";
import ExpertStartPage from "@/features/applications/pages/console/ExpertStartPage";
import ValidatorStartExpertReviewPage from "@/features/applications/pages/console/ValidatorStartExpertReviewPage";
import ValidatorStartCompletedPage from "@/features/applications/pages/console/ValidatorStartCompletedPage";
import ExpertPreviousReviewsPage from "@/features/applications/pages/console/ExpertPreviousReviewsPage";
import PreviousChatPage from "@/features/applications/pages/helper/HelperPreviousChats";
import { useAuthContext } from "../hooks/useAuthContext";
import NotFoundPage from "@/features/common/pages/NotFoundPage";
import MaintenancePage from "@/features/common/pages/MaintenancePage";
import BusinessThemePage from "@/features/theme/pages/BusinessThemePage";
import KBUploadPage from "@/features/kb/pages/KBUploadPage";
import KBDocumentsPage from "@/features/kb/pages/KBDocumentsPage";
import { Loader } from "../components/feedback/loader";

interface ChildrenProps {
  children: ReactNode;
}

const RequireAuth: React.FC<ChildrenProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login");
    }
  }, [navigate]);

  return <>{children}</>;
};

// Login route protection - redirect to dashboard if already logged in
const PublicRoute: React.FC<ChildrenProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <>{children}</>;
};

// Local interface extending LoginResponseDTO to include roles - THIS IS NO LONGER ACCURATE for authUser
// interface AuthenticatedUser extends LoginResponseDTO { // We get roles directly from context now
//     roles?: string[];
// }

// Role-based route guard
const RoleRoute: React.FC<{ roles: string[]; children: React.ReactNode }> = ({
  roles,
  children,
}) => {
  const authContext = useAuthContext();

  // It's crucial to handle the case where authContext itself might be undefined initially
  if (!authContext) {
    console.log(
      "[RoleRoute] AuthContext is undefined, returning null (should be temporary)",
    );
    return null; // Or a global loading spinner
  }

  const {
    user: authUser,
    isLoadingUser,
    userRoles: contextUserRoles,
  } = authContext;

  // While user data is loading from the context
  if (isLoadingUser) {
    console.log("[RoleRoute] isLoadingUser is true, returning Loader");
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  // If no authenticated user is found in the context after loading
  if (!authUser) {
    console.log("[RoleRoute] No authUser after loading, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Roles are now directly from the context's userRoles state
  const currentUserRoles = Array.isArray(contextUserRoles)
    ? contextUserRoles
    : [];
  console.log(
    "[RoleRoute] authUser present. isLoadingUser false. Roles from context:",
    currentUserRoles,
    "Required roles:",
    roles,
  );

  // Check if the user has 'Administrator' role or any of the required roles for the route
  if (
    currentUserRoles.includes("Administrator") ||
    roles.some((r) => currentUserRoles.includes(r))
  ) {
    console.log(
      "[RoleRoute] Access GRANTED for user roles:",
      currentUserRoles,
      "to route requiring:",
      roles,
    );
    return <>{children}</>;
  }

  // If roles do not match, and user is not Administrator
  console.log(
    "[RoleRoute] Access DENIED for user roles:",
    currentUserRoles,
    "to route requiring:",
    roles,
    ". Redirecting to dashboard.",
  );
  return <Navigate to="/dashboard" replace />;
};

const renderPage = (view: React.ReactNode, headerProps?: PageHeaderProps) => (
  <Page view={view} headerProps={headerProps} />
);

function RouterContainer() {
  return (
    <RequireAuth>
      <PageContextProvider>
        <RootLayout />
      </PageContextProvider>
    </RequireAuth>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/password-reset",
    element: (
      <PublicRoute>
        <PasswordResetPage />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: <RouterContainer />,
    errorElement: <NotFoundPage />,
    id: "Root",
    children: [
      // Root path redirects to dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      // /home path redirects to dashboard
      {
        path: "home",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        element: renderPage(<HomePage />),
        id: "Dashboard",
      },
      {
        path: "/users/organisation",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<OrganisationPage />)}
          </RoleRoute>
        ),
        id: "Organisation",
      },
      {
        path: "/applications/ApplicationsPage",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<ApplicationsPage />)}
          </RoleRoute>
        ),
        id: "Applications",
      },
      {
        path: "/applications/collector/CollectorMainPage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorMainPage />)}
          </RoleRoute>
        ),
        id: "CollectorMainPage",
      },
      {
        path: "/applications/collector/CollectorStartPage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorStartPage />)}
          </RoleRoute>
        ),
        id: "CollectorStartPage",
      },
      {
        path: "/applications/collector/CollectorInitQuestionsPage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorInitQuestionsPage />)}
          </RoleRoute>
        ),
        id: "CollectorInitQuestionsPage",
      },
      {
        path: "/applications/collector/CollectorChatPage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorChatPage />)}
          </RoleRoute>
        ),
        id: "CollectorChatPage",
      },
      {
        path: "/applications/collector/CollectorSummaryPage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorSummaryPage />)}
          </RoleRoute>
        ),
        id: "CollectorSummaryPage",
      },
      {
        path: "/applications/collector/CollectorDocumentsStatusPage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorDocumentsStatusPage />)}
          </RoleRoute>
        ),
        id: "CollectorDocumentsStatusPage",
      },
      {
        path: "/applications/collector/CollectorMetaDataPage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorMetaDataPage />)}
          </RoleRoute>
        ),
        id: "CollectorMetaDataPage",
      },
      {
        path: "/applications/collector/CollectorResumePage",
        element: (
          <RoleRoute roles={["Collector", "Administrator"]}>
            {renderPage(<CollectorResumePage />)}
          </RoleRoute>
        ),
        id: "CollectorResumePage",
      },
      {
        path: "/applications/helper/HelperMainPage",
        element: (
          <RoleRoute roles={["Helper", "Administrator"]}>
            {renderPage(<HelperMainPage />)}
          </RoleRoute>
        ),
        id: "HelperMainPage",
      },
      {
        path: "/applications/helper/HelperChatPage",
        element: (
          <RoleRoute roles={["Helper", "Administrator"]}>
            {renderPage(<HelperChatPage />)}
          </RoleRoute>
        ),
        id: "Chat",
      },
      {
        path: "/applications/console/ConsoleMainPage",
        element: (
          <RoleRoute roles={["Validator", "Administrator"]}>
            {renderPage(<ConsoleMainPage />)}
          </RoleRoute>
        ),
        id: "ConsoleMainPage",
      },
      {
        path: "/applications/console/ValidatorStartPage",
        element: (
          <RoleRoute roles={["Validator", "Administrator"]}>
            {renderPage(<ValidatorStartPage />)}
          </RoleRoute>
        ),
        id: "ValidatorStartPage",
      },
      {
        path: "/applications/console/ValidatorDocPage",
        element: (
          <RoleRoute roles={["Validator", "Administrator"]}>
            {renderPage(<ValidatorDocPage />)}
          </RoleRoute>
        ),
        id: "ValidatorDocPage",
      },
      {
        path: "/applications/console/ExpertDocPage",
        element: (
          <RoleRoute roles={["Expert", "Administrator"]}>
            {renderPage(<ExpertDocPage />)}
          </RoleRoute>
        ),
        id: "ExpertDocPage",
      },
      {
        path: "/applications/console/ExpertStartPage",
        element: (
          <RoleRoute roles={["Expert", "Administrator"]}>
            {renderPage(<ExpertStartPage />)}
          </RoleRoute>
        ),
        id: "ExpertStartPage",
      },
      {
        path: "/applications/console/ValidatorStartExpertReviewPage",
        element: (
          <RoleRoute roles={["Validator", "Administrator"]}>
            {renderPage(<ValidatorStartExpertReviewPage />)}
          </RoleRoute>
        ),
        id: "ValidatorStartExpertReviewPage",
      },
      {
        path: "/applications/console/ValidatorStartCompletedPage",
        element: (
          <RoleRoute roles={["Validator", "Administrator"]}>
            {renderPage(<ValidatorStartCompletedPage />)}
          </RoleRoute>
        ),
        id: "ValidatorStartCompletedPage",
      },
      {
        path: "/applications/console/ExpertPreviousReviewsPage",
        element: (
          <RoleRoute roles={["Expert", "Administrator"]}>
            {renderPage(<ExpertPreviousReviewsPage />)}
          </RoleRoute>
        ),
        id: "ExpertPreviousReviewsPage",
      },
      {
        path: "/applications/helper/HelperPreviousChats",
        element: (
          <RoleRoute roles={["Helper", "Administrator"]}>
            {renderPage(<PreviousChatPage />)}
          </RoleRoute>
        ),
        id: "PreviousChatPage",
      },
      {
        path: "/UserGuides",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<MaintenancePage />)}
          </RoleRoute>
        ),
        id: "UserGuides",
      },
      {
        path: "/AdminPortal",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<MaintenancePage />)}
          </RoleRoute>
        ),
        id: "Admin Portal",
      },
      {
        path: "/helper",
        element: (
          <RoleRoute roles={["Helper", "Administrator"]}>
            {renderPage(<MaintenancePage />)}
          </RoleRoute>
        ),
        id: "Helper",
      },
      {
        path: "/users/details",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<OrganisationDetailsPage />)}
          </RoleRoute>
        ),
        id: "OrganisationDetailsPage",
      },
      {
        path: "/users/directory",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<UserDirectoryPage />)}
          </RoleRoute>
        ),
        id: "UserDirectoryPage",
      },
      {
        path: "/users/management",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<OrganisationListPage />)}
          </RoleRoute>
        ),
        id: "UserManagementPage",
      },
      {
        path: "/theme/BusinessThemePage",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<BusinessThemePage />)}
          </RoleRoute>
        ),
        id: "ThemeSettings",
      },
      {
        path: "/knowledge-base/Upload",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<KBUploadPage />)}
          </RoleRoute>
        ),
        id: "KBUpload",
      },
      {
        path: "/knowledge-base/Documents",
        element: (
          <RoleRoute roles={["Administrator"]}>
            {renderPage(<KBDocumentsPage />)}
          </RoleRoute>
        ),
        id: "KBDocuments",
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
