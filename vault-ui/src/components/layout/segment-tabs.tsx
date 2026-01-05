import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const SegmentTabs: React.FC<SegmentTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
}) => (
  <Tabs
    defaultValue={defaultValue || tabs[0]?.value}
    value={value}
    onValueChange={onValueChange}
    className={cn("w-full", className)}
  >
    <TabsList className="w-full justify-start">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          disabled={tab.disabled}
          className="flex items-center gap-2"
        >
          {tab.icon}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value}>
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);

SegmentTabs.displayName = "SegmentTabs";
