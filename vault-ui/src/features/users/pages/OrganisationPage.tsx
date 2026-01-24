import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";

const DRAWER_WIDTH = 240;

const OrganisationPage: React.FC = () => (
  <div
    className="flex items-center justify-center p-5 flex-col gap-5"
    style={{
      marginLeft: `-${DRAWER_WIDTH}px`,
      width: `calc(100% + ${DRAWER_WIDTH}px)`,
    }}
  >
    <Link to="/users/OrganisationDetailsPage">
      <Button
        className="w-[220px] h-[50px] text-center text-base font-bold mt-2 bg-[#e66334] hover:bg-[#FF8234]"
        size="sm"
      >
        ORGANISATION DETAILS
      </Button>
    </Link>

    <Link to="/users/UserManagementPage">
      <Button
        className="w-[220px] h-[50px] text-center text-base font-bold mt-2 bg-[#e66334] hover:bg-[#FF8234]"
        size="sm"
      >
        USER MANAGEMENT
      </Button>
    </Link>
  </div>
);

export default OrganisationPage;
