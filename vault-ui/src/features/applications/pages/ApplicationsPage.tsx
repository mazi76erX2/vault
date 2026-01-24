import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { useAuthContext } from "@/hooks/useAuthContext";

const DRAWER_WIDTH = 240;

const ApplicationsPage: React.FC = () => {
  const authContext = useAuthContext();

  if (!authContext) return null;

  const userRoles = authContext.user?.user?.roles || [];
  const roles = Array.isArray(userRoles) ? userRoles : [];

  const isAdmin = roles.includes("Administrator");
  const isCollector = roles.includes("Collector");
  const isHelper = roles.includes("Helper");
  const isValidator = roles.includes("Validator");

  return (
    <div
      className="flex items-center justify-center p-5 flex-col gap-5 min-h-[50vh]"
      style={{
        marginLeft: `-${DRAWER_WIDTH}px`,
        width: `calc(100% + ${DRAWER_WIDTH}px)`,
      }}
    >
      <h1 className="text-3xl font-bold mb-8 text-foreground">Applications</h1>

      <div className="flex flex-col gap-5">
        <Link to="/applications/collector/CollectorMainPage">
          <Button
            className="w-[220px] h-[50px] text-center text-base font-bold"
            disabled={!isCollector && !isAdmin}
            size="lg"
          >
            COLLECTOR
          </Button>
        </Link>

        <Link to="/applications/helper/HelperMainPage">
          <Button
            className="w-[220px] h-[50px] text-center text-base font-bold"
            disabled={!isHelper && !isAdmin}
            size="lg"
          >
            HELPER
          </Button>
        </Link>

        <Link to="/applications/console/ConsoleMainPage">
          <Button
            className="w-[220px] h-[50px] text-center text-base font-bold"
            disabled={!isValidator && !isAdmin}
            size="lg"
          >
            VALIDATOR
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ApplicationsPage;
