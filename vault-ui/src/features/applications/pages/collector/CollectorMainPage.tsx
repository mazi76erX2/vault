import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";

const CollectorMainPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartNewSession = () => {
    navigate("/applications/collector/CollectorStartPage");
  };

  const handleResumeSession = () => {
    navigate("/applications/collector/CollectorResumePage");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-4xl mx-auto">
      <div className="space-y-8 w-full max-w-md">
        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Welcome to <br /> Vault Collector.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Choose an option to get started with your knowledge collection
            workflow.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleStartNewSession}
            size="lg"
            className="w-full h-16 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start a New Session
          </Button>

          <Button
            onClick={handleResumeSession}
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg font-semibold border-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Resume Existing Session
          </Button>
        </div>

        <div className="pt-8 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-center h-auto p-0 text-muted-foreground hover:text-foreground gap-2 text-sm"
            onClick={() =>
              navigate("/applications/collector/CollectorDocumentsStatusPage")
            }
          >
            View Previous Sessions
            <span className="ml-auto text-xs opacity-75">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollectorMainPage;
