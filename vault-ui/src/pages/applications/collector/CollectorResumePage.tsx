import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { DataTable } from "@/components/data-display/data-table";
import { Loader } from "@/components/feedback/loader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Api from "@/services/Instance";
import { AxiosError } from "axios";
import type { ColumnDef } from "@tanstack/react-table";

interface Session {
  id: string;
  projectName: string;
  createdAt: string;
  status: string;
  [key: string]: unknown;
}

interface FetchSessionsResponse {
  sessions: Session[];
}

const CollectorResumePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const authContext = useAuthContext();
  const navigate = useNavigate();

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const fetchSessions = async () => {
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
      const response = await Api.get<FetchSessionsResponse>(
        "/api/v1/collector/fetchsessions"
      );
      setRows(response.data.sessions);
    } catch (err: unknown) {
      console.error("Error fetching sessions:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch sessions."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = () => {
    if (!selectedSession) {
      toast.error("Please select a session first.");
      return;
    }

    navigate("/applications/collector/CollectorChatPage", {
      state: { session: selectedSession },
    });
  };

  useEffect(() => {
    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchSessions();
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
            <h1 className="text-2xl font-bold">Resume a session</h1>
            <p className="text-gray-600 mt-2">
              Select an existing session to continue your interview.
            </p>
          </div>

          <div className="bg-[#d3d3d3] p-6 rounded-lg shadow-md">
            <DataTable
              columns={columns}
              data={rows}
              pageSize={5}
              onRowClick={(params) => setSelectedSession(params.row as Session)}
              getRowClassName={(params) =>
                params.row.id === selectedSession?.id ? "bg-blue-100" : ""
              }
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleResumeSession}
              disabled={!selectedSession}
              className="bg-[#e66334] hover:bg-[#FF8234]"
              size="lg"
            >
              Resume Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorResumePage;
