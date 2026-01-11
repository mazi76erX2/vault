import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageContext } from "@/hooks/usePageContext";

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
      className="p-0 mx-0 min-h-screen bg-background text-foreground"
      style={{
        maxWidth: `calc(100vw - ${DRAWER_WIDTH}px)`,
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 px-6 py-4 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight size={16} className="text-muted-foreground/50" />
              )}
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="text-primary hover:text-primary/80 hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-muted-foreground">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {headerProps && (
        <div className="px-6 py-4 border-b border-border bg-card text-card-foreground">
          <div className="flex justify-between items-center">
            <div>
              {headerProps.title && (
                <h1 className="text-2xl font-bold text-foreground">
                  {headerProps.title}
                </h1>
              )}
              {headerProps.subtitle && (
                <p className="text-muted-foreground mt-1">
                  {headerProps.subtitle}
                </p>
              )}
            </div>
            {headerProps.actions && <div>{headerProps.actions}</div>}
          </div>
        </div>
      )}

      <div className="p-6">{view}</div>
    </div>
  );
};

export default Page;
