import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Send, ArrowRight } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/feedback/loader";
import Api from "@/services/Instance";
import assistantIcon from "@/assets/assistant-icon.png";
import { formatColor, hexToRgba } from "@/utils/colorUtils";

interface ChatThemeSettings {
  userChatBubbleColor: string;
  botChatBubbleColor: string;
  sendButtonAndBox: string;
  font: string;
  logo: string;
  botProfilePicture: string;
  userChatFontColor: string;
  botChatFontColor: string;
}

const defaultThemeSettings: ChatThemeSettings = {
  userChatBubbleColor: "",
  botChatBubbleColor: "",
  sendButtonAndBox: "",
  font: "",
  logo: "",
  botProfilePicture: "",
  userChatFontColor: "",
  botChatFontColor: "",
};

interface ChatMessage {
  id: number;
  text: string;
  sender: string;
}

interface LocationState {
  question?: string;
  sessionId?: string;
  chat_msgId?: number;
  isResume?: boolean;
}

const CollectorChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const authContext = useAuthContext();

  const {
    question,
    sessionId,
    chatMessageId: chatMsgId,
    isResume,
  } = (location.state as LocationState) || {};

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: question ? question : "Welcome! How can I help you today?",
      sender: "bot",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [themeSettings, setThemeSettings] =
    useState<ChatThemeSettings>(defaultThemeSettings);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    async function loadThemeSettings() {
      try {
        if (!authContext?.user?.user?.user?.id) {
          return;
        }
        const userId = authContext.user.user.user.id;
        const response = await Api.post(
          "/api/v1/companies/get_theme_settings",
          {
            user_id: userId,
          }
        );
        if (response.data?.status === "success") {
          const settings = response.data.theme_settings;
          setThemeSettings({
            userChatBubbleColor:
              formatColor(settings.userChatBubbleColor) || "",
            botChatBubbleColor: formatColor(settings.botChatBubbleColor) || "",
            sendButtonAndBox: formatColor(settings.sendButtonAndBox) || "",
            font: settings.font ?? "",
            logo: settings.logo ?? "",
            botProfilePicture: settings.botProfilePicture || "",
            userChatFontColor: formatColor(settings.userChatFontColor) || "",
            botChatFontColor: formatColor(settings.botChatFontColor) || "",
          });
        }
      } catch (err) {
        console.error("Error loading theme settings:", err);
        if (!(err instanceof AxiosError && err.response?.status === 401)) {
          toast.error("Failed to load theme settings.");
        }
      }
    }
    if (authContext?.user?.user?.user?.id) loadThemeSettings();
  }, [authContext?.user]);

  useEffect(() => {
    (async () => {
      try {
        if (!authContext?.user) {
          return;
        }

        if (!sessionId || !isResume) {
          return;
        }

        const response = await Api.post(
          "/api/v1/collector/fetch_chat_conversation",
          { session_id: sessionId }
        );

        const rawData = response.data;
        const fetchedMessages = rawData.messages;

        if (!fetchedMessages) {
          return;
        }

        interface ApiChatMessage {
          role: string;
          content: string;
        }

        const formattedMessages = fetchedMessages
          .filter((m: ApiChatMessage) => m.role !== "system")
          .map((m: ApiChatMessage, index: number) => ({
            id: Date.now() + index,
            text: m.content,
            sender: m.role === "assistant" ? "bot" : m.role,
          }));

        setMessages(formattedMessages);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (!(err instanceof AxiosError && err.response?.status === 401)) {
          toast.error(message);
        }
      }
    })();
  }, [isResume, sessionId, authContext?.user]);

  const generateFollowUpQuestions = async (userAnswer: string) => {
    try {
      if (!authContext?.user) {
        toast.error("User not logged in");
        return;
      }

      const response = await Api.post(
        "/api/v1/collector/generate_question_response",
        {
          chat_prompt_id: chatMsgId,
          user_text: userAnswer,
        }
      );

      if (!response.data || !response.data.follow_up_question) {
        toast.error("Invalid response from the server.");
        return;
      }

      const followUpQuestion = response.data.follow_up_question;
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now() + 1, text: followUpQuestion, sender: "bot" },
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (!(error instanceof AxiosError && error.response?.status === 401)) {
        toast.error(message);
      }
    }
  };

  const handleSendMessage = async () => {
    try {
      if (newMessage.trim() !== "") {
        const message = {
          id: Date.now(),
          text: newMessage,
          sender: "user",
        };
        setLoading(true);
        setMessages([...messages, message]);
        setNewMessage("");
        await generateFollowUpQuestions(message.text);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (!(error instanceof AxiosError && error.response?.status === 401)) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      if (!authContext?.user) {
        toast.error("User not logged in");
        setLoading(false);
        return;
      }

      const response = await Api.post("/api/v1/collector/generate_summary", {
        chat_prompt_id: chatMsgId,
      });

      if (!response.data || !response.data.chat_summary) {
        toast.error("Error generating text.");
        setLoading(false);
        return;
      }

      const generatedSummary = response.data.chat_summary;
      navigate("/applications/collector/CollectorSummaryPage", {
        state: { generatedSummary, sessionId, isResume },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (!(error instanceof AxiosError && error.response?.status === 401)) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!authContext) {
    return <Loader />;
  }

  const botIconSrc = themeSettings.botProfilePicture
    ? themeSettings.botProfilePicture
    : assistantIcon;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-200px)] min-h-[500px] bg-background rounded-lg border border-border">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto flex flex-col gap-3 p-5 scrollbar-thin"
      >
        {messages.map((message) =>
          message.sender === "bot" ? (
            <div
              key={message.id}
              className="self-start p-3 rounded-lg max-w-[70%] flex items-start gap-3 bg-card text-card-foreground border border-border"
              style={{
                backgroundColor: themeSettings.botChatBubbleColor || undefined,
                color: themeSettings.botChatFontColor || undefined,
                fontFamily: themeSettings.font || undefined,
              }}
            >
              <img
                src={botIconSrc}
                alt="AI"
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <span className="whitespace-pre-wrap">{message.text}</span>
            </div>
          ) : (
            <div
              key={message.id}
              className="self-end p-3 rounded-lg max-w-[70%] bg-primary text-primary-foreground"
              style={{
                backgroundColor: themeSettings.userChatBubbleColor || undefined,
                color: themeSettings.userChatFontColor || undefined,
                fontFamily: themeSettings.font || undefined,
              }}
            >
              <span className="whitespace-pre-wrap">{message.text}</span>
            </div>
          )
        )}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-3 items-end">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 min-h-[50px] max-h-[150px] resize-none bg-input text-foreground border-border"
            style={{
              fontFamily: themeSettings.font || undefined,
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === "" || loading}
            size="icon"
            className="h-[50px] w-[50px] flex-shrink-0"
            style={{
              backgroundColor: themeSettings.sendButtonAndBox || undefined,
            }}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-4 p-4 border-t border-border bg-card">
        <Button
          onClick={handleContinue}
          disabled={loading || messages.length <= 1}
          size="lg"
          className="gap-2"
        >
          {loading ? "Summarizing..." : "Finish Chat & Summarize"}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CollectorChatPage;
