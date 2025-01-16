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
          "bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 border border-blue-500/20 dark:border-blue-500/30",
        plan: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border border-purple-500/20 dark:border-purple-500/30",
        result:
          "bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-200 border border-green-500/20 dark:border-green-500/30",
        refinement:
          "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-200 border border-yellow-500/20 dark:border-yellow-500/30",
        error:
          "bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-200 border border-red-500/20 dark:border-red-500/30",
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
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 dark:bg-white/10">
        <Bot className="h-4 w-4" />
      </div>

      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden",
          expanded && "expanded"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              type === "status" && "text-blue-700 dark:text-blue-300",
              type === "plan" && "text-purple-700 dark:text-purple-300",
              type === "result" && "text-green-700 dark:text-green-300",
              type === "refinement" && "text-yellow-700 dark:text-yellow-300",
              type === "error" && "text-red-700 dark:text-red-300"
            )}
          >
            {type}
          </span>
          {index !== undefined && total !== undefined && (
            <span
              className={cn(
                "text-[10px] tabular-nums",
                type === "status" && "text-blue-600/80 dark:text-blue-300/80",
                type === "plan" && "text-purple-600/80 dark:text-purple-300/80",
                type === "result" && "text-green-600/80 dark:text-green-300/80",
                type === "refinement" &&
                  "text-yellow-600/80 dark:text-yellow-300/80",
                type === "error" && "text-red-600/80 dark:text-red-300/80"
              )}
            >
              #{index + 1}/{total}
            </span>
          )}
          {timestamp && (
            <span className="ml-auto text-[10px] tabular-nums text-foreground/30">
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
                className="w-2.5 h-2.5 opacity-30 hover:opacity-50 transition-opacity"
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

        <div className="prose prose-sm dark:prose-invert max-w-none overflow-hidden [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="my-1.5 text-foreground/90 text-sm leading-relaxed">
                  {children}
                </p>
              ),
              h1: ({ children }) => (
                <h1 className="text-lg font-bold tracking-tight mt-3 mb-2 text-foreground">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-semibold tracking-tight mt-3 mb-1.5 text-foreground">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold tracking-tight mt-2 mb-1.5 text-foreground">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="my-1.5 ml-1 list-disc [&>li]:mt-1 marker:text-foreground/50">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-1.5 ml-1 list-decimal [&>li]:mt-1 marker:text-foreground/50">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-foreground/90 pl-1">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-2 border-l-2 border-foreground/20 pl-1.5 italic text-foreground/80 text-sm">
                  {children}
                </blockquote>
              ),
              code(props) {
                const { className, children } = props;
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code className="rounded-md bg-primary/10 dark:bg-primary/20 px-1 py-0.5 font-mono text-xs text-primary dark:text-primary/90">
                      {children}
                    </code>
                  );
                }

                const language = match ? match[1] : "python";
                const code = String(children).replace(/\n$/, "");

                return (
                  <div className="my-2 overflow-hidden rounded-lg border border-foreground/10">
                    <CodeBlock code={code} language={language} />
                  </div>
                );
              },
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-foreground/90">{children}</em>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  {children}
                </a>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
