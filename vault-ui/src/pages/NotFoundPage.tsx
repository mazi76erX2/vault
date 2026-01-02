import React from "react";
import { DancingBot } from "@/components/media/dancing-bot";

const DRAWER_WIDTH = 240;

const NotFoundPage: React.FC = () => {
  return (
    <div
      className="grid gap-5 p-5"
      style={{
        gridTemplateColumns: `${DRAWER_WIDTH}px 1fr`,
      }}
    >
      <div className="flex justify-center items-center">
        <DancingBot state="confusing" className="w-[600px] h-[600px]" />
      </div>

      <div className="flex justify-center items-center">
        <h1 className="text-4xl font-bold text-center">Page not found</h1>
      </div>
    </div>
  );
};

export default NotFoundPage;
