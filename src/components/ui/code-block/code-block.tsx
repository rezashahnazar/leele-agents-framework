import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { Button } from "../button/button";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

const codeBlockVariants = cva(
  "relative rounded-lg border border-border bg-zinc-900 overflow-hidden",
  {
    variants: {
      size: {
        sm: "text-[10px]",
        default: "text-xs",
        lg: "text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  size?: "default" | "sm" | "lg";
}

export function CodeBlock({
  className,
  code,
  language = "typescript",
  size = "default",
  ...props
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const cleanCode = code
    .trim()
    .replace(/^\s*[\r\n]/gm, "")
    .replace(/[\r\n]\s*$/gm, "");

  return (
    <div className={cn(codeBlockVariants({ size, className }))} {...props}>
      <div className="flex h-7 items-center justify-between border-b border-border px-2">
        <span className="text-[10px] text-muted-foreground">{language}</span>
        <Button
          variant="secondary"
          size="sm"
          className="h-4 px-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          onClick={copyToClipboard}
          icon={
            isCopied ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <Copy className="h-2.5 w-2.5" />
            )
          }
        >
          {isCopied ? "Copied" : ""}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers={false}
        wrapLongLines
        customStyle={{
          margin: 0,
          background: "transparent",
          padding: "1rem",
          fontSize: "inherit",
        }}
        codeTagProps={{
          style: {
            lineHeight: "1.25",
            color: "var(--foreground)",
          },
        }}
      >
        {cleanCode}
      </SyntaxHighlighter>
    </div>
  );
}

export { codeBlockVariants };
