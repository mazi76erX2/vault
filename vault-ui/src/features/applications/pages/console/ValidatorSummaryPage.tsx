import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button/button";
import { Loader } from "@/components/feedback/loader";
import { Card, CardContent } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge/badge";
import Api from "@/services/Instance";

interface LocationState {
  documentId?: string;
}

interface SummaryData {
  title: string;
  author: string;
  description: string;
  decision: string;
  comments: string;
  reviewedBy: string;
  reviewedAt: string;
  status: string;
  [key: string]: unknown;
}

const ValidatorSummaryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { documentId } = (location.state as LocationState) || {};

  const fetchSummary = async () => {
    if (!authContext || !authContext.user?.id || !authContext.isLoggedIn) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
        setLoading(false);
      }
      return;
    }

    if (!documentId) {
      toast.error("Document ID not found.");
      navigate("/applications/console/ValidatorStartPage");
      return;
    }

    try {
      setLoading(true);
      const response = await Api.get(`/api/v1/validator/summary/${documentId}`);
      setSummary(response.data);
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

  useEffect(() => {
    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchSummary();
    }
  }, [authContext]);

  const getDecisionBadgeVariant = (decision: string) => {
    switch (decision) {
      case "approve":
        return "default";
      case "reject":
        return "destructive";
      case "expert_review":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground text-center">
            Review Summary
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            Your review has been submitted successfully.
          </p>
        </div>

        <Card className="bg-card text-card-foreground shadow-md">
          <CardContent className="p-6 space-y-4">
            {summary && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Status
                  </h3>
                  <Badge
                    variant={getDecisionBadgeVariant(summary.decision)}
                    className="capitalize"
                  >
                    {summary.decision.replace("_", " ")}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Document Title
                  </h3>
                  <p className="text-lg text-foreground">{summary.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Author
                  </h3>
                  <p className="text-lg text-foreground">{summary.author}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Description
                  </h3>
                  <p className="text-lg text-foreground">
                    {summary.description}
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h2 className="text-xl font-bold mb-4 text-foreground">
                    Your Review
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Decision
                      </h3>
                      <p className="text-lg capitalize text-foreground">
                        {summary.decision.replace("_", " ")}
                      </p>
                    </div>

                    {summary.comments && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Comments
                        </h3>
                        <p className="text-lg text-foreground">
                          {summary.comments}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Reviewed By
                      </h3>
                      <p className="text-lg text-foreground">
                        {summary.reviewedBy}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Reviewed At
                      </h3>
                      <p className="text-lg text-foreground">
                        {new Date(summary.reviewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => navigate("/applications/console/ValidatorStartPage")}
            size="lg"
          >
            Back to Documents
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ValidatorSummaryPage;
