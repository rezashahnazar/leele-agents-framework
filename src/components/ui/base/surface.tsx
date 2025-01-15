import React from "react";
import { useTheme } from "@/lib/theme-context";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: "none" | "low" | "medium" | "high";
  blur?: "none" | "sm" | "md" | "lg";
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function Surface({
  children,
  elevation = "none",
  blur = "none",
  className = "",
  interactive = false,
  onClick,
  ...props
}: SurfaceProps) {
  const { colors, blur: blurValues, opacity } = useTheme();

  const getElevationStyles = () => {
    switch (elevation) {
      case "low":
        return `bg-${opacity.low}`;
      case "medium":
        return `bg-${opacity.medium}`;
      case "high":
        return `bg-${opacity.high}`;
      default:
        return "bg-transparent";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${getElevationStyles()}
        ${blurValues[blur]}
        ${
          interactive
            ? "cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
            : ""
        }
        rounded-xl border border-${colors.border}
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
