import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Send, FileText, TrendingUp } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/feedback/loader";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import Api from "@/services/Instance";

interface LocationState {
  chatId?: string;
}

interface Source {
  title: string;
  score: number;
  id: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  confidence?: string;
  sources?: Source[];
}

const HelperChatPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
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
      fetchChat(id);
    } else {
      createNewChat();
    }
  }, [location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = async () => {
    if (!authContext || !authContext.user?.id || !authContext.isLoggedIn) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      return;
    }

    try {
      setLoading(true);
      const userId = authContext.user.id;

      const response = await Api.post("/api/v1/helper/addnewchatsession", {
        userId: userId,
        topic: "General Inquiry",
      });

      if (response.data?.helperchatid || response.data?.chatId) {
        const newChatId = response.data.helperchatid || response.data.chatId;
        setChatId(newChatId);
        toast.success("New chat session created!");
      } else {
        toast.error("Failed to create chat session");
      }
    } catch (err: unknown) {
      console.error("Error creating chat:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create chat.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async (id: string) => {
    if (!authContext || !authContext.user?.id || !authContext.isLoggedIn) {
      if (!authContext?.isLoadingUser) {
        toast.error("User not authenticated or session has expired.");
      }
      return;
    }

    try {
      setLoading(true);

      // Try the new endpoint first
      try {
        const response = await Api.get(`/api/v1/helper/getchat/${id}`);

        if (response.data?.messages) {
          const transformedMessages = response.data.messages.map(
            (msg: any, index: number) => ({
              id: `${id}-${index}`,
              role: msg.role,
              content: msg.content,
              timestamp: response.data.created_at || new Date().toISOString(),
              confidence: msg.confidence,
              sources: msg.sources,
            }),
          );
          setMessages(transformedMessages);
        }
      } catch {
        // Fallback to old endpoint
        const response = await Api.post("/api/v1/helper/gethelperchatmessage", {
          chatId: id,
        });

        if (response.data?.message) {
          // Transform old format to new format
          const oldMessages = Array.isArray(response.data.message)
            ? response.data.message
            : [];

          const transformedMessages = oldMessages.map(
            (msg: any, index: number) => ({
              id: `${id}-${index}`,
              role: msg.role || "assistant",
              content: msg.content || msg.text || "",
              timestamp: new Date().toISOString(),
            }),
          );

          setMessages(transformedMessages);
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching chat:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch chat.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    // FIX: Better validation
    const messageToSend = inputMessage?.trim();

    if (!messageToSend) {
      toast.warning("Please enter a message");
      return;
    }

    if (!chatId) {
      toast.error("No active chat session");
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);

    // Clear input AFTER capturing the message
    setInputMessage("");
    setIsTyping(true);

    try {
      setLoading(true);

      // Try new RAG endpoint first
      try {
        const response = await Api.post("/api/v1/helper/sendmessage", {
          chatId: chatId,
          message: messageToSend,
        });

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.data.response || response.data.helperresponse,
          timestamp: new Date().toISOString(),
          confidence: response.data.confidence,
          sources: response.data.sources || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (response.data.retrievedDocs > 0) {
          toast.success(
            `Found ${response.data.retrievedDocs} relevant document(s)`,
          );
        }
      } catch (err) {
        // Fallback to old endpoint
        const response = await Api.post(
          "/api/v1/helper/generateanswerresponse",
          {
            userId: authContext?.user?.id,
            userText: messageToSend,
            chatId: chatId,
          },
        );

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.data.helperresponse || response.data.response,
          timestamp: new Date().toISOString(),
          confidence: response.data.confidence,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: unknown) {
      console.error("Error sending message:", err);

      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
        confidence: "Error",
      };
      setMessages((prev) => [...prev, errorMessage]);

      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error(
          err instanceof Error ? err.message : "Failed to send message.",
        );
      }
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const getConfidenceBadgeStyle = (confidence?: string) => {
    switch (confidence) {
      case "High Confidence":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30";
      case "Moderate Confidence":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30";
      case "No Results":
        return "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30";
      case "Error":
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30";
    }
  };

  return (
    <div className="relative h-[calc(100vh-100px)]">
      {loading && messages.length === 0 && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="flex flex-col h-full bg-card text-card-foreground rounded-lg shadow-md border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Helper Chat
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Powered by RAG & AI
              </p>
            </div>
            <Button
              onClick={() => navigate("/applications/helper/HelperMainPage")}
              variant="outline"
              size="sm"
            >
              Back to Main
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl">💬</div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Start a conversation
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ask questions about your company's documents and knowledge
                  base
                </p>
              </div>
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
                className={`max-w-[75%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {/* Message Content */}
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>

                {/* Confidence Badge */}
                {message.confidence && message.role === "assistant" && (
                  <div className="mt-3 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getConfidenceBadgeStyle(
                        message.confidence,
                      )}`}
                    >
                      {message.confidence}
                    </span>
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Sources ({message.sources.length})
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <li
                          key={source.id}
                          className="text-xs flex items-start gap-2 bg-background/50 p-2 rounded"
                        >
                          <span className="text-muted-foreground font-mono">
                            {idx + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {source.title}
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              Relevance: {(source.score * 100).toFixed(0)}%
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-xs opacity-60 mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground border border-border rounded-lg p-4 max-w-[75%]">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Searching knowledge base...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-border bg-background/50">
          <div className="flex gap-2">
            <VoiceRecorder
              chatId={chatId || ""}
              onTranscription={(text) => {
                setInputMessage(text);
                // Optionally auto-send
                // handleSendMessage();
              }}
            />
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
              disabled={loading || !inputMessage?.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelperChatPage;
