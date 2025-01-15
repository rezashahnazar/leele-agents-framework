import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageContentProps {
  content: string;
  expanded: boolean;
  onExpand?: () => void;
  theme: "light" | "dark";
  onShouldExpandChange?: (shouldExpand: boolean) => void;
}

export function MessageContent({
  content,
  expanded,
  onExpand = () => {},
  theme,
  onShouldExpandChange,
}: MessageContentProps) {
  const [shouldShowExpand, setShouldShowExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const shouldCollapse = contentRef.current.scrollHeight > 48;
      setShouldShowExpand(shouldCollapse);
      onShouldExpandChange?.(shouldCollapse);
    }
  }, [content, onShouldExpandChange]);

  return (
    <div
      ref={contentRef}
      className={`
        relative
        transition-all duration-75 ease-out
        ${
          shouldShowExpand && !expanded
            ? "max-h-[48px] overflow-hidden cursor-pointer hover:opacity-90"
            : ""
        }
      `}
      onClick={shouldShowExpand ? onExpand : undefined}
    >
      <div className={`prose ${expanded ? "prose-expanded" : ""}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>

      {/* Gradient Fade */}
      {shouldShowExpand && !expanded && (
        <div
          className={`
            absolute inset-x-0 bottom-0
            h-6 pointer-events-none
            bg-gradient-to-t
            ${
              theme === "dark"
                ? "from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent"
                : "from-[rgba(255,255,255,0.9)] via-[rgba(255,255,255,0.7)] to-transparent"
            }
          `}
        />
      )}
    </div>
  );
}
