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

interface Project {
  id: string;
  name: string;
  description: string;
  [key: string]: unknown;
}

interface FetchProjectsResponse {
  projects: Project[];
}

const CollectorStartPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const authContext = useAuthContext();
  const navigate = useNavigate();

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Project Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
  ];

  const fetchProjects = async () => {
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
      const response = await Api.get<FetchProjectsResponse>(
        "/api/v1/collector/fetchprojects"
      );
      setRows(response.data.projects);
    } catch (err: unknown) {
      console.error("Error fetching projects:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch projects."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    if (!selectedProject) {
      toast.error("Please select a project first.");
      return;
    }

    navigate("/applications/collector/CollectorInitQuestionsPage", {
      state: { project: selectedProject },
    });
  };

  useEffect(() => {
    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchProjects();
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
            <h1 className="text-2xl font-bold">Start a new session</h1>
            <p className="text-gray-600 mt-2">
              Select a project to begin your interview session.
            </p>
          </div>

          <div className="bg-[#d3d3d3] p-6 rounded-lg shadow-md">
            <DataTable
              columns={columns}
              data={rows}
              pageSize={5}
              onRowClick={(params) => setSelectedProject(params.row as Project)}
              getRowClassName={(params) =>
                params.row.id === selectedProject?.id ? "bg-blue-100" : ""
              }
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleStartSession}
              disabled={!selectedProject}
              className="bg-[#e66334] hover:bg-[#FF8234]"
              size="lg"
            >
              Start Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorStartPage;
