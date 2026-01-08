import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DancingBot } from "@/components/media/dancing-bot";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/hooks/useAuthContext"; // ✅ Proper hook
import { getCurrentUser } from "@/services/auth/Auth.service"; // ✅ Direct check

interface Project {
  id: string;
  name: string;
  description: string;
}

const CollectorMainPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const authContext = useAuthContext();
  const navigate = useNavigate();

  const handleStartNewSession = () => {
    // ✅ FIXED: Direct localStorage check (no API call = no 401)
    const user = getCurrentUser();
    if (!user?.accesstoken) {
      toast.error("Session expired. Redirecting to login...");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
      return;
    }

    navigate("/applications/collector/CollectorStartPage");
  };

  const handleResumeSession = () => {
    // ✅ FIXED: Direct localStorage check
    const user = getCurrentUser();
    if (!user?.accesstoken) {
      toast.error("Session expired. Redirecting to login...");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
      return;
    }

    navigate("/applications/collector/CollectorResumePage");
  };

  if (!authContext || authContext.isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* Loading spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12 px-6 lg:px-12">
        {/* Left: Illustration */}
        <div className="flex justify-center lg:justify-end">
          <DancingBot
            state="greeting"
            className="w-full max-w-[500px] lg:max-w-[600px]"
          />
        </div>

        {/* Right: Content */}
        <div className="space-y-8 max-w-md">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Collector Dashboard
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Choose an option to get started with your knowledge collection
              workflow.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            {/* Start New Session */}
            <Button
              onClick={handleStartNewSession}
              size="lg"
              className="w-full h-16 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>✨ Start a New Session</>
              )}
            </Button>

            {/* Resume Session */}
            <Button
              onClick={handleResumeSession}
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg font-semibold border-2 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              📋 Resume Existing Session
            </Button>
          </div>

          {/* Previous Sessions Link */}
          <div className="pt-8 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-0 text-muted-foreground hover:text-foreground gap-2 text-sm"
              onClick={() =>
                navigate("/applications/collector/CollectorDocumentsStatusPage")
              }
            >
              📊 View Previous Sessions
              <span className="ml-auto text-xs opacity-75">→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorMainPage;
