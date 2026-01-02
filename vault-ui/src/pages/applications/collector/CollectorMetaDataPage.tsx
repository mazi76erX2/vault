import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { DancingBot } from "@/components/media/dancing-bot";
import { TextField } from "@/components/forms/text-field";
import { DatePicker } from "@/components/forms/date-picker";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/feedback/loader";
import Api from "@/services/Instance";

interface LocationState {
  sessionId?: string;
}

const CollectorMetaDataPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useState("");
  const [documentDate, setDocumentDate] = useState<Date | undefined>(undefined);
  const [version, setVersion] = useState("");
  const [errors, setErrors] = useState<{
    author?: string;
    date?: string;
    version?: string;
  }>({});

  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = (location.state as LocationState) || {};

  const validateForm = (): boolean => {
    const newErrors: { author?: string; date?: string; version?: string } = {};

    if (!author.trim()) {
      newErrors.author = "Author is required";
    }

    if (!documentDate) {
      newErrors.date = "Document date is required";
    }

    if (!version.trim()) {
      newErrors.version = "Version is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await Api.post("/api/v1/collector/savemetadata", {
        sessionId,
        author,
        documentDate: documentDate?.toISOString(),
        version,
      });

      toast.success("Metadata saved successfully!");

      navigate("/applications/collector/CollectorSummaryPage", {
        state: { sessionId },
      });
    } catch (err: unknown) {
      console.error("Error saving metadata:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save metadata.",
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
        <DancingBot state="greeting" className="w-full max-w-[600px] mx-auto" />

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Document Metadata</h1>
            <p className="text-gray-600 mt-2">
              Please provide additional information about the document.
            </p>
          </div>

          <div className="bg-[#d3d3d3] p-6 rounded-lg shadow-md space-y-6">
            <TextField
              label="Author"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                setErrors((prev) => ({ ...prev, author: undefined }));
              }}
              error={errors.author}
              placeholder="Enter author name"
              required
            />

            <DatePicker
              label="Document Date"
              value={documentDate}
              onChange={(date) => {
                setDocumentDate(date);
                setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              error={errors.date}
              required
            />

            <TextField
              label="Version"
              value={version}
              onChange={(e) => {
                setVersion(e.target.value);
                setErrors((prev) => ({ ...prev, version: undefined }));
              }}
              error={errors.version}
              placeholder="e.g., 1.0.0"
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)} size="lg">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#e66334] hover:bg-[#FF8234]"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorMetaDataPage;
