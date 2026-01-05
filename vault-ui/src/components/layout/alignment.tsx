import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlignmentProps {
  children: React.ReactNode;
  horizontal?: "left" | "center" | "right" | "between" | "around" | "evenly";
  vertical?: "top" | "center" | "bottom" | "stretch";
  direction?: "row" | "column";
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
  className?: string;
}

const horizontalMap = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const verticalMap = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
  stretch: "items-stretch",
};

const gapMap = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

export const Alignment: React.FC<AlignmentProps> = ({
  children,
  horizontal = "left",
  vertical = "center",
  direction = "row",
  gap = 4,
  className,
}) => (
  <div
    className={cn(
      "flex",
      direction === "column" ? "flex-col" : "flex-row",
      horizontalMap[horizontal],
      verticalMap[vertical],
      gapMap[gap],
      className,
    )}
  >
    {children}
  </div>
);

Alignment.displayName = "Alignment";
