import React from "react";

export interface BreadCrumbItem {
  href?: string;
  text: string;
}
interface PageContextData {
  updateBreadCrumbs(items: BreadCrumbItem[]): void;
  breadcrumbs: BreadCrumbItem[];
}

export const PageContext = React.createContext({} as PageContextData);

export const PageContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadCrumbItem[]>([]);
  return (
    <PageContext.Provider
      value={{
        breadcrumbs,
        updateBreadCrumbs(items: BreadCrumbItem[]) {
          setBreadcrumbs(items);
        },
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
