import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  AlertCircle,
  Moon,
  Sun,
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
  const { mode, colors, toggleTheme } = useTheme();

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
      <header
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="border-b backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ color: colors.primary }}
              className="text-2xl font-bold"
            >
              🔮
            </div>
            <div>
              <h1 className="text-xl font-bold">Vault RAG</h1>
              <p style={{ color: colors.textMuted }} className="text-xs">
                AI-powered document search
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: colors.primaryLight,
              color: colors.text,
            }}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            title="Toggle theme"
          >
            {mode === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 && showSuggestions ? (
            // Hero Section
            <div className="flex flex-col items-center justify-center min-h-full gap-12 py-20">
              {/* Illustration Placeholder */}
              <div
                className="flex items-center justify-center w-48 h-48 rounded-full"
                style={{ backgroundColor: colors.surface }}
              >
                <div style={{ color: colors.primary }} className="text-6xl">
                  📚
                </div>
              </div>

              <div className="text-center max-w-2xl">
                <h2 className="text-4xl font-bold mb-4">
                  Welcome to Vault RAG
                </h2>
                <p
                  style={{ color: colors.textSecondary }}
                  className="text-lg mb-8"
                >
                  Ask questions about your documents and get instant, accurate
                  answers powered by AI and intelligent search.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedQuestions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        handleSuggestedQuestion(
                          `Help me ${item.title.toLowerCase()}: ${item.description}`,
                        )
                      }
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                      className="p-4 rounded-lg border text-left hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          style={{ color: colors.primary }}
                          className="w-6 h-6 flex-shrink-0 mt-1"
                        />
                        <div>
                          <h3 className="font-semibold text-sm">
                            {item.title}
                          </h3>
                          <p
                            style={{ color: colors.textMuted }}
                            className="text-xs"
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
            <div className="space-y-6 py-4">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.sender === "user" ? (
                    // User Message
                    <div className="flex justify-end mb-4">
                      <div
                        style={{
                          backgroundColor: colors.primary,
                          color: "#ffffff",
                        }}
                        className="max-w-2xl rounded-2xl px-6 py-4 shadow-lg"
                      >
                        <p className="text-base">{msg.content}</p>
                        <p
                          style={{ color: "rgba(255,255,255,0.7)" }}
                          className="text-xs mt-2"
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Bot Message
                    <div className="flex justify-start mb-4">
                      <div
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        }}
                        className="max-w-2xl rounded-2xl px-6 py-4 border shadow-lg"
                      >
                        {/* Answer */}
                        <p className="text-base leading-relaxed mb-4">
                          {msg.content}
                        </p>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div
                            className="mt-4 pt-4 border-t"
                            style={{ borderColor: colors.border }}
                          >
                            <h4
                              style={{ color: colors.primary }}
                              className="text-xs font-semibold mb-3 uppercase tracking-wide"
                            >
                              📌 Sources
                            </h4>
                            <div className="space-y-2">
                              {msg.sources.map((source) => (
                                <div
                                  key={source.index}
                                  style={{
                                    backgroundColor: colors.surfaceAlt,
                                    borderColor: colors.borderLight,
                                  }}
                                  className="p-3 rounded-lg border text-xs"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold truncate">
                                      {source.source}
                                    </span>
                                    <span
                                      style={{ color: colors.primary }}
                                      className="font-bold"
                                    >
                                      {(source.score * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <p
                                    style={{ color: colors.textSecondary }}
                                    className="line-clamp-2"
                                  >
                                    {source.content_preview}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Performance Metrics */}
                        {msg.performance && (
                          <div
                            className="mt-4 pt-4 border-t"
                            style={{ borderColor: colors.border }}
                          >
                            <h4
                              style={{ color: colors.primary }}
                              className="text-xs font-semibold mb-3 uppercase tracking-wide"
                            >
                              ⚡ Performance
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span style={{ color: colors.textMuted }}>
                                  Embedding
                                </span>
                                <div className="font-mono font-bold">
                                  {msg.performance.embedding_ms?.toFixed(0) ||
                                    0}
                                  ms
                                </div>
                              </div>
                              <div>
                                <span style={{ color: colors.textMuted }}>
                                  Search
                                </span>
                                <div className="font-mono font-bold">
                                  {msg.performance.search_ms?.toFixed(0) || 0}
                                  ms
                                </div>
                              </div>
                              {msg.performance.rerank_ms && (
                                <div>
                                  <span style={{ color: colors.textMuted }}>
                                    Rerank
                                  </span>
                                  <div className="font-mono font-bold">
                                    {msg.performance.rerank_ms.toFixed(0)}ms
                                  </div>
                                </div>
                              )}
                              {msg.performance.generation_ms && (
                                <div>
                                  <span style={{ color: colors.textMuted }}>
                                    Generation
                                  </span>
                                  <div className="font-mono font-bold">
                                    {msg.performance.generation_ms.toFixed(0)}
                                    ms
                                  </div>
                                </div>
                              )}
                              <div className="col-span-2">
                                <span style={{ color: colors.textMuted }}>
                                  Total
                                </span>
                                <div
                                  style={{ color: colors.primary }}
                                  className="font-mono font-bold text-base"
                                >
                                  {msg.performance.total_ms?.toFixed(0) || 0}
                                  ms
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <p
                          style={{ color: colors.textMuted }}
                          className="text-xs mt-4"
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                    className="rounded-2xl px-6 py-4 border flex items-center gap-2"
                  >
                    <Loader2
                      style={{ color: colors.primary }}
                      className="w-4 h-4 animate-spin"
                    />
                    <span style={{ color: colors.textSecondary }}>
                      Searching and thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        }}
        className="border-t sticky bottom-0 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            }}
            className="flex items-center gap-3 rounded-2xl border p-2 hover:shadow-lg transition-shadow"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about your documents..."
              disabled={isLoading}
              style={{
                backgroundColor: colors.surfaceAlt,
                color: colors.text,
              }}
              className="flex-1 bg-transparent px-4 py-3 outline-none placeholder-gray-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              style={{
                backgroundColor: colors.primary,
                color: "#ffffff",
              }}
              className="p-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <p
            style={{ color: colors.textMuted }}
            className="text-xs text-center mt-3"
          >
            Vault RAG uses AI to search and answer questions. Always verify
            important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPageV2;
