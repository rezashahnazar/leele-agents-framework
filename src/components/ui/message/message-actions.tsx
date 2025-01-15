import React from "react";
import { Icon } from "../base/icon";

interface MessageActionsProps {
  content: string;
  expanded: boolean;
  isHovered: boolean;
  onCopy: () => void;
  onExpand?: () => void;
  theme: "light" | "dark";
}

export function MessageActions({
  expanded,
  isHovered,
  onCopy,
  onExpand = () => {},
  theme,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Copy Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        className={`
          group
          p-1.5 rounded-md
          transition-colors duration-200
          ${
            theme === "dark"
              ? "hover:bg-white/5 text-white/40 hover:text-white/80"
              : "hover:bg-black/5 text-black/40 hover:text-black/80"
          }
        `}
        title="Copy to clipboard"
      >
        <Icon size="sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="transition-transform duration-200 group-hover:scale-105"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2M15 5h2a2 2 0 012 2v10a2 2 0 01-2 2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2v14H9V5z"
            />
          </svg>
        </Icon>
      </button>

      {/* Expand/Collapse Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className={`
          group
          p-1.5 rounded-md
          transition-colors duration-200
          ${
            theme === "dark"
              ? "hover:bg-white/5 text-white/40 hover:text-white/80"
              : "hover:bg-black/5 text-black/40 hover:text-black/80"
          }
        `}
        title={expanded ? "Collapse" : "Expand"}
      >
        <Icon size="sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="transition-transform duration-200 group-hover:scale-105"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={expanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
            />
          </svg>
        </Icon>
      </button>
    </div>
  );
}
