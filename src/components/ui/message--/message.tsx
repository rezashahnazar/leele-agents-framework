"use client";

import { useState } from "react";
import { Surface } from "../base/surface";
import { MessageHeader } from "./message-header";
import { MessageContent } from "./message-content";
import { MessageActions } from "./message-actions";

interface MessageProps {
  type: "status" | "plan" | "result" | "refinement" | "error";
  content: string;
  timestamp?: number;
  index: number;
  total: number;
  expanded?: boolean;
  onExpand?: () => void;
  theme: "light" | "dark";
}

export function Message({
  type,
  content,
  timestamp = Date.now(),
  index,
  total,
  expanded = false,
  onExpand,
  theme,
}: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return "from-red-500/10 via-red-500/5 to-transparent";
      case "result":
        return "from-green-500/10 via-green-500/5 to-transparent";
      case "refinement":
        return "from-blue-500/10 via-blue-500/5 to-transparent";
      case "plan":
        return "from-yellow-500/10 via-yellow-500/5 to-transparent";
      default:
        return "from-purple-500/10 via-purple-500/5 to-transparent";
    }
  };

  return (
    <div
      className={`
        group relative
        transform-gpu transition-all duration-300
        ${expanded ? "-mx-2 my-4" : "my-2"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Background Effect */}
      <div
        className={`
          absolute -inset-[1px] rounded-xl
          bg-gradient-to-r ${getTypeStyles()}
          transition-opacity duration-300
          ${isHovered || expanded ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Card Surface */}
      <Surface
        elevation={expanded ? "medium" : isHovered ? "low" : "none"}
        className={`
          relative rounded-lg overflow-hidden
          border border-black/5 dark:border-white/5
          transition-all duration-300
          ${expanded ? "shadow-md" : "shadow-sm"}
          ${expanded ? "scale-[1.01]" : "scale-100"}
          ${theme === "dark" ? "bg-black/40" : "bg-white/40"}
        `}
      >
        <div className="relative p-4">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <MessageHeader
              type={type}
              timestamp={timestamp}
              index={index}
              total={total}
              isHovered={isHovered}
              theme={theme}
            />

            {/* Quick Actions */}
            <div
              className={`
                flex items-center
                transition-opacity duration-300
                ${isHovered ? "opacity-100" : "opacity-0"}
              `}
            >
              <MessageActions
                content={content}
                expanded={expanded}
                onExpand={onExpand}
                onCopy={handleCopy}
                isHovered={isHovered}
                theme={theme}
              />
            </div>
          </div>

          {/* Content Section */}
          <MessageContent
            content={content}
            expanded={expanded}
            onExpand={onExpand}
            theme={theme}
          />
        </div>
      </Surface>
    </div>
  );
}
