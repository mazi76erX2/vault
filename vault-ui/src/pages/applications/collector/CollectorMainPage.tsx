import React from "react";
import { useNavigate } from "react-router-dom";
import { DancingBot } from "@/components/media/dancing-bot";

const CollectorMainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <DancingBot state="greeting" className="w-full max-w-[600px] mx-auto" />

      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">
            Welcome to <br /> Vault Collector Chat.
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="bg-[#d3d3d3] p-5 rounded-lg shadow-md text-center cursor-pointer transition-transform hover:scale-105 w-full max-w-[500px] mx-auto"
            onClick={() =>
              navigate("/applications/collector/CollectorResumePage")
            }
          >
            <h3 className="text-lg font-semibold mb-2">
              Continue <br /> an existing session
            </h3>
            <p className="text-sm">
              Click here to select one of your unfinished interviews.
            </p>
          </div>

          <div
            className="bg-[#d3d3d3] p-5 rounded-lg shadow-md text-center cursor-pointer transition-transform hover:scale-105 w-full max-w-[500px] mx-auto"
            onClick={() =>
              navigate("/applications/collector/CollectorStartPage")
            }
          >
            <h3 className="text-lg font-semibold mb-2">
              Start <br /> a new session
            </h3>
            <p className="text-sm">Click here to start a new interview.</p>
          </div>

          <div
            className="bg-[#d3d3d3] p-5 rounded-lg shadow-md text-center cursor-pointer transition-transform hover:scale-105 w-full max-w-[500px] mx-auto"
            onClick={() =>
              navigate("/applications/collector/CollectorDocumentsStatusPage")
            }
          >
            <h3 className="text-lg font-semibold mb-2">Previous sessions</h3>
            <p className="text-sm">
              Click here to view the status of previous sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorMainPage;
