import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SegmentTabItem {
  label: string;
  value: string;
  render(): React.ReactNode;
}

export interface SegmentTabProps {
  items: SegmentTabItem[];
  defaultValue?: string;
  actions?: React.ReactNode;
}

export function SegmentTab({ items, defaultValue, actions }: SegmentTabProps) {
  const defaultTab = defaultValue || items[0]?.value || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Tabs defaultValue={defaultTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="uppercase"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {items.map((item) => (
            <TabsContent key={item.value} value={item.value} className="mt-0">
              {item.render()}
            </TabsContent>
          ))}
        </Tabs>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
