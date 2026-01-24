import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ArrowRight, Upload, Sparkles } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button/button";
import { Loader } from "@/components/feedback/loader";
import Api from "@/services/Instance";

interface QuestionRowData {
  id: number;
  question: string;
  status: string;
  topic?: string;
  [key: string]: unknown;
}

interface UploadedQuestionObject {
  question: string;
}

interface GetQuestionsResponse {
  questions: string[];
  status: string[];
  topics?: string[];
}

interface GenerateQuestionsResponse {
  questions: string[];
  status: string[];
  topics?: string[];
}

interface StartChatResponse {
  sessionId: string;
  chatMessageId: string;
  resume: boolean;
  message?: string;
}

const CollectorInitQuestionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<QuestionRowData[]>([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionRowData | null>(null);
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const { project } = (location.state as { project?: any }) || {};

  const columns: ColumnDef<QuestionRowData>[] = [
    {
      accessorKey: "question",
      header: "Question",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  useEffect(() => {
    if (!project) {
      toast.error("No project selected. Redirecting...");
      navigate("/applications/collector/CollectorStartPage");
      return;
    }

    if (authContext && !authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchQuestions();
    }

    console.log("Auth Context:", authContext);
    console.log("User:", authContext?.user);
    console.log("Project:", project);
  }, [authContext, project]);

  const fetchQuestions = async () => {
    if (!authContext || !authContext.user?.id) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await Api.post<GetQuestionsResponse>(
        "/api/v1/collector/get-questions",
        { user_id: authContext.user.id },
      );

      if (!response.data) {
        setRows([]);
        toast.error(`Error: ${response.statusText}`);
        return;
      }

      const data = response.data;

      if (!data.questions || data.questions.length === 0) {
        setRows([]);
        toast.error(
          'No questions found. Click "Generate" to create new questions or "Upload Questions" to import from a file.',
        );
      } else {
        const newRows = data.questions
          .map((q, idx) => {
            let currentTopic = "General";
            if (data.topics && data.topics[idx] !== undefined) {
              currentTopic = data.topics[idx];
            }
            return {
              id: idx + 1,
              question: q,
              status: data.status[idx],
              topic: currentTopic,
            };
          })
          .filter((row: QuestionRowData) => row.status === "Not Started");

        setRows(newRows);
      }
    } catch (err: unknown) {
      setRows([]);
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          toast.error(
            'No questions found. Click "Generate" to create new questions or "Upload Questions" to import from a file.',
          );
        } else if (err.response?.status !== 401) {
          toast.error(err.response?.data?.detail || "An error occurred");
        }
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!authContext || !authContext.user?.id) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      return;
    }

    try {
      setLoading(true);
      const response = await Api.post<GenerateQuestionsResponse>(
        "/api/v1/collector/generate_questions",
        { user_id: authContext.user.id },
      );

      if (!response.data.questions) {
        throw new Error("Invalid response from the server.");
      }

      const { questions, status: statusList, topics } = response.data;

      const newRows = questions.map((q, idx) => ({
        id: idx + 1,
        question: q,
        status: statusList[idx],
        topic: topics?.[idx] || "General",
      }));

      toast.success("Questions generated successfully.");
      setRows(newRows);
    } catch (error: unknown) {
      console.error("Error:", error);
      if (!(error instanceof AxiosError && error.response?.status === 401)) {
        toast.error(error instanceof Error ? error.message : String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!authContext || !authContext.user?.id) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      return;
    }
    try {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result;
          if (!text || typeof text !== "string") {
            throw new Error("Failed to read file contents.");
          }

          const jsonArray = JSON.parse(text);
          if (!Array.isArray(jsonArray)) {
            throw new Error(
              "JSON must be an array of objects: [ {question: '...'}, ... ]",
            );
          }

          const questionStrings = jsonArray.map(
            (obj: UploadedQuestionObject) => {
              if (!obj.question)
                throw new Error("Each object needs a 'question' field.");
              return obj.question;
            },
          );

          if (!authContext || !authContext.user || !authContext.user.id) {
            toast.error("User not authenticated or user ID is missing.");
            return;
          }

          const response = await Api.post("/api/v1/collector/init_questions", {
            user_id: authContext.user.id,
            questions: questionStrings,
          });

          if (response.status < 200 || response.status > 299) {
            throw new Error(response.statusText);
          }

          await fetchQuestions();
        } catch (err: unknown) {
          console.error("Error parsing or upserting JSON:", err);
          if (!(err instanceof AxiosError && err.response?.status === 401)) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }
      };
      reader.readAsText(file);
    } catch (err: unknown) {
      console.error("Error in handleFileChange:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleStartChat = async (question: QuestionRowData) => {
    if (!authContext || authContext.isLoadingUser) return;

    const currentUserId = authContext.user?.id;

    if (!currentUserId) {
      toast.error("User not authenticated or session has expired.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id: question.id,
        question: question.question,
        topic: question.topic || "General",
      };

      console.log("Starting chat with payload:", payload);

      const response = await Api.post<StartChatResponse>(
        "/api/v1/collector/start-chat",
        payload,
      );

      console.log("start-chat response:", response.data);

      if (!response.data) throw new Error("Invalid response from backend.");

      const { sessionId, chatMessageId, resume } = response.data;

      if (!sessionId) {
        console.error("No sessionId in response:", response.data);
        throw new Error("Missing sessionId in backend response.");
      }

      if (!chatMessageId) {
        console.error("No chatMessageId in response:", response.data);
        throw new Error("Missing chatMessageId in backend response.");
      }

      console.log("Navigating to chat with:", {
        question: question.question,
        sessionId,
        chatMessageId,
        isResume: resume,
      });

      navigate("/applications/collector/CollectorChatPage", {
        state: {
          question: question.question,
          sessionId,
          chatMessageId,
          isResume: resume,
        },
      });
    } catch (error) {
      let errorMessage = "Failed to start chat session";

      if (axios.isAxiosError(error)) {
        errorMessage =
          (error.response?.data as any)?.detail ||
          error.message ||
          "Unknown Axios error occurred";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error(errorMessage);

      if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
        toast.error(errorMessage);
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

      <div className="max-w-4xl mx-auto p-6">
        <div>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Super!</h1>
            <p className="text-muted-foreground mt-2">
              Pick a question to start
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
            <DataTable
              columns={columns}
              data={rows}
              pageSize={5}
              onRowClick={(row) => setSelectedQuestion(row as QuestionRowData)}
              selectedRowId={selectedQuestion?.id.toString()}
              getRowId={(row) => (row as QuestionRowData).id.toString()}
            />

            {selectedQuestion && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleStartChat(selectedQuestion)}
                  disabled={loading}
                  size="lg"
                  className="gap-2"
                >
                  Start Chat
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={generateQuestions}
                disabled={loading}
                size="lg"
                className="gap-2"
              >
                <Sparkles className="h-5 w-5" />
                {loading ? "Generating..." : "Generate"}
              </Button>

              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload questions JSON file"
                title="Upload questions JSON file"
              />

              <Button
                onClick={handleUploadButtonClick}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Upload className="h-5 w-5" />
                Upload Questions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorInitQuestionsPage;
