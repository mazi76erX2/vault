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
  documentId?: string;
}

interface SummaryData {
  documentTitle: string;
  author: string;
  reviewedBy: string;
  decision: string;
  comments: string;
  reviewedAt: string;
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

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/80 z-[1000] flex justify-center items-center">
          <Loader />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DancingBot state="greeting" className="w-full max-w-[600px] mx-auto" />

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Review Summary</h1>
            <p className="text-gray-600 mt-2">
              Your review has been submitted successfully.
            </p>
          </div>

          <Card className="bg-[#d3d3d3] p-6 shadow-md space-y-4">
            {summary && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Document Title
                  </h3>
                  <p className="text-lg">{summary.documentTitle}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Author
                  </h3>
                  <p className="text-lg">{summary.author}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Reviewed By
                  </h3>
                  <p className="text-lg">{summary.reviewedBy}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Decision
                  </h3>
                  <p className="text-lg capitalize">{summary.decision}</p>
                </div>

                {summary.comments && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">
                      Comments
                    </h3>
                    <p className="text-lg">{summary.comments}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Reviewed At
                  </h3>
                  <p className="text-lg">
                    {new Date(summary.reviewedAt).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() =>
                navigate("/applications/console/ValidatorStartPage")
              }
              className="bg-[#e66334] hover:bg-[#FF8234]"
              size="lg"
            >
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorSummaryPage;
