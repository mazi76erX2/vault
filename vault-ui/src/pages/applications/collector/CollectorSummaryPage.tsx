import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/feedback/loader";
import { Card } from "@/components/ui/card";
import Api from "@/services/Instance";

interface LocationState {
  generatedSummary?: string;
  sessionId?: string;
  isResume?: boolean;
}

interface SummaryData {
  doc_id?: string;
  title?: string;
  summary?: string;
  status?: string;
  tags?: string[];
  employee_contact?: string;
  link?: string;
  responsible?: string;
  severity_levels?: string;
  [key: string]: unknown;
}

const CollectorSummaryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const { generatedSummary, sessionId, isResume } =
    (location.state as LocationState) || {};

  console.log("CollectorSummaryPage - location.state:", location.state);

  const fetchSummary = async () => {
    if (!authContext?.user || !authContext.isLoggedIn) {
      console.warn("Auth not ready in fetchSummary");
      return;
    }

    if (!sessionId) {
      console.error("No sessionId available for fetchSummary");
      toast.error("Session ID not found.");
      navigate("/applications/collector/CollectorMainPage");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching document with sessionId:", sessionId);

      const response = await Api.post("/api/v1/collector/fetch_existing_doc", {
        sessionId: sessionId,
      });

      console.log("Document fetched:", response.data);
      setSummary(response.data.document);
    } catch (err: unknown) {
      console.error("Error fetching summary:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch summary.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) {
      toast.error("Session ID is missing. Cannot submit.");
      return;
    }

    try {
      setLoading(true);
      await Api.post("/api/v1/collector/update_session_and_document", {
        sessionid: sessionId,
      });
      toast.success("Session submitted successfully!");
      navigate("/applications/collector/CollectorMainPage");
    } catch (err: unknown) {
      console.error("Error submitting session:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to submit session.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("CollectorSummaryPage useEffect", {
      hasAuthContext: !!authContext,
      isLoadingUser: authContext?.isLoadingUser,
      isLoggedIn: authContext?.isLoggedIn,
      hasUser: !!authContext?.user,
      sessionId,
      generatedSummary: !!generatedSummary,
    });

    if (!authContext || authContext.isLoadingUser) {
      console.log("Waiting for auth to load...");
      return;
    }

    if (!authContext.user || !authContext.isLoggedIn) {
      toast.error("User not authenticated or session has expired.");
      navigate("/login");
      return;
    }

    if (!sessionId) {
      console.error("No sessionId in location.state!");
      toast.error("Session data missing. Redirecting...");
      navigate("/applications/collector/CollectorInitQuestionsPage");
      return;
    }

    fetchSummary();
  }, [authContext?.isLoadingUser, authContext?.isLoggedIn, sessionId]);

  if (!authContext || authContext.isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!authContext.user || !authContext.isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

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

          <Card className="bg-card text-card-foreground shadow-md p-6 space-y-4">
            {summary ? (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Document Title
                  </h3>
                  <p className="text-lg text-foreground">
                    {summary.title || "Untitled"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Summary
                  </h3>
                  <p className="text-lg text-foreground">
                    {summary.summary ||
                      generatedSummary ||
                      "No summary available"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Status
                  </h3>
                  <p className="text-lg capitalize text-foreground">
                    {summary.status || "Draft"}
                  </p>
                </div>

                {summary.severity_levels && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Severity Level
                    </h3>
                    <p className="text-lg text-foreground">
                      {summary.severity_levels}
                    </p>
                  </div>
                )}

                {summary.tags && summary.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {summary.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {summary.link && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Source Link
                    </h3>
                    <a
                      href={summary.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-blue-600 hover:underline"
                    >
                      {summary.link}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {generatedSummary ? (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      Generated Summary
                    </h3>
                    <p className="text-lg text-foreground">
                      {generatedSummary}
                    </p>
                  </div>
                ) : (
                  "Loading summary..."
                )}
              </div>
            )}
          </Card>

          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              size="lg"
              disabled={loading}
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              className="bg-[#e66334] hover:bg-[#FF8234]"
            >
              {loading ? "Submitting..." : "Submit Session"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorSummaryPage;
