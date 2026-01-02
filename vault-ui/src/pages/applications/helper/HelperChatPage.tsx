import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { DancingBot } from "@/components/media/dancing-bot";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/feedback/loader";
import { toast } from "sonner";
import Api from "@/services/Instance";
import { AxiosError } from "axios";
import { Send } from "lucide-react";

interface LocationState {
  chatId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const HelperChatPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const authContext = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const state = location.state as LocationState;
    const id = state?.chatId;

    if (id) {
      setChatId(id);
      fetchMessages(id);
    } else {
      createNewChat();
    }
  }, [location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = async () => {
    if (
      !authContext ||
      !authContext.user?.user?.id ||
      !authContext.isLoggedIn
    ) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      return;
    }

    try {
      setLoading(true);
      const response = await Api.post("/api/v1/helper/createchat");
      setChatId(response.data.chatId);
    } catch (err: unknown) {
      console.error("Error creating chat:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create chat."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    if (
      !authContext ||
      !authContext.user?.user?.id ||
      !authContext.isLoggedIn
    ) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      return;
    }

    try {
      setLoading(true);
      const response = await Api.get(`/api/v1/helper/messages/${id}`);
      setMessages(response.data.messages || []);
    } catch (err: unknown) {
      console.error("Error fetching messages:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch messages."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatId) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      setLoading(true);
      const response = await Api.post("/api/v1/helper/sendmessage", {
        chatId,
        message: inputMessage,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to send message."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-[calc(100vh-100px)]">
      {loading && messages.length === 0 && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/80 z-[1000] flex justify-center items-center">
          <Loader />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 h-full">
        <div className="hidden lg:block">
          <DancingBot state="idling" className="w-full h-[400px]" />
        </div>

        <div className="flex flex-col h-full bg-[#d3d3d3] rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Helper Chat</h1>
              <Button
                onClick={() => navigate("/applications/helper/HelperMainPage")}
                variant="outline"
                size="sm"
              >
                Back to Main
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Start a conversation by typing a message below.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-[#e66334] text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-gray-300">
            <div className="flex gap-2">
              <TextField
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask the Helper anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-[#e66334] hover:bg-[#FF8234]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperChatPage;
