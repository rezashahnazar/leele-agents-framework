import React from "react";
import { Text } from "../base/text";
import { MessageStatus } from "./message-status";
import { formatDistanceToNow } from "date-fns";

interface MessageHeaderProps {
  type: "status" | "plan" | "result" | "refinement" | "error";
  timestamp: number;
  index: number;
  total: number;
  isHovered: boolean;
  theme: "light" | "dark";
}

export function MessageHeader({
  type,
  timestamp,
  index,
  total,
  isHovered,
  theme,
}: MessageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <MessageStatus type={type} isHovered={isHovered} theme={theme} />

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Text
            size="sm"
            weight="medium"
            className={`
              capitalize
              transition-colors duration-200
              ${theme === "dark" ? "text-white/80" : "text-black/80"}
            `}
          >
            {type}
          </Text>
          <Text
            size="xs"
            variant="ghost"
            monospace
            className={`
              transition-opacity duration-200
              ${isHovered ? "opacity-80" : "opacity-40"}
            `}
          >
            #{index + 1}/{total}
          </Text>
        </div>

        <Text
          size="xs"
          variant="ghost"
          className={`
            transition-opacity duration-200
            ${isHovered ? "opacity-60" : "opacity-30"}
          `}
        >
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </Text>
      </div>
    </div>
  );
}
