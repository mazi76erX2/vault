import React from "react";
import { usePageContext } from "@/hooks/usePageContext";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const DRAWER_WIDTH = 240;

export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface PageProps {
  view: React.ReactNode | React.ReactElement;
  headerProps?: PageHeaderProps;
}

export const Page: React.FC<PageProps> = ({ view, headerProps }) => {
  const { breadcrumbs } = usePageContext();

  return (
    <div
      className="p-0 mx-0"
      style={{
        maxWidth: `calc(100vw - ${DRAWER_WIDTH}px)`,
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 px-6 py-4 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight size={16} className="text-gray-400" />
              )}
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-600">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
      {headerProps && (
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex justify-between items-center">
            <div>
              {headerProps.title && (
                <h1 className="text-2xl font-bold text-gray-900">
                  {headerProps.title}
                </h1>
              )}
              {headerProps.subtitle && (
                <p className="text-gray-600 mt-1">{headerProps.subtitle}</p>
              )}
            </div>
            {headerProps.actions && <div>{headerProps.actions}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">{view}</div>
    </div>
  );
};

export default Page;
