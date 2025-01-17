"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block/code-block";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const messageVariants = cva(
  "group relative flex gap-4 p-5 rounded-xl transition-all duration-1000",
  {
    variants: {
      type: {
        status:
          "bg-[hsl(213,60%,98%)] border border-[hsl(213,60%,92%)] dark:bg-[hsl(213,60%,12%)] dark:border-[hsl(213,60%,20%)]",
        plan: "bg-[hsl(265,40%,98%)] border border-[hsl(265,40%,92%)] dark:bg-[hsl(265,40%,12%)] dark:border-[hsl(265,40%,20%)]",
        result:
          "bg-[hsl(145,45%,98%)] border border-[hsl(145,45%,92%)] dark:bg-[hsl(145,45%,12%)] dark:border-[hsl(145,45%,20%)]",
        refinement:
          "bg-[hsl(38,45%,98%)] border border-[hsl(38,45%,92%)] dark:bg-[hsl(38,45%,12%)] dark:border-[hsl(38,45%,20%)]",
        error:
          "bg-[hsl(355,65%,98%)] border border-[hsl(355,65%,92%)] dark:bg-[hsl(355,65%,12%)] dark:border-[hsl(355,65%,20%)]",
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
  total?: number;
  expanded?: boolean;
  onExpand?: () => void;
  isStreaming?: boolean;
  completionReason?: string;
  attempts?: number;
}

export function Message({
  type,
  message,
  timestamp,
  index,
  total,
  expanded,
  onExpand,
  isStreaming,
  completionReason,
  attempts,
}: MessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn(messageVariants({ type }), "relative shadow-sm")}>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          type === "status" &&
            "bg-[hsl(213,60%,92%)] dark:bg-[hsl(213,60%,20%)]",
          type === "plan" && "bg-[hsl(265,40%,92%)] dark:bg-[hsl(265,40%,20%)]",
          type === "result" &&
            "bg-[hsl(145,45%,92%)] dark:bg-[hsl(145,45%,20%)]",
          type === "refinement" &&
            "bg-[hsl(38,45%,92%)] dark:bg-[hsl(38,45%,20%)]",
          type === "error" && "bg-[hsl(355,65%,92%)] dark:bg-[hsl(355,65%,20%)]"
        )}
      >
        <Bot
          className={cn(
            "h-4 w-4",
            type === "status" &&
              "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
            type === "plan" &&
              "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
            type === "result" &&
              "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
            type === "refinement" &&
              "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
            type === "error" &&
              "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
          )}
        />
      </div>

      <div
        className={cn(
          "flex-1 space-y-3 overflow-hidden",
          expanded && "expanded"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-xs font-semibold font-vazirmatn tracking-wide",
              type === "status" &&
                "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
              type === "plan" &&
                "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
              type === "result" &&
                "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
              type === "refinement" &&
                "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
              type === "error" &&
                "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
            )}
          >
            {type === "status" && "وضعیت"}
            {type === "plan" && "برنامه"}
            {type === "result" && "نتیجه"}
            {type === "refinement" && "بهبود"}
            {type === "error" && "خطا"}
          </span>
          {index !== undefined && total !== undefined && (
            <span
              className={cn(
                "text-xs tabular-nums font-medium",
                type === "status" &&
                  "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)] opacity-80",
                type === "plan" &&
                  "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)] opacity-80",
                type === "result" &&
                  "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)] opacity-80",
                type === "refinement" &&
                  "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)] opacity-80",
                type === "error" &&
                  "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)] opacity-80"
              )}
            >
              #{index + 1}/{total}
            </span>
          )}
          {timestamp && (
            <span className="ml-auto text-xs tabular-nums font-medium text-foreground/60">
              {new Date(timestamp).toLocaleTimeString("fa-IR")}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-hidden [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p
                  className={cn(
                    "my-2.5 font-normal font-vazirmatn text-sm leading-relaxed",
                    type === "status" &&
                      "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)] text-opacity-90",
                    type === "plan" &&
                      "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)] text-opacity-90",
                    type === "result" &&
                      "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)] text-opacity-90",
                    type === "refinement" &&
                      "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)] text-opacity-90",
                    type === "error" &&
                      "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)] text-opacity-90"
                  )}
                >
                  {children}
                </p>
              ),
              h1: ({ children }) => (
                <h1
                  className={cn(
                    "mt-6 mb-4 text-2xl font-bold font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
                  )}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  className={cn(
                    "mt-5 mb-3 text-xl font-bold font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
                  )}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  className={cn(
                    "mt-4 mb-2 text-lg font-bold font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
                  )}
                >
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul
                  className={cn(
                    "my-3 list-disc list-inside space-y-2 font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
                  )}
                >
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol
                  className={cn(
                    "my-3 list-decimal list-inside space-y-2 font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
                  )}
                >
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li
                  className={cn(
                    "text-sm leading-relaxed font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,40%)] dark:text-[hsl(213,60%,85%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,45%)] dark:text-[hsl(265,40%,85%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,35%)] dark:text-[hsl(145,45%,85%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,35%)] dark:text-[hsl(38,45%,85%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,40%)] dark:text-[hsl(355,65%,85%)]"
                  )}
                >
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className={cn(
                    "my-3 border-r-2 pr-4 italic font-vazirmatn",
                    type === "status" &&
                      "border-[hsl(213,60%,92%)] dark:border-[hsl(213,60%,20%)]",
                    type === "plan" &&
                      "border-[hsl(265,40%,92%)] dark:border-[hsl(265,40%,20%)]",
                    type === "result" &&
                      "border-[hsl(145,45%,92%)] dark:border-[hsl(145,45%,20%)]",
                    type === "refinement" &&
                      "border-[hsl(38,45%,92%)] dark:border-[hsl(38,45%,20%)]",
                    type === "error" &&
                      "border-[hsl(355,65%,92%)] dark:border-[hsl(355,65%,20%)]"
                  )}
                >
                  {children}
                </blockquote>
              ),
              code: (props) => {
                const { className, children } = props;
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-sm",
                        type === "status" &&
                          "bg-[hsl(213,60%,95%)] dark:bg-[hsl(213,60%,15%)] text-[hsl(213,60%,35%)] dark:text-[hsl(213,60%,90%)]",
                        type === "plan" &&
                          "bg-[hsl(265,40%,95%)] dark:bg-[hsl(265,40%,15%)] text-[hsl(265,40%,40%)] dark:text-[hsl(265,40%,90%)]",
                        type === "result" &&
                          "bg-[hsl(145,45%,95%)] dark:bg-[hsl(145,45%,15%)] text-[hsl(145,45%,30%)] dark:text-[hsl(145,45%,90%)]",
                        type === "refinement" &&
                          "bg-[hsl(38,45%,95%)] dark:bg-[hsl(38,45%,15%)] text-[hsl(38,45%,30%)] dark:text-[hsl(38,45%,90%)]",
                        type === "error" &&
                          "bg-[hsl(355,65%,95%)] dark:bg-[hsl(355,65%,15%)] text-[hsl(355,65%,35%)] dark:text-[hsl(355,65%,90%)]"
                      )}
                    >
                      {children}
                    </code>
                  );
                }

                const language = match ? match[1] : "python";
                const code = String(children).replace(/\n$/, "");

                return (
                  <div
                    className={cn(
                      "my-3 overflow-hidden rounded-lg border",
                      type === "status" &&
                        "border-[hsl(213,60%,92%)] dark:border-[hsl(213,60%,20%)] bg-[hsl(213,60%,97%)] dark:bg-[hsl(213,60%,10%)]",
                      type === "plan" &&
                        "border-[hsl(265,40%,92%)] dark:border-[hsl(265,40%,20%)] bg-[hsl(265,40%,97%)] dark:bg-[hsl(265,40%,10%)]",
                      type === "result" &&
                        "border-[hsl(145,45%,92%)] dark:border-[hsl(145,45%,20%)] bg-[hsl(145,45%,97%)] dark:bg-[hsl(145,45%,10%)]",
                      type === "refinement" &&
                        "border-[hsl(38,45%,92%)] dark:border-[hsl(38,45%,20%)] bg-[hsl(38,45%,97%)] dark:bg-[hsl(38,45%,10%)]",
                      type === "error" &&
                        "border-[hsl(355,65%,92%)] dark:border-[hsl(355,65%,20%)] bg-[hsl(355,65%,97%)] dark:bg-[hsl(355,65%,10%)]"
                    )}
                  >
                    <CodeBlock code={code} language={language} />
                  </div>
                );
              },
              strong: ({ children }) => (
                <strong
                  className={cn(
                    "font-semibold font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,35%)] dark:text-[hsl(213,60%,90%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,40%)] dark:text-[hsl(265,40%,90%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,30%)] dark:text-[hsl(145,45%,90%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,30%)] dark:text-[hsl(38,45%,90%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,35%)] dark:text-[hsl(355,65%,90%)]"
                  )}
                >
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em
                  className={cn(
                    "italic font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,35%)] dark:text-[hsl(213,60%,90%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,40%)] dark:text-[hsl(265,40%,90%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,30%)] dark:text-[hsl(145,45%,90%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,30%)] dark:text-[hsl(38,45%,90%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,35%)] dark:text-[hsl(355,65%,90%)]"
                  )}
                >
                  {children}
                </em>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className={cn(
                    "underline underline-offset-4 hover:no-underline font-vazirmatn",
                    type === "status" &&
                      "text-[hsl(213,60%,35%)] dark:text-[hsl(213,60%,90%)]",
                    type === "plan" &&
                      "text-[hsl(265,40%,40%)] dark:text-[hsl(265,40%,90%)]",
                    type === "result" &&
                      "text-[hsl(145,45%,30%)] dark:text-[hsl(145,45%,90%)]",
                    type === "refinement" &&
                      "text-[hsl(38,45%,30%)] dark:text-[hsl(38,45%,90%)]",
                    type === "error" &&
                      "text-[hsl(355,65%,35%)] dark:text-[hsl(355,65%,90%)]"
                  )}
                >
                  {children}
                </a>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>

        {type !== "status" && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute bottom-3 left-3 h-8 w-8 bg-foreground/5 dark:bg-foreground/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-foreground/80" />
            ) : (
              <Copy className="h-4 w-4 text-foreground/80" />
            )}
          </Button>
        )}
      </div>

      {completionReason && (
        <div
          className={cn(
            "mt-3 pt-3 text-xs border-t",
            type === "status" &&
              "border-[hsl(var(--status-border))] text-[hsl(var(--status-fg))] text-opacity-80",
            type === "plan" &&
              "border-[hsl(var(--plan-border))] text-[hsl(var(--plan-fg))] text-opacity-80",
            type === "result" &&
              "border-[hsl(var(--result-border))] text-[hsl(var(--result-fg))] text-opacity-80",
            type === "refinement" &&
              "border-[hsl(var(--refinement-border))] text-[hsl(var(--refinement-fg))] text-opacity-80",
            type === "error" &&
              "border-[hsl(var(--error-border))] text-[hsl(var(--error-fg))] text-opacity-80"
          )}
        >
          <div className="flex items-center gap-2">
            <span>وضعیت نهایی:</span>
            <span className="font-medium">{completionReason}</span>
            {attempts !== undefined && (
              <span className="mr-auto">تعداد تلاش‌ها: {attempts}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
