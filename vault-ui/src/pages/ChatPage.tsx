import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button/button";
import { TextField } from "@/components/forms";
import { Card } from "@/components/ui/card/card";
import Api from "@/services/Instance";

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

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

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

      // Add bot message with sources and metrics
      const botMessage: ChatMessage = {
        id: Date.now(),
        sender: "bot",
        content: data.answer,
        timestamp: new Date().toLocaleTimeString(),
        sources: data.sources || [],
        performance: data.performance,
      };

      setMessages((prev) => [...prev, botMessage]);
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

    await sendRAGQuery(queryText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-800 text-white px-6 py-4 shadow-md border-b border-slate-700">
        <h1 className="text-2xl font-bold">💬 RAG Chat</h1>
        <p className="text-slate-400 text-sm">
          Ask questions about your knowledge base
        </p>
      </div>

      <div className="max-w-4xl mx-auto mt-6 flex flex-col h-[calc(100vh-140px)] px-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 rounded-lg">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">🔮</div>
                <p className="text-slate-400 text-lg">
                  Ask a question to get started
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-100"
                    } rounded-lg p-4 shadow-md`}
                  >
                    {/* Message Content */}
                    <p className="whitespace-pre-wrap text-sm md:text-base">
                      {msg.content}
                    </p>

                    {/* Timestamp */}
                    <p
                      className={`text-xs mt-2 ${
                        msg.sender === "user"
                          ? "text-blue-200"
                          : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </p>

                    {/* Performance Metrics */}
                    {msg.performance && (
                      <div className="mt-3 pt-3 border-t border-slate-600 text-xs space-y-1">
                        <div className="font-semibold text-slate-300">
                          ⚡ Performance:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            Embedding:{" "}
                            <span className="font-mono">
                              {msg.performance.embedding_ms?.toFixed(0) || 0}
                              ms
                            </span>
                          </div>
                          <div>
                            Search:{" "}
                            <span className="font-mono">
                              {msg.performance.search_ms?.toFixed(0) || 0}ms
                            </span>
                          </div>
                          {msg.performance.rerank_ms && (
                            <div>
                              Rerank:{" "}
                              <span className="font-mono">
                                {msg.performance.rerank_ms.toFixed(0)}ms
                              </span>
                            </div>
                          )}
                          {msg.performance.generation_ms && (
                            <div>
                              Generation:{" "}
                              <span className="font-mono">
                                {msg.performance.generation_ms.toFixed(0)}ms
                              </span>
                            </div>
                          )}
                          <div className="col-span-2 font-bold">
                            Total:{" "}
                            <span className="font-mono">
                              {msg.performance.total_ms?.toFixed(0) || 0}ms
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <div className="font-semibold text-slate-300 text-xs mb-2">
                          📚 Sources:
                        </div>
                        <div className="space-y-2">
                          {msg.sources.map((source) => (
                            <div
                              key={source.index}
                              className={`p-2 rounded text-xs ${
                                msg.sender === "user"
                                  ? "bg-blue-700 bg-opacity-50"
                                  : "bg-slate-600 bg-opacity-50"
                              }`}
                            >
                              <div className="font-semibold flex items-center justify-between">
                                <span>
                                  [{source.index}] {source.source}
                                </span>
                                <span className="text-slate-300">
                                  {(source.score * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="mt-1 text-slate-200 line-clamp-2">
                                {source.content_preview}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-100 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing query...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 bg-slate-800 p-4 rounded-lg border border-slate-700">
          <TextField
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 border-slate-600"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            size="icon"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
