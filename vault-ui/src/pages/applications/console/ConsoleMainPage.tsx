import React from "react";
import { useNavigate } from "react-router-dom";
import { DancingBot } from "@/components/media/dancing-bot";

const ConsoleMainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <DancingBot state="greeting" className="w-full max-w-[600px] mx-auto" />

      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">
            Welcome to <br /> Vault Validator Console.
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="bg-[#d3d3d3] p-5 rounded-lg shadow-md text-center cursor-pointer transition-transform hover:scale-105 w-full max-w-[500px] mx-auto"
            onClick={() => navigate("/applications/console/ValidatorStartPage")}
          >
            <h3 className="text-lg font-semibold mb-2">
              Validator <br /> Review Documents
            </h3>
            <p className="text-sm">
              Click here to review and validate submitted documents.
            </p>
          </div>

          <div
            className="bg-[#d3d3d3] p-5 rounded-lg shadow-md text-center cursor-pointer transition-transform hover:scale-105 w-full max-w-[500px] mx-auto"
            onClick={() => navigate("/applications/console/ExpertStartPage")}
          >
            <h3 className="text-lg font-semibold mb-2">
              Expert <br /> Review Documents
            </h3>
            <p className="text-sm">
              Click here to perform expert review on documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleMainPage;
