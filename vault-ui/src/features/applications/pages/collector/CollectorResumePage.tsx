import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DataTable } from "@/components/data-display/data-table";
import { Loader } from "@/components/feedback/loader";
import { Button } from "@/components/ui/button/button";
import Api from "@/services/Instance";

interface SessionFromBackend {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  topic: string;
}

interface Session {
  id: string;
  topic: string;
  createdAt: string;
  status: string;
  [key: string]: unknown;
}

interface FetchSessionsResponse {
  sessions: SessionFromBackend[];
}

const CollectorResumePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const authContext = useAuthContext();
  const navigate = useNavigate();

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: "topic",
      header: "Topic",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const dateValue = row.getValue("createdAt");
        if (!dateValue) return "N/A";
        const date = new Date(dateValue as string);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const fetchSessions = async () => {
    if (!authContext || !authContext.user?.id || !authContext.isLoggedIn) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await Api.post<FetchSessionsResponse>(
        "/api/v1/collector/fetch_resume_sessions",
      );

      const sessions = response.data.sessions.map((s) => ({
        id: s.id,
        topic: s.topic || "Untitled Session",
        createdAt: s.created_at,
        status: s.status,
      }));

      setRows(sessions);

      if (sessions.length === 0) {
        toast.info("No sessions available to resume.");
      }
    } catch (err: unknown) {
      console.error("Error fetching sessions:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch sessions.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async () => {
    if (!selectedSession) {
      toast.error("Please select a session first.");
      return;
    }

    try {
      setLoading(true);

      const response = await Api.post(
        "/api/v1/collector/fetch_chat_conversation",
        { sessionid: selectedSession.id },
      );

      const chatMessageId = response.data.chatmessagesid;

      navigate("/applications/collector/CollectorChatPage", {
        state: {
          sessionId: selectedSession.id,
          chatMessageId: chatMessageId,
          isResume: true,
          question: selectedSession.topic,
        },
      });
    } catch (err: unknown) {
      console.error("Error resuming session:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to resume session.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchSessions();
    }
  }, [authContext]);

  if (!authContext || authContext.isLoadingUser) {
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

      <div className="max-w-4xl mx-auto p-6">
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground text-center">
              Resume a session
            </h1>
            <p className="text-muted-foreground mt-2 text-center">
              Select an existing session to continue your interview.
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
            {rows.length > 0 ? (
              <DataTable
                columns={columns}
                data={rows}
                pageSize={5}
                onRowClick={(row) => setSelectedSession(row as Session)}
                selectedRowId={selectedSession?.id}
                getRowId={(row) => (row as Session).id}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {loading
                  ? "Loading sessions..."
                  : "No sessions available to resume."}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() =>
                navigate("/applications/collector/CollectorMainPage")
              }
              size="lg"
            >
              Back
            </Button>
            <Button
              onClick={handleResumeSession}
              disabled={!selectedSession || loading}
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
