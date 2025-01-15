import React, { useRef, useEffect, useState } from "react";
import { Surface } from "./base/surface";
import { Text } from "./base/text";
import { Icon } from "./base/icon";
import { useTheme } from "@/lib/theme-context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageContent } from "./message/message-content";

interface MessageProps {
  type: "status" | "plan" | "result" | "refinement" | "error";
  content: string;
  timestamp?: number;
  index: number;
  total: number;
  expanded?: boolean;
  onExpand?: () => void;
}

const typeConfigs = {
  status: {
    icon: "◦",
    color: "neutral",
  },
  plan: {
    icon: "◆",
    color: "blue",
  },
  result: {
    icon: "■",
    color: "emerald",
  },
  refinement: {
    icon: "▲",
    color: "amber",
  },
  error: {
    icon: "●",
    color: "red",
  },
};

export function Message({
  type,
  content,
  timestamp,
  index,
  total,
  expanded = false,
  onExpand,
}: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldShowExpand, setShouldShowExpand] = useState(false);
  const theme = useTheme();
  const config = typeConfigs[type];

  return (
    <Surface
      elevation="low"
      className={`
        group relative
        transition-all duration-75 ease-out
        ${expanded ? "my-2" : "my-1"}
        ${
          type === "error"
            ? "border-l-2 border-red-500/20"
            : type === "result"
            ? "border-l-2 border-emerald-500/20"
            : type === "refinement"
            ? "border-l-2 border-amber-500/20"
            : type === "plan"
            ? "border-l-2 border-blue-500/20"
            : "border-l-2 border-gray-500/20"
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Status Icon */}
          <div
            className={`
              flex items-center justify-center
              w-3 h-3
              font-mono text-[10px]
              ${
                type === "error"
                  ? "text-red-500/70"
                  : type === "result"
                  ? "text-emerald-500/70"
                  : type === "refinement"
                  ? "text-amber-500/70"
                  : type === "plan"
                  ? "text-blue-500/70"
                  : "text-gray-500/70"
              }
            `}
          >
            {config.icon}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-1.5">
            <Text
              size="xs"
              variant="ghost"
              monospace
              className="tabular-nums opacity-50 text-[9px]"
            >
              {new Date(timestamp || Date.now()).toLocaleTimeString()}
            </Text>
            {index === total - 1 && (
              <div
                className={`
                  px-1 py-0.5 text-[8px] font-medium tracking-wide
                  ${
                    theme.theme === "dark"
                      ? "text-emerald-400/70"
                      : "text-emerald-600/70"
                  }
                `}
              >
                •
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className={`
              ml-auto flex items-center gap-0.5
              transition-opacity duration-75
              ${isHovered ? "opacity-100" : "opacity-0"}
            `}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(content);
              }}
              className={`
                px-1.5 py-0.5 rounded-sm text-[8px] font-medium tracking-wide
                transition-colors duration-75
                ${
                  theme.theme === "dark"
                    ? "text-white/40 hover:text-white/90 hover:bg-white/5"
                    : "text-black/40 hover:text-black/90 hover:bg-black/5"
                }
              `}
            >
              copy
            </button>
            {shouldShowExpand && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand?.();
                }}
                className={`
                  px-1.5 py-0.5 rounded-sm text-[8px] font-medium tracking-wide
                  transition-colors duration-75
                  ${
                    theme.theme === "dark"
                      ? "text-white/40 hover:text-white/90 hover:bg-white/5"
                      : "text-black/40 hover:text-black/90 hover:bg-black/5"
                  }
                `}
              >
                {expanded ? "collapse" : "expand"}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <MessageContent
          content={content}
          expanded={expanded}
          onExpand={onExpand}
          theme={theme.theme}
          onShouldExpandChange={setShouldShowExpand}
        />
      </div>
    </Surface>
  );
}
