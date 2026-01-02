import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
      className="flex items-center justify-center p-5 flex-col gap-5"
      style={{
        marginLeft: `-${DRAWER_WIDTH}px`,
        width: `calc(100% + ${DRAWER_WIDTH}px)`,
      }}
    >
      <h1 className="text-3xl font-bold mb-8">Applications</h1>

      <div className="flex flex-col gap-5">
        <Link to="/applications/collector/CollectorMainPage">
          <Button
            className="w-[220px] h-[50px] text-center text-base font-bold bg-[#e66334] hover:bg-[#FF8234]"
            disabled={!isCollector && !isAdmin}
            size="lg"
          >
            COLLECTOR
          </Button>
        </Link>

        <Link to="/applications/helper/HelperMainPage">
          <Button
            className="w-[220px] h-[50px] text-center text-base font-bold bg-[#e66334] hover:bg-[#FF8234]"
            disabled={!isHelper && !isAdmin}
            size="lg"
          >
            HELPER
          </Button>
        </Link>

        <Link to="/applications/console/ConsoleMainPage">
          <Button
            className="w-[220px] h-[50px] text-center text-base font-bold bg-[#e66334] hover:bg-[#FF8234]"
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
