import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card/card";

interface ConsoleLayoutPageProps {
  children: ReactNode;
}

const ConsoleLayoutPage: React.FC<ConsoleLayoutPageProps> = ({ children }) => (
  <div className="flex flex-col min-h-screen p-4 bg-background">
    <Card className="flex-1 p-6 bg-card text-card-foreground shadow-sm max-w-7xl mx-auto w-full mt-4">
      {children}
    </Card>
  </div>
);

export default ConsoleLayoutPage;
