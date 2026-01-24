import React from "react";
import { useNavigate } from "react-router-dom";

const ConsoleMainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col items-center">
      <div className="space-y-6 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-foreground">
            Welcome to <br /> Vault Validator Console.
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="bg-card text-card-foreground p-8 rounded-lg shadow-md border border-border text-center cursor-pointer transition-transform hover:scale-105 hover:bg-muted/50 w-full max-w-[500px] mx-auto"
            onClick={() => navigate("/applications/console/ValidatorStartPage")}
          >
            <h3 className="text-xl font-semibold mb-2">
              Validator <br /> Review Documents
            </h3>
            <p className="text-sm text-muted-foreground">
              Click here to review and validate submitted documents.
            </p>
          </div>

          <div
            className="bg-card text-card-foreground p-8 rounded-lg shadow-md border border-border text-center cursor-pointer transition-transform hover:scale-105 hover:bg-muted/50 w-full max-w-[500px] mx-auto"
            onClick={() => navigate("/applications/console/ExpertStartPage")}
          >
            <h3 className="text-xl font-semibold mb-2">
              Expert <br /> Review Documents
            </h3>
            <p className="text-sm text-muted-foreground">
              Click here to perform expert review on documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleMainPage;
