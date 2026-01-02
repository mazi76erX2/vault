import React, { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HCIcon } from "generic-components";
import { DancingBot } from "@/components/media/dancing-bot";

interface CollectorPageProps extends PropsWithChildren {
  showContinueButton: boolean;
  botStatus?: string;
  continueLink?: string;
  headline1?: string;
  headline2?: string;
}

const CollectorPageLayout: React.FC<CollectorPageProps> = (props) => {
  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl w-full p-6">
        {/* Dancing Bot */}
        <DancingBot
          state={props.botStatus === "winning" ? "winning" : "greeting"}
          className="w-full max-w-[600px] mx-auto"
        />

        {/* Content Section */}
        <div className="flex flex-col gap-5 max-w-[800px]">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">{props.headline1}</h1>
            <h2 className="text-xl text-gray-600">{props.headline2}</h2>
          </div>

          {/* Form Box */}
          <div className="bg-[#d3d3d3] p-6 rounded-lg shadow-md flex flex-col min-h-[80%]">
            {props.children}
          </div>

          {/* Continue Button */}
          {props.showContinueButton && (
            <div className="flex justify-center gap-12 my-8">
              <Link
                to={
                  props.continueLink ||
                  "/applications/collector/CollectorSummaryPage"
                }
              >
                <Button className="bg-[#e66334] hover:bg-[#FF8234]" size="lg">
                  Continue
                  <HCIcon icon="ArrowRight1" className="ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorPageLayout;
