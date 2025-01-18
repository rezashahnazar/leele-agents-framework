"use client";

import { useState } from "react";
import { useAutoResize } from "@/hooks/useAutoResize";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <div className="w-full bg-background/95 backdrop-blur-md border-t border-border/10">
      <div className="p-5 mx-auto">
        <div className="flex gap-4 relative items-end">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/[0.03] to-secondary/[0.03] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative flex items-center bg-foreground/[0.02] dark:bg-foreground/[0.04] rounded-lg">
              {isInputFocused && !isLoading && (
                <div className="absolute right-4 bottom-3.5 flex items-center gap-2 text-xs text-foreground/50">
                  <span className="mx-1">to send</span>
                  <kbd className="rounded bg-foreground/[0.03] dark:bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-medium">
                    Enter
                  </kbd>
                  <kbd className="rounded bg-foreground/[0.03] dark:bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-medium">
                    ⌘
                  </kbd>
                </div>
              )}
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
                placeholder="How can I help you?"
                className={cn(
                  "w-full resize-none rounded-lg bg-transparent px-5 py-3.5 text-sm",
                  "placeholder:text-foreground/40 focus:outline-none",
                  "min-h-[48px] overflow-y-hidden transition-all duration-200",
                  "max-h-[200px]",
                  isLoading
                    ? "opacity-50 cursor-wait"
                    : "hover:bg-foreground/[0.01] dark:hover:bg-foreground/[0.02] focus:bg-foreground/[0.01] dark:focus:bg-foreground/[0.02]"
                )}
                rows={1}
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className={`shrink-0 h-[48px] px-5 rounded-lg inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              isLoading
                ? "bg-primary/30 text-primary-foreground/40 cursor-wait"
                : value.trim()
                ? "bg-primary/90 text-primary-foreground hover:bg-primary/80"
                : "bg-primary/20 text-primary-foreground/20 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="animate-spin opacity-80">⟳</div>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="text-xs">Send</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
