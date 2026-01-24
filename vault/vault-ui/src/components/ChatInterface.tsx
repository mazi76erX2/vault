import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Activity,
} from "lucide-react";
import {
  sendMessage,
  createSession,
  getHistory,
  Message,
  Source,
  type PerformanceMetrics,
} from "../api/client";
import clsx from "clsx";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        const storedChatId = localStorage.getItem("current_chat_id");
        if (storedChatId) {
          setChatId(storedChatId);
          const history = await getHistory(storedChatId);
          if (history.messages) {
            setMessages(history.messages);
          }
        } else {
          const session = await createSession();
          setChatId(session.chatId);
          localStorage.setItem("current_chat_id", session.chatId);
        }
      } catch (err) {
        console.error("Failed to init session:", err);
        setError(
          "Failed to connect to the assistant. Please check your connection or login.",
        );
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(userMessage.content, chatId);
      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        confidence: response.confidence,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfidence = (confidence?: string) => {
    if (!confidence) return null;

    const config = {
      "High Confidence": { color: "text-green-500", icon: CheckCircle2 },
      "Moderate Confidence": { color: "text-yellow-500", icon: HelpCircle },
      "No Results": { color: "text-red-500", icon: AlertCircle },
      Error: { color: "text-red-500", icon: AlertCircle },
    }[confidence] || { color: "text-gray-500", icon: HelpCircle };

    const Icon = config.icon;

    return (
      <div
        className={clsx(
          "flex items-center gap-1 text-xs font-medium mt-2",
          config.color,
        )}
      >
        <Icon className="w-3 h-3" />
        {confidence}
      </div>
    );
  };

  const renderSources = (sources?: Source[]) => {
    if (!sources || sources.length === 0) return null;

    return (
      <div className="mt-3 border-t border-gray-700/50 pt-3">
        <p className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1">
          <FileText className="w-3 h-3" /> Sources
        </p>
        <div className="flex flex-wrap gap-2">
          {sources.map((source, idx) => (
            <div
              key={idx}
              className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 max-w-[200px] truncate cursor-pointer transition-colors"
              title={source.content}
            >
              {source.title}{" "}
              <span className="text-gray-500 ml-1">
                ({Math.round(source.score * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMetrics = (metrics?: PerformanceMetrics) => {
    if (!metrics) return null;
    return (
      <div className="mt-2 pt-2 border-t border-gray-700/30 flex gap-4 text-[10px] text-gray-500 font-mono">
        <div className="flex items-center gap-1" title="Total Latency">
          <Activity className="w-3 h-3" />
          {Math.round(metrics.total_ms)}ms
        </div>
        {metrics.search_ms > 0 && (
          <span>Search: {Math.round(metrics.search_ms)}ms</span>
        )}
        {metrics.generation_ms && (
          <span>Gen: {Math.round(metrics.generation_ms)}ms</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Vault Assistant</h1>
            <p className="text-xs text-gray-400">RAG Powered Knowledge Base</p>
          </div>
        </div>
        {error && (
          <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <Bot className="w-16 h-16 opacity-20" />
            <p>Start a conversation to search the knowledge base.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex gap-4 max-w-4xl mx-auto",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={clsx(
                "rounded-2xl p-4 max-w-[80%] shadow-md",
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-gray-800 border border-gray-700 rounded-tl-sm",
              )}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
              {msg.role === "assistant" && (
                <>
                  {renderConfidence(msg.confidence)}
                  {renderSources(msg.sources)}
                  {renderMetrics((msg as any).performance)}
                </>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about company policies, documents, etc..."
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">
            Powered by Hybrid RAG (Vector + Keyword) • Python 3.14
          </p>
        </div>
      </div>
    </div>
  );
}
