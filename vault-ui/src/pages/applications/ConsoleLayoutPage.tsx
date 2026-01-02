import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ConsoleLayoutPageProps {
  children: ReactNode;
}

/**
 * ConsoleLayoutPage - A layout wrapper for console pages
 * This component provides consistent layout structure for validator and expert console pages
 * throughout the application
 */
const ConsoleLayoutPage: React.FC<ConsoleLayoutPageProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50">
      <Card className="flex-1 p-6 bg-white rounded shadow-sm max-w-7xl mx-auto w-full mt-4">
        {children}
      </Card>
    </div>
  );
};

export default ConsoleLayoutPage;
