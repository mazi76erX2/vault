import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/feedback/loader";
import { Card } from "@/components/ui/card";
import { RadioButtonGroup as RadioGroup } from "@/components/forms/radio-group";
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
  [key: string]: unknown;
}

const ExpertDocPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<string>("");
  const [comments, setComments] = useState("");
  const [documentData, setDocumentData] = useState<DocumentDetails | null>(
    null,
  );
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { document } = (location.state as LocationState) || {};

  const decisionOptions = [
    { value: "approve", label: "Approve" },
    { value: "reject", label: "Reject" },
    { value: "request_changes", label: "Request Changes" },
  ];

  useEffect(() => {
    if (document) {
      fetchDocumentDetails(document.id);
    } else {
      toast.error("Document not found.");
      navigate("/applications/console/ExpertStartPage");
    }
  }, [document]);

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
      const response = await Api.get(`/api/v1/expert/document/${docId}`);
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

  const handleSubmit = async () => {
    if (!decision) {
      toast.error("Please select a decision.");
      return;
    }

    try {
      setLoading(true);
      await Api.post("/api/v1/expert/submitreview", {
        documentId: document?.id,
        decision,
        comments,
      });

      toast.success("Expert review submitted successfully!");
      navigate("/applications/console/ExpertStartPage");
    } catch (err: unknown) {
      console.error("Error submitting review:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to submit review.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/80 z-[1000] flex justify-center items-center">
          <Loader />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DancingBot state="idling" className="w-full max-w-[600px] mx-auto" />

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Expert Review</h1>
            {document && (
              <p className="text-gray-600 mt-2">
                Document:{" "}
                <span className="font-semibold">{document.title}</span>
              </p>
            )}
          </div>

          <Card className="bg-[#d3d3d3] p-6 shadow-md space-y-6 mb-6">
            {documentData && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Title</h3>
                  <p className="text-lg">{documentData.title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Author
                  </h3>
                  <p className="text-lg">{documentData.author}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Description
                  </h3>
                  <p className="text-lg">{documentData.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Content
                  </h3>
                  <div className="bg-white p-4 rounded mt-2 max-h-[300px] overflow-y-auto">
                    <p className="whitespace-pre-wrap">
                      {documentData.content}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-400 pt-4">
                  <h2 className="text-xl font-bold mb-4">Validator Review</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600">
                        Decision
                      </h3>
                      <p className="text-lg capitalize">
                        {documentData.validatorDecision}
                      </p>
                    </div>

                    {documentData.validatorComments && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600">
                          Comments
                        </h3>
                        <p className="text-lg">
                          {documentData.validatorComments}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-gray-600">
                        Reviewed By
                      </h3>
                      <p className="text-lg">
                        {documentData.validatorReviewedBy}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          <div className="bg-[#d3d3d3] p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-xl font-bold">Your Expert Review</h2>

            <RadioGroup
              label="Decision"
              options={decisionOptions}
              value={decision}
              onChange={setDecision}
              required
            />

            <TextField
              label="Comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add your expert review comments..."
              multiline
              rows={4}
            />
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)} size="lg">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !decision}
              className="bg-[#e66334] hover:bg-[#FF8234]"
              size="lg"
            >
              Submit Expert Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertDocPage;
