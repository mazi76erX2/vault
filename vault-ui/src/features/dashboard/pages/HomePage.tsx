import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Loader } from "@/components/ui/loader/loader";

const HomePage: React.FC = () => {
  const authContext = useAuthContext();

  if (!authContext || authContext.isLoadingUser) {
    return <Loader />;
  }

  const { userRoles: contextUserRoles } = authContext;

  const roles = Array.isArray(contextUserRoles) ? contextUserRoles : [];

  const hasRole = (roleName: string): boolean => {
    return roles.some((role) => role.toLowerCase() === roleName.toLowerCase());
  };

  const isAdmin = hasRole("Administrator");
  const isCollector = hasRole("Collector");
  const isHelper = hasRole("Helper");
  const isValidator = hasRole("Validator");

  return (
    <div className="flex items-center justify-center p-5 flex-wrap relative min-h-[80vh]">
      <div className="flex flex-col gap-5 justify-center">
        <Link to="/applications/collector/CollectorMainPage">
          <Button
            className="w-[250px] h-[60px] text-base font-bold"
            size="lg"
            disabled={!isCollector && !isAdmin}
          >
            COLLECTOR
          </Button>
        </Link>

        <Link to="/applications/helper/HelperMainPage">
          <Button
            className="w-[250px] h-[60px] text-base font-bold"
            size="lg"
            disabled={!isHelper && !isAdmin}
          >
            HELPER
          </Button>
        </Link>

        <Link to="/applications/console/ConsoleMainPage">
          <Button
            className="w-[250px] h-[60px] text-base font-bold"
            size="lg"
            disabled={!isValidator && !isAdmin}
          >
            VALIDATOR
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
