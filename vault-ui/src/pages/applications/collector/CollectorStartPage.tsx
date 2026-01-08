import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-display/data-table";
import Api from "@/services/Instance";

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
  const navigate = useNavigate();

  const columns = [
    {
      accessorKey: "name",
      header: "Project Name",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info: any) => info.getValue(),
    },
  ];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await Api.get<FetchProjectsResponse>(
        "/api/v1/collector/fetchprojects"
      );
      setRows(response.data.projects);
    } catch (err: unknown) {
      console.error("Error fetching projects:", err);
      if (
        err instanceof Error &&
        !err.message.includes("401") &&
        !err.message.includes("403")
      ) {
        toast.error(err.message || "Failed to fetch projects");
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
    fetchProjects();
  }, []);

  const getRowClassName = (params: any) => {
    return params.row.id === selectedProject?.id
      ? "bg-muted hover:bg-muted/80"
      : "";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl shadow-lg border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="h-fit shadow-lg border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Start New Session
            </CardTitle>
            <CardDescription className="text-lg">
              Select a project to begin your knowledge collection interview
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="w-48 h-48 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto shadow-2xl mb-6">
              <svg
                className="w-20 h-20 text-background"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              Choose from your active projects below. Each session captures
              structured knowledge that can be reviewed, validated, and stored
              in your knowledge base.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Active Projects ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={rows}
              pageSize={10}
              onRowClick={(params) => setSelectedProject(params.row as Project)}
              getRowClassName={getRowClassName}
              searchKey="name"
              searchPlaceholder="Search projects..."
              emptyMessage="No projects found. Create one to get started."
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8">
        <Button
          size="lg"
          className="text-lg px-12 shadow-xl"
          onClick={handleStartSession}
          disabled={!selectedProject || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              Start Session
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() =>
            navigate("/applications/collector/CollectorDocumentsStatusPage")
          }
          className="text-muted-foreground hover:text-foreground p-0 h-auto"
        >
          View previous sessions
        </Button>
      </div>
    </div>
  );
};

export default CollectorStartPage;
