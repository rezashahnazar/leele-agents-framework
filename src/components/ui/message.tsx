import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block/code-block";

const messageVariants = cva(
  "group relative flex gap-3 p-4 rounded-lg transition-all duration-150",
  {
    variants: {
      type: {
        status:
          "bg-blue-500/5 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
        plan: "bg-purple-500/5 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
        result:
          "bg-green-500/5 dark:bg-green-900/20 text-green-700 dark:text-green-300",
        refinement:
          "bg-yellow-500/5 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
        error: "bg-red-500/5 dark:bg-red-900/20 text-red-700 dark:text-red-300",
      },
    },
    defaultVariants: {
      type: "status",
    },
  }
);

interface MessageProps {
  type: "error" | "status" | "plan" | "result" | "refinement";
  message: string;
  timestamp: number;
  index: number;
  total: number;
  expanded?: boolean;
  onExpand?: () => void;
  onCopy?: () => void;
}

export function Message({
  type,
  message,
  timestamp,
  index,
  total,
  expanded,
  onExpand,
  onCopy,
}: MessageProps) {
  return (
    <div
      className={cn(messageVariants({ type }), "cursor-pointer")}
      onClick={onExpand}
      role="button"
      tabIndex={0}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
        <Bot className="h-4 w-4" />
      </div>

      <div className={cn("flex-1 space-y-2", expanded && "expanded")}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/80">
            {type}
          </span>
          {index !== undefined && total !== undefined && (
            <span className="text-[10px] tabular-nums text-foreground/60">
              #{index + 1}/{total}
            </span>
          )}
          {timestamp && (
            <span className="ml-auto text-[10px] tabular-nums text-foreground/60">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
          {onCopy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="p-1 hover:bg-white/10 rounded-md"
              title="Copy message"
            >
              <svg
                className="w-3 h-3 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="mb-4 last:mb-0 text-foreground/90">{children}</p>
              ),
              code(props) {
                const { className, children } = props;
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code className="rounded-md bg-[#1e1e1e] px-1.5 py-0.5 font-mono text-zinc-200">
                      {children}
                    </code>
                  );
                }

                const language = match ? match[1] : "python";
                const code = String(children).replace(/\n$/, "");

                return (
                  <div className="my-4 first:mt-0 last:mb-0">
                    <CodeBlock code={code} language={language} size="sm" />
                  </div>
                );
              },
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
