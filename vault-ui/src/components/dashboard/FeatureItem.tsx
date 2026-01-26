import React from "react";

interface FeatureItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureItem({ title, description, icon }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
