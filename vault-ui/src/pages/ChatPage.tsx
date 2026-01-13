import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import Api from "@/services/Instance";

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const { selectedQuestion } = (location.state as LocationState) || {};

  useEffect(() => {
    if (selectedQuestion) {
      const initialMessage: ChatMessage = {
        id: Date.now(),
        sender: "Bot",
        content: selectedQuestion.question,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([initialMessage]);

      createNewSession(selectedQuestion.question);
    }
  }, [selectedQuestion]);

  const createNewSession = async (question: string) => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}",
      );
      const userId = currentUser?.user?.id;

      const response = await Api.post("/api/sessions", {
        user_id: userId,
        question,
      });

      if (response.data?.session_id) {
        initializeWebSocket();
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      if (!(error instanceof AxiosError && error.response?.status === 401)) {
        toast.error("Failed to create session");
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeWebSocket = () => {
    // WebSocket initialization placeholder
    // Implement your WebSocket logic here
  };

  useEffect(() => {
    return () => {
      // Cleanup WebSocket on unmount
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const message: ChatMessage = {
      id: Date.now(),
      sender: "You",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground px-6 py-4 shadow-md">
        <h1 className="text-xl font-semibold">Chat Room</h1>
      </div>

      <div className="max-w-3xl mx-auto mt-8 flex flex-col h-[80vh]">
        <div className="flex-1 bg-card text-card-foreground rounded-lg shadow-md border border-border p-4 overflow-y-auto mb-4 scrollbar-thin">
          <ul className="space-y-4">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "You" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === "You"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold block mb-1 ${
                      msg.sender === "You"
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {msg.sender}
                  </span>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {msg.timestamp}
                </span>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <TextField
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
