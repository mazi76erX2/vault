import React from "react";
import { DancingBot } from "@/components/media/dancing-bot";

const NotFoundPage: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 min-h-[80vh] items-center">
    <div className="flex justify-center items-center">
      <DancingBot
        state="confusing"
        className="w-full max-w-[600px] h-[600px]"
      />
    </div>

    <div className="flex justify-center items-center">
      <h1 className="text-4xl font-bold text-center text-foreground">
        Page not found
      </h1>
    </div>
  </div>
);

export default NotFoundPage;
