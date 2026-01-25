import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  Sparkles,
  Search,
  Book,
  Zap,
  MessageSquare,
} from "lucide-react";
import { AxiosError } from "axios";
import Api from "@/services/Instance";
import { useTheme } from "@/theme/ThemeContext";

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
  sources?: Source[];
  performance?: PerformanceMetrics;
}

interface Source {
  index: number;
  source: string;
  content_preview: string;
  score: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceMetrics {
  embedding_ms: number;
  search_ms: number;
  rerank_ms?: number;
  generation_ms?: number;
  total_ms: number;
}

interface LocationState {
  selectedQuestion?: {
    question: string;
    [key: string]: unknown;
  };
}

const suggestedQuestions = [
  {
    icon: Search,
    title: "Search Documents",
    description: "Find specific information",
  },
  {
    icon: Sparkles,
    title: "Ask Questions",
    description: "Get AI-powered answers",
  },
  {
    icon: Book,
    title: "Summarize",
    description: "Get document summaries",
  },
  {
    icon: Zap,
    title: "Quick Insights",
    description: "Extract key insights",
  },
];

const ChatPageV2: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { colors } = useTheme();

  const { selectedQuestion } = (location.state as LocationState) || {};

  useEffect(() => {
    if (selectedQuestion) {
      const userMessage: ChatMessage = {
        id: Date.now(),
        sender: "user",
        content: selectedQuestion.question,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([userMessage]);
      setShowSuggestions(false);

      // Auto-send the selected question
      sendRAGQuery(selectedQuestion.question);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendRAGQuery = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await Api.post("/api/v1/rag/ask", {
        query,
        top_k: 5,
        use_query_enhancement: true,
        use_hyde: false,
      });

      const data = response.data;

      const botMessage: ChatMessage = {
        id: Date.now(),
        sender: "bot",
        content: data.answer,
        timestamp: new Date().toLocaleTimeString(),
        sources: data.sources || [],
        performance: data.performance,
      };

      setMessages((prev) => [...prev, botMessage]);
      setShowSuggestions(false);
    } catch (error) {
      let errorMessage = "Failed to process query";
      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.detail || error.message || errorMessage;
      }
      toast.error(errorMessage);
      console.error("RAG query failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = newMessage;
    setNewMessage("");
    setShowSuggestions(false);

    await sendRAGQuery(queryText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
  };

  return (
    <div
      style={{ backgroundColor: colors.background, color: colors.text }}
      className="flex flex-col h-screen transition-colors duration-300"
    >
      {/* Header */}
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AI Chat</h1>
              <p style={{ color: colors.textMuted }} className="text-xs">
                Intelligent search & synthesis
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {messages.length === 0 && showSuggestions ? (
            // Hero Section
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
              <div className="text-center">
                <h2 className="text-4xl font-bold tracking-tight mb-4">
                  Where knowledge begins
                </h2>
                <p
                  style={{ color: colors.textSecondary }}
                  className="text-lg max-w-xl"
                >
                  Search your documents and get instant, cited answers.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedQuestions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        handleSuggestedQuestion(
                          `Help me ${item.title.toLowerCase()}: ${
                            item.description
                          }`,
                        )
                      }
                      className="p-5 rounded-2xl border border-border bg-card text-left hover:border-primary/50 hover:bg-primary/5 transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-surfaceAlt text-primary group-hover:bg-primary/10 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{item.title}</h3>
                          <p
                            style={{ color: colors.textMuted }}
                            className="text-xs mt-1"
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-12 pb-32">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  {msg.sender === "user" ? (
                    // User Message
                    <div className="flex justify-start mb-8">
                      <h3 className="text-3xl font-semibold tracking-tight text-foreground/90">
                        {msg.content}
                      </h3>
                    </div>
                  ) : (
                    // Bot Message
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                        <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                          <Sparkles size={12} className="text-white" />
                        </div>
                        Vault AI
                      </div>

                      <div className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium">
                        {msg.content}
                      </div>

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                          {msg.sources.map((source) => (
                            <div
                              key={source.index}
                              className="flex-shrink-0 w-64 p-4 rounded-xl border border-border bg-surfaceAlt/50 hover:bg-surfaceAlt transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {source.index + 1}
                                </div>
                                <span className="text-xs font-bold truncate">
                                  {source.source}
                                </span>
                              </div>
                              <p
                                style={{ color: colors.textSecondary }}
                                className="text-[11px] line-clamp-2 leading-normal"
                              >
                                {source.content_preview}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Performance Metric - Minimalist */}
                      {msg.performance && (
                        <div className="text-[10px] text-textMuted flex items-center gap-3">
                          <span>
                            Found in {msg.performance.total_ms?.toFixed(0)}ms
                          </span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col gap-4 animate-pulse">
                  <div className="flex items-center gap-2 text-primary/50 font-bold text-sm uppercase tracking-widest">
                    Vault AI is searching...
                  </div>
                  <div className="h-4 bg-surfaceAlt rounded-full w-3/4" />
                  <div className="h-4 bg-surfaceAlt rounded-full w-1/2" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Floating Modern */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <div className="max-w-3xl mx-auto px-6 pb-10">
          <div className="bg-card border border-border shadow-2xl rounded-[32px] p-2 pointer-events-auto flex items-center gap-2 backdrop-blur-xl">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a follow-up..."
              disabled={isLoading}
              className="flex-1 bg-transparent px-6 py-4 outline-none text-base placeholder-textMuted disabled:opacity-50"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all active:scale-90"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPageV2;
