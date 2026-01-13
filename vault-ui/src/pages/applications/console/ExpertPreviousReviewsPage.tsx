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
  document?: {
    id: string;
    title: string;
    author: string;
  };
}

interface DocumentDetails {
  title: string;
  author: string;
  description: string;
  content: string;
  validatorDecision: string;
  validatorComments: string;
  validatorReviewedBy: string;
  expertDecision: string;
  expertComments: string;
  expertReviewedBy: string;
  expertReviewedAt: string;
  [key: string]: unknown;
}

const ExpertPreviousReviewsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentDetails | null>(
    null,
  );
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { document } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!document?.id) return;
    fetchDocumentDetails(document.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id]);

  const fetchDocumentDetails = async (docId: string) => {
    if (
      !authContext ||
      !authContext.user?.user?.id ||
      !authContext.isLoggedIn
    ) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      return;
    }

    try {
      setLoading(true);
      const response = await Api.get(`/api/v1/expert/reviewed/${docId}`);
      setDocumentData(response.data);
    } catch (err: unknown) {
      console.error("Error fetching document details:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to fetch document details.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DancingBot state="idling" className="w-full max-w-[600px] mx-auto" />

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Previous Expert Review
            </h1>
            {document && (
              <p className="text-muted-foreground mt-2">
                Document:{" "}
                <span className="font-semibold text-foreground">
                  {document.title}
                </span>
              </p>
            )}
          </div>

          <Card className="bg-card text-card-foreground shadow-md">
            <CardContent className="p-6 space-y-6">
              {documentData && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Title
                    </h3>
                    <p className="text-lg text-foreground">
                      {documentData.title}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Author
                    </h3>
                    <p className="text-lg text-foreground">
                      {documentData.author}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Description
                    </h3>
                    <p className="text-lg text-foreground">
                      {documentData.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Content
                    </h3>
                    <div className="bg-muted/20 border border-border p-4 rounded mt-2 max-h-[300px] overflow-y-auto">
                      <p className="whitespace-pre-wrap text-foreground">
                        {documentData.content}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h2 className="text-xl font-bold mb-4 text-foreground">
                      Validator Review
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Decision
                        </h3>
                        <p className="text-lg capitalize text-foreground">
                          {documentData.validatorDecision}
                        </p>
                      </div>

                      {documentData.validatorComments && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground">
                            Comments
                          </h3>
                          <p className="text-lg text-foreground">
                            {documentData.validatorComments}
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Reviewed By
                        </h3>
                        <p className="text-lg text-foreground">
                          {documentData.validatorReviewedBy}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h2 className="text-xl font-bold mb-4 text-foreground">
                      Expert Review
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Decision
                        </h3>
                        <p className="text-lg capitalize text-foreground">
                          {documentData.expertDecision}
                        </p>
                      </div>

                      {documentData.expertComments && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground">
                            Comments
                          </h3>
                          <p className="text-lg text-foreground">
                            {documentData.expertComments}
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Reviewed By
                        </h3>
                        <p className="text-lg text-foreground">
                          {documentData.expertReviewedBy}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Reviewed At
                        </h3>
                        <p className="text-lg text-foreground">
                          {new Date(
                            documentData.expertReviewedAt,
                          ).toLocaleString()}
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
              onClick={() => navigate("/applications/console/ExpertStartPage")}
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

export default ExpertPreviousReviewsPage;
