import { useState } from "react";
import { Surface } from "./base/surface";
import { MessageHeader } from "./message-sections/message-header";
import { MessageContent } from "./message-sections/message-content";
import { MessageActions } from "./message-sections/message-actions";

interface MessageProps {
  type: "status" | "plan" | "result" | "refinement" | "error";
  content: string;
  timestamp?: number;
  index: number;
  total: number;
  expanded: boolean;
  onExpand: () => void;
  theme: "light" | "dark";
}

export function Message({
  type,
  content,
  timestamp = Date.now(),
  index,
  total,
  expanded,
  onExpand,
  theme,
}: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
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
      <Surface
        elevation={expanded ? "medium" : isHovered ? "low" : "none"}
        className={`
          relative rounded-lg overflow-hidden
          border border-black/5 dark:border-white/5
          transition-all duration-300
          ${expanded ? "shadow-md" : "shadow-sm"}
          ${expanded ? "scale-[1.01]" : "scale-100"}
          ${theme === "dark" ? "bg-[#0C0C0C]/95" : "bg-white/40"}
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
                message={{
                  id: index.toString(),
                  type,
                  message: content,
                  timestamp: new Date(timestamp),
                  theme,
                }}
                expanded={expanded}
                onExpand={onExpand}
                onCopy={handleCopy}
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
