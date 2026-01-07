import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ArrowRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { DataTable } from "@/components/data-display/data-table";
import { Loader } from "@/components/feedback/loader";
import { Button } from "@/components/ui/button";
import Api from "@/services/Instance";

interface ChatMessage {
  id: string;
  created_at: string;
  createdAt?: string;
  messages: [string, string][];
}

interface Profile {
  id: string;
  fullName: string;
}

interface ChatRow {
  id: string;
  createdAt: string;
  topic: string;
  [key: string]: unknown;
}

const HelperPreviousChatsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRow | null>(null);

  const authContext = useAuthContext();
  const user = authContext?.user;
  const isLoggedIn = authContext?.isLoggedIn;
  const isLoadingUser = authContext?.isLoadingUser;
  const navigate = useNavigate();

  const columns: ColumnDef<ChatRow>[] = [
    {
      accessorKey: "topic",
      header: "Topic",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
    },
  ];

  const adaptChatsToRows = async (
    chatsData: ChatMessage[]
  ): Promise<ChatRow[]> => {
    const adaptedRows = await Promise.all(
      chatsData.map(async (chat) => {
        let firstAssistantMessage = "No topic found";

        if (chat.messages && Array.isArray(chat.messages)) {
          if (
            chat.messages.length > 0 &&
            Array.isArray(chat.messages[0]) &&
            chat.messages[0].length >= 2
          ) {
            firstAssistantMessage = chat.messages[0][0];
          }
        }

        let formattedDate = "Invalid Date";
        try {
          const dateStr = chat.created_at;
          if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleDateString("en-GB");
            }
          }
        } catch (e) {
          console.error("Error formatting date:", e);
        }

        return {
          id: chat.id,
          createdAt: formattedDate,
          topic: firstAssistantMessage,
        };
      })
    );

    return adaptedRows;
  };

  useEffect(() => {
    const fetchPreviousChats = async () => {
      try {
        setLoading(true);
        if (isLoadingUser) return;

        if (!isLoggedIn || !user) {
          toast.error("User not logged in");
          return;
        }

        const response = await Api.get("/api/v1/helper/user_maps");

        if (!response.data || !response.data.user_maps) {
          toast.error("Invalid response from the server.");
          return;
        }

        const profiles = response.data.user_maps.data as Profile[];
        const userMap = new Map(
          profiles.map((profile: Profile) => [profile.id, profile.fullName])
        );

        const chatsResponse = await Api.post(
          "/api/v1/helper/get_previous_chats",
          {
            user_id: user.user.id,
          }
        );

        if (!chatsResponse.data || !chatsResponse.data.get_previous_chats) {
          toast.error("Invalid response from the server.");
          return;
        }

        const chatsData = chatsResponse.data.get_previous_chats.data;

        if (!chatsData || chatsData.length === 0) {
          toast.error("No previous chats found.");
          return;
        }

        try {
          const adaptedRows = await adaptChatsToRows(chatsData);
          setRows(adaptedRows);
        } catch (error) {
          console.error("Error adapting chat rows:", error);
        }
      } catch (err) {
        console.error(err);
        if (!(err instanceof AxiosError && err.response?.status === 401)) {
          toast.error(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousChats();
  }, [isLoggedIn, isLoadingUser]);

  const handleGoToChat = (chat: ChatRow) => {
    if (!chat.id) {
      toast.error("Cannot go to Chat: missing chat message ID");
      return;
    }

    navigate("/applications/helper/HelperChatPage", {
      state: {
        isResume: true,
        chatId: chat.id,
      },
    });
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <DancingBot state="idling" className="w-full max-w-[600px] mx-auto" />

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Chats previously started
            </h1>
            <p className="text-muted-foreground mt-2">
              Select a chat to continue your conversation.
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
            <DataTable
              columns={columns}
              data={rows}
              pageSize={10}
              onRowClick={(params) => setSelectedChat(params.row as ChatRow)}
              getRowClassName={(params) =>
                params.row.id === selectedChat?.id ? "bg-primary/20" : ""
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/applications/helper/HelperMainPage")}
              size="lg"
            >
              Back
            </Button>
            <Button
              onClick={() => selectedChat && handleGoToChat(selectedChat)}
              disabled={!selectedChat}
              size="lg"
              className="gap-2"
            >
              Resume Chat
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperPreviousChatsPage;
