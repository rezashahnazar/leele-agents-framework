import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LogMessage } from "@/app/types";
import { MessageContent } from "../ui/message-sections/message-content";

interface MessageBoxProps {
  log: LogMessage;
  getMessageIcon: (type: string) => React.ReactNode;
  formatTimestamp: (timestamp?: number) => string;
  theme: "light" | "dark";
  index: number;
  totalMessages: number;
  isLastInGroup: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}

export function MessageBox({
  log,
  getMessageIcon,
  formatTimestamp,
  theme,
  index,
  totalMessages,
  isLastInGroup,
  isExpanded,
  onExpand,
}: MessageBoxProps) {
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setShouldShowExpandButton(contentRef.current.scrollHeight > 16);
    }
  }, [log.message]);

  const getTypeColor = (type: string, isDark = theme === "dark") => {
    const colors = {
      status: {
        light: {
          bg: "bg-blue-500/5",
          text: "text-blue-600",
          border: "border-blue-500/10",
          hover: "hover:bg-blue-500/10",
        },
        dark: {
          bg: "bg-blue-400/5",
          text: "text-blue-400",
          border: "border-blue-400/10",
          hover: "hover:bg-blue-400/10",
        },
      },
      plan: {
        light: {
          bg: "bg-purple-500/5",
          text: "text-purple-600",
          border: "border-purple-500/10",
          hover: "hover:bg-purple-500/10",
        },
        dark: {
          bg: "bg-purple-400/5",
          text: "text-purple-400",
          border: "border-purple-400/10",
          hover: "hover:bg-purple-400/10",
        },
      },
      result: {
        light: {
          bg: "bg-green-500/5",
          text: "text-green-600",
          border: "border-green-500/10",
          hover: "hover:bg-green-500/10",
        },
        dark: {
          bg: "bg-green-400/5",
          text: "text-green-400",
          border: "border-green-400/10",
          hover: "hover:bg-green-400/10",
        },
      },
      refinement: {
        light: {
          bg: "bg-yellow-500/5",
          text: "text-yellow-600",
          border: "border-yellow-500/10",
          hover: "hover:bg-yellow-500/10",
        },
        dark: {
          bg: "bg-yellow-400/5",
          text: "text-yellow-400",
          border: "border-yellow-400/10",
          hover: "hover:bg-yellow-400/10",
        },
      },
      error: {
        light: {
          bg: "bg-red-500/5",
          text: "text-red-600",
          border: "border-red-500/10",
          hover: "hover:bg-red-500/10",
        },
        dark: {
          bg: "bg-red-400/5",
          text: "text-red-400",
          border: "border-red-400/10",
          hover: "hover:bg-red-400/10",
        },
      },
    };

    const defaultColors = {
      light: {
        bg: "bg-gray-500/5",
        text: "text-gray-600",
        border: "border-gray-500/10",
        hover: "hover:bg-gray-500/10",
      },
      dark: {
        bg: "bg-gray-400/5",
        text: "text-gray-400",
        border: "border-gray-400/10",
        hover: "hover:bg-gray-400/10",
      },
    };

    return (colors[type as keyof typeof colors] || defaultColors)[
      isDark ? "dark" : "light"
    ];
  };

  const colors = getTypeColor(log.type);

  return (
    <div
      onClick={() => shouldShowExpandButton && onExpand()}
      className={`
        group relative
        ${colors.bg}
        transition-all duration-150 ease-out
        rounded-lg border-0
        hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
        dark:hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]
        backdrop-blur-[2px]
      `}
    >
      <div className="relative px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${colors.border} opacity-80`}
            />
            <span
              className={`text-[10px] uppercase tracking-wider font-medium ${colors.text} opacity-90`}
            >
              {log.type}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span
              className={`
                font-mono text-[10px]
                transition-colors duration-150
                ${theme === "dark" ? "text-white/40" : "text-black/40"}
              `}
            >
              {formatTimestamp(log.timestamp?.getTime())}
            </span>
            {index === totalMessages - 1 && (
              <span
                className={`
                  px-1.5 py-0.5 rounded-full
                  text-[9px] font-medium tracking-wide
                  transition-colors duration-150
                  ${
                    theme === "dark"
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-emerald-500/10 text-emerald-600"
                  }
                `}
              >
                Active
              </span>
            )}
            <span
              className={`
                font-mono text-[9px] tabular-nums
                transition-colors duration-150
                ${theme === "dark" ? "text-white/30" : "text-black/30"}
              `}
            >
              #{index + 1}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <MessageContent
            content={log.message}
            expanded={isExpanded}
            onExpand={onExpand}
            theme={theme === "dark" ? "dark" : "light"}
          />

          {/* Actions */}
          <div
            className={`
              absolute right-0 -top-1
              opacity-0 group-hover:opacity-100
              transition-all duration-150
              flex items-center gap-0.5
              z-10
            `}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(log.message);
              }}
              className={`
                p-1 rounded-md
                transition-all duration-150
                ${
                  theme === "dark"
                    ? "text-white/40 hover:text-white/90 hover:bg-white/5"
                    : "text-black/40 hover:text-black/90 hover:bg-black/5"
                }
              `}
              title="Copy message"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
