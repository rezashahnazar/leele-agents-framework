import React from "react";

interface PanelProps {
  children: React.ReactNode;
  theme: "light" | "dark";
}

export function Panel({ children, theme }: PanelProps) {
  return (
    <div
      className={`relative transition-all duration-500 rounded-2xl flex flex-col min-h-0 ${
        theme === "dark"
          ? "bg-white/5 backdrop-blur-xl border border-white/10"
          : "bg-black/5 backdrop-blur-xl border border-black/5"
      }`}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  children: React.ReactNode;
  theme: "light" | "dark";
}

export function PanelHeader({ children, theme }: PanelHeaderProps) {
  return (
    <div
      className={`px-4 py-3 border-b transition-colors duration-300 ${
        theme === "dark" ? "border-white/5" : "border-black/5"
      } sticky top-0 backdrop-blur-sm z-30 flex-shrink-0`}
    >
      {children}
    </div>
  );
}

interface PanelContentProps {
  children: React.ReactNode;
}

export function PanelContent({ children }: PanelContentProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {children}
    </div>
  );
}
