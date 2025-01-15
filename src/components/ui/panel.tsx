import React from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl flex flex-col min-h-0 bg-background/50 border border-border/50 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PanelHeader({
  children,
  className,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "px-2 py-2 border-b border-border/50 bg-background/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface PanelContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PanelContent({
  children,
  className,
  ...props
}: PanelContentProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-auto bg-background/50 rounded-b-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
