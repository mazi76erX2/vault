import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/feedback/loader";
import { Card, CardContent } from "@/components/ui/card";
import Api from "@/services/Instance";

interface LocationState {
  sessionId?: string;
}

interface SummaryData {
  projectName: string;
  documentTitle: string;
  documentDescription: string;
  author: string;
  documentDate: string;
  version: string;
  conversationCount: number;
  status: string;
  [key: string]: unknown;
}

const CollectorSummaryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = (location.state as LocationState) || {};

  const fetchSummary = async () => {
    if (
      !authContext ||
      !authContext.user?.user?.id ||
      !authContext.isLoggedIn
    ) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
        setLoading(false);
      }
      return;
    }

    if (!sessionId) {
      toast.error("Session ID not found.");
      navigate("/applications/collector/CollectorMainPage");
      return;
    }

    try {
      setLoading(true);
      const response = await Api.get(`/api/v1/collector/summary/${sessionId}`);
      setSummary(response.data);
    } catch (err: unknown) {
      console.error("Error fetching summary:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch summary."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await Api.post("/api/v1/collector/submit", { sessionId });
      toast.success("Session submitted successfully!");
      navigate("/applications/collector/CollectorMainPage");
    } catch (err: unknown) {
      console.error("Error submitting session:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to submit session."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchSummary();
    }
  }, [authContext]);

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DancingBot state="greeting" className="w-full max-w-[600px] mx-auto" />

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Session Summary
            </h1>
            <p className="text-muted-foreground mt-2">
              Review your session details before submitting.
            </p>
          </div>

          <Card className="bg-card text-card-foreground shadow-md">
            <CardContent className="p-6 space-y-4">
              {summary && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Project
                    </h3>
                    <p className="text-lg text-foreground">
                      {summary.projectName}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Document Title
                    </h3>
                    <p className="text-lg text-foreground">
                      {summary.documentTitle}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Description
                    </h3>
                    <p className="text-lg text-foreground">
                      {summary.documentDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Author
                      </h3>
                      <p className="text-lg text-foreground">
                        {summary.author}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Version
                      </h3>
                      <p className="text-lg text-foreground">
                        {summary.version}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Document Date
                    </h3>
                    <p className="text-lg text-foreground">
                      {new Date(summary.documentDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Conversations
                    </h3>
                    <p className="text-lg text-foreground">
                      {summary.conversationCount} messages
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Status
                    </h3>
                    <p className="text-lg capitalize text-foreground">
                      {summary.status}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)} size="lg">
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading} size="lg">
              Submit Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorSummaryPage;
