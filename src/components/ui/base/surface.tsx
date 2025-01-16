import React from "react";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: "none" | "low" | "medium" | "high";
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function Surface({
  children,
  elevation = "none",
  className = "",
  interactive = false,
  onClick,
  ...props
}: SurfaceProps) {
  const getElevationStyles = () => {
    switch (elevation) {
      case "low":
        return "bg-black/10 dark:bg-white/10";
      case "medium":
        return "bg-black/20 dark:bg-white/20";
      case "high":
        return "bg-black/30 dark:bg-white/30";
      default:
        return "bg-transparent";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${getElevationStyles()}
        ${
          interactive
            ? "cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
            : ""
        }
        rounded-xl border border-black/10 dark:border-white/10
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
