"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { Button } from "../button/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { vs } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useToast } from "@/components/ui/use-toast";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  code: string;
  language?: string;
}

export function CodeBlock({
  className,
  code,
  language = "typescript",
  ...props
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  const copyToClipboard = React.useCallback(async () => {
    if (isLoading || isCopied) return;

    try {
      setIsLoading(true);
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast({
        description: "Code copied to clipboard",
        duration: 1500,
      });
    } catch (error) {
      console.error("Failed to copy code:", error);
      toast({
        variant: "destructive",
        description: "Failed to copy code",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    }
  }, [code, isLoading, isCopied, toast]);

  return (
    <div className={cn("overflow-hidden rounded-lg bg-zinc-950", className)}>
      <div className="flex h-11 items-center justify-between border-b border-zinc-800/40 bg-zinc-900/80 px-4">
        <span className="text-sm font-medium text-zinc-400 select-none">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 transition-all duration-200",
            isCopied && "text-green-500",
            !isCopied && "text-zinc-400 hover:text-zinc-200"
          )}
          onClick={copyToClipboard}
          disabled={isLoading || isCopied}
          title="Copy code"
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-xs">Copying...</span>
              </>
            ) : isCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </div>
          <span className="sr-only">
            {isLoading ? "Copying..." : isCopied ? "Copied!" : "Copy code"}
          </span>
        </Button>
      </div>
      <div className="p-4">
        <SyntaxHighlighter
          language={language}
          style={resolvedTheme === "dark" ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            padding: 0,
            fontSize: "0.875rem",
            lineHeight: "1.5",
            background: "transparent",
            fontFamily: "var(--font-mono)",
          }}
          wrapLongLines
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
