import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DataTable } from "@/components/data-display";
import { Loader } from "@/components/ui/loader/loader";
import { Button } from "@/components/ui/button/button";
import Api from "@/services/Instance";

interface Document {
  id: string;
  title: string;
  author: string;
  status: string;
  submittedAt: string;
  [key: string]: unknown;
}

interface FetchDocumentsResponse {
  documents: Document[];
}

const ValidatorStartPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const authContext = useAuthContext();
  const navigate = useNavigate();

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: "title",
      header: "Document Title",
    },
    {
      accessorKey: "author",
      header: "Author",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "submittedAt",
      header: "Submitted At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("submittedAt"));
        return date.toLocaleDateString();
      },
    },
  ];

  const fetchDocuments = async () => {
    if (!authContext || !authContext.user?.id || !authContext.isLoggedIn) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await Api.get<FetchDocumentsResponse>(
        `/api/v1/validator/get-documents?userid=${authContext.user.id}`,
      );
      setRows(response.data.documents);
    } catch (err: unknown) {
      console.error("Error fetching documents:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch documents.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = () => {
    if (!selectedDocument) {
      toast.error("Please select a document first.");
      return;
    }

    if (selectedDocument.status === "expert_review") {
      navigate("/applications/console/ValidatorStartExpertReviewPage", {
        state: { document: selectedDocument },
      });
    } else {
      navigate("/applications/console/ValidatorDocPage", {
        state: { document: selectedDocument },
      });
    }
  };

  useEffect(() => {
    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchDocuments();
    }
  }, [
    authContext?.isLoadingUser,
    authContext?.isLoggedIn,
    authContext?.user?.id,
  ]);

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground text-center">
              Documents for Review
            </h1>
            <p className="text-muted-foreground mt-2 text-center">
              Select a document to begin validation.
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
            <DataTable
              columns={columns}
              data={rows}
              pageSize={5}
              onRowClick={(row) => setSelectedDocument(row as Document)}
              selectedRowId={selectedDocument?.id}
              getRowId={(row) => (row as Document).id}
            />
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/applications/console/ConsoleMainPage")}
              size="lg"
            >
              Back
            </Button>
            <Button
              onClick={handleStartReview}
              disabled={!selectedDocument}
              size="lg"
            >
              Start Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorStartPage;
