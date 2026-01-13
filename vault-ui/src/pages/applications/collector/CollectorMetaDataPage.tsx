import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/feedback/loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Api from "@/services/Instance";

interface LocationState {
  sessionId?: string;
  summaryText?: string;
  isResume?: boolean;
}

const CollectorMetaDataPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [contact, setContact] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [validatorId, setValidatorId] = useState("");
  const [validators, setValidators] = useState<
    { id: string; fullName: string }[]
  >([]);
  const [errors, setErrors] = useState<{
    title?: string;
    validator?: string;
  }>({});

  const authContext = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, summaryText, isResume } =
    (location.state as LocationState) || {};

  console.log("CollectorMetaDataPage - location.state:", location.state);

  useEffect(() => {
    if (!authContext || authContext.isLoadingUser) {
      return;
    }

    if (!authContext.user || !authContext.isLoggedIn) {
      toast.error("User not authenticated or session has expired.");
      navigate("/login");
      return;
    }

    if (!sessionId) {
      toast.error("Session data missing. Redirecting...");
      navigate("/applications/collector/CollectorInitQuestionsPage");
      return;
    }

    fetchValidators();
  }, [authContext?.isLoadingUser, authContext?.isLoggedIn, sessionId]);

  const fetchValidators = async () => {
    try {
      const response = await Api.get("/api/v1/collector/get_validators");
      setValidators(response.data.validators || []);
    } catch (err) {
      console.error("Error fetching validators:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error("Failed to load validators.");
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; validator?: string } = {};

    if (!documentTitle.trim()) {
      newErrors.title = "Document title is required";
    }

    if (!validatorId) {
      newErrors.validator = "Please select a validator";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!sessionId) {
      toast.error("Session ID is missing. Cannot save.");
      return;
    }

    try {
      setLoading(true);

      await Api.post("/api/v1/collector/update_session_and_document", {
        sessionid: sessionId,
        documenttitle: documentTitle,
        sourcelink: sourceLink || null,
        contact: contact || null,
        severity: severity,
        validatorid: validatorId,
      });

      toast.success("Document saved successfully!");
      navigate("/applications/collector/CollectorMainPage");
    } catch (err: unknown) {
      console.error("Error saving metadata:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save document.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
              Document Details
            </h1>
            <p className="text-muted-foreground mt-2">
              Please provide additional information about the document.
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentTitle">
                Document Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="documentTitle"
                value={documentTitle}
                onChange={(e) => {
                  setDocumentTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="Enter document title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceLink">Source Link (optional)</Label>
              <Input
                id="sourceLink"
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                placeholder="https://example.com/source"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact (optional)</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validator">
                Assign Validator <span className="text-red-500">*</span>
              </Label>
              <select
                id="validator"
                value={validatorId}
                onChange={(e) => {
                  setValidatorId(e.target.value);
                  setErrors((prev) => ({ ...prev, validator: undefined }));
                }}
                className={`w-full h-10 px-3 rounded-md border bg-background text-foreground ${
                  errors.validator ? "border-red-500" : "border-input"
                }`}
              >
                <option value="">Select a validator</option>
                {validators.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.fullName}
                  </option>
                ))}
              </select>
              {errors.validator && (
                <p className="text-sm text-red-500">{errors.validator}</p>
              )}
            </div>
          </div>

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
              {loading ? "Saving..." : "Save & Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorMetaDataPage;
