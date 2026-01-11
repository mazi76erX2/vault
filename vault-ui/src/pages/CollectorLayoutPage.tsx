import React, { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DancingBot } from "@/components/media/dancing-bot";

interface CollectorPageProps extends PropsWithChildren {
  showContinueButton: boolean;
  botStatus?: string;
  continueLink?: string;
  headline1?: string;
  headline2?: string;
}

const CollectorPageLayout: React.FC<CollectorPageProps> = (props) => (
  <div className="w-full flex justify-center">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl w-full p-6">
      <DancingBot
        state={props.botStatus === "winning" ? "winning" : "greeting"}
        className="w-full max-w-[600px] mx-auto"
      />

      <div className="flex flex-col gap-5 max-w-[800px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {props.headline1}
          </h1>
          <h2 className="text-xl text-muted-foreground">{props.headline2}</h2>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border flex flex-col min-h-[80%]">
          {props.children}
        </div>

        {props.showContinueButton && (
          <div className="flex justify-center gap-12 my-8">
            <Link
              to={
                props.continueLink ||
                "/applications/collector/CollectorSummaryPage"
              }
            >
              <Button size="lg" className="gap-2">
                Continue
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default CollectorPageLayout;
