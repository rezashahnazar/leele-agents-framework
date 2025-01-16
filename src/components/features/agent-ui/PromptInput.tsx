"use client";

import { useState } from "react";
import { useAutoResize } from "@/hooks/useAutoResize";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: PromptInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { textareaRef } = useAutoResize();

  return (
    <div className="w-full bg-background/95 backdrop-blur-lg">
      <div className="p-4 mx-auto">
        <div className="flex gap-3 relative items-end">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative flex items-center bg-background/80 rounded-lg">
              <textarea
                ref={textareaRef}
                id="prompt"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
                placeholder="How can I assist you today?"
                className={cn(
                  "w-full resize-none rounded-lg bg-transparent px-4 py-3 text-sm",
                  "placeholder:text-muted-foreground/60 focus:outline-none",
                  "min-h-[44px] overflow-y-hidden transition-opacity duration-200",
                  "max-h-[200px]",
                  isLoading
                    ? "opacity-50 cursor-wait"
                    : "hover:bg-accent/10 focus:bg-accent/10"
                )}
                rows={1}
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
              />
              {isInputFocused && !isLoading && (
                <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                  <kbd className="rounded bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
                    ⌘
                  </kbd>
                  <kbd className="rounded bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
                    ↵
                  </kbd>
                  <span className="mx-1">to send</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className={`shrink-0 h-[44px] px-4 rounded-lg inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              isLoading
                ? "bg-primary/70 text-primary-foreground/70 cursor-wait"
                : value.trim()
                ? "bg-primary/90 text-primary-foreground hover:bg-primary"
                : "bg-primary/50 text-primary-foreground/50 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent opacity-70" />
                <span className="text-xs animate-pulse">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs">Ask AI</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`transition-transform duration-200 ${
                    value.trim()
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-1 opacity-0"
                  }`}
                >
                  <path
                    d="M1.5 8h13m0 0L8 1.5M14.5 8L8 14.5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
