import React, { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";

interface CollectorPageProps extends PropsWithChildren {
  showContinueButton: boolean;
  botStatus?: string;
  continueLink?: string;
  headline1?: string;
  headline2?: string;
}

const CollectorPageLayout: React.FC<CollectorPageProps> = (props) => (
  <div className="w-full flex justify-center py-8">
    <div className="max-w-4xl w-full p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          {props.headline1}
        </h1>
        {props.headline2 && (
          <h2 className="text-xl text-muted-foreground mt-2">
            {props.headline2}
          </h2>
        )}
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border min-h-[400px]">
        {props.children}
      </div>

      {props.showContinueButton && (
        <div className="flex justify-center my-8">
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
);

export default CollectorPageLayout;
