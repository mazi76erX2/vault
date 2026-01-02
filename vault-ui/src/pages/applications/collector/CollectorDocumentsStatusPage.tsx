import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { DataTable } from "@/components/data-display/data-table";
import { Loader } from "@/components/feedback/loader";
import { toast } from "sonner";
import Api from "@/services/Instance";
import { AxiosError } from "axios";
import type { ColumnDef } from "@tanstack/react-table";

interface DocumentStatus {
  title: string;
  responsible: string;
  status: string;
  [key: string]: unknown;
}

interface FetchDocumentsResponse {
  documents: DocumentStatus[];
}

const CollectorDocumentsStatusPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<DocumentStatus[]>([]);
  const authContext = useAuthContext();

  const columns: ColumnDef<DocumentStatus>[] = [
    {
      accessorKey: "title",
      header: "Document Title",
    },
    {
      accessorKey: "responsible",
      header: "Validator",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const fetchDocuments = async () => {
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

    try {
      setLoading(true);
      const response = await Api.get<FetchDocumentsResponse>(
        "/api/v1/collector/fetchdocumentsstatus"
      );
      setRows(response.data.documents);
    } catch (err: unknown) {
      console.error("Error fetching documents status:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to fetch document status."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchDocuments();
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
        <DancingBot state="idling" className="w-full max-w-[600px] mx-auto" />

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Documents status</h1>
          </div>

          <div className="bg-[#d3d3d3] p-6 rounded-lg shadow-md">
            <DataTable columns={columns} data={rows} pageSize={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDocumentsStatusPage;
