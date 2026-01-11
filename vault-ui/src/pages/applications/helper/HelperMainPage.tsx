import React from "react";
import { useNavigate } from "react-router-dom";
import { DancingBot } from "@/components/media/dancing-bot";

const HelperMainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <DancingBot state="greeting" className="w-full max-w-[600px] mx-auto" />

      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-foreground">
            Welcome to <br /> Vault Helper Chat.
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="bg-card text-card-foreground p-5 rounded-lg shadow-md border border-border text-center cursor-pointer transition-transform hover:scale-105 hover:bg-muted/50 w-full max-w-[500px] mx-auto"
            onClick={() => navigate("/applications/helper/HelperChatPage")}
          >
            <h3 className="text-lg font-semibold mb-2">
              Start <br /> a new chat
            </h3>
            <p className="text-sm text-muted-foreground">
              Click here to start a new conversation with the Helper.
            </p>
          </div>

          <div
            className="bg-card text-card-foreground p-5 rounded-lg shadow-md border border-border text-center cursor-pointer transition-transform hover:scale-105 hover:bg-muted/50 w-full max-w-[500px] mx-auto"
            onClick={() => navigate("/applications/helper/HelperPreviousChats")}
          >
            <h3 className="text-lg font-semibold mb-2">Previous chats</h3>
            <p className="text-sm text-muted-foreground">
              Click here to view your chat history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelperMainPage;
