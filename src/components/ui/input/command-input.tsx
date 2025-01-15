import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2, SendHorizontal } from "lucide-react";
import { Button } from "../button/button";

const commandInputVariants = cva(
  "flex w-full rounded-lg border bg-background shadow-sm",
  {
    variants: {
      size: {
        default: "min-h-[80px]",
        sm: "min-h-[60px]",
        lg: "min-h-[100px]",
      },
      isStreaming: {
        true: "opacity-50 cursor-not-allowed",
        false: "opacity-100",
      },
    },
    defaultVariants: {
      size: "default",
      isStreaming: false,
    },
  }
);

export interface CommandInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof commandInputVariants> {
  onSend?: (value: string) => void;
  isStreaming?: boolean;
}

export const CommandInput = React.forwardRef<
  HTMLTextAreaElement,
  CommandInputProps
>(({ className, size, isStreaming, onSend, ...props }, ref) => {
  const [value, setValue] = React.useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && onSend && !isStreaming) {
      onSend(value.trim());
      setValue("");
    }
  };

  return (
    <div className={cn(commandInputVariants({ size, isStreaming, className }))}>
      <textarea
        ref={ref}
        className="flex-1 resize-none border-0 bg-transparent p-4 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
        {...props}
      />
      <div className="flex items-end p-4">
        <Button
          size="sm"
          variant={value.trim() ? "default" : "ghost"}
          disabled={!value.trim() || isStreaming}
          onClick={handleSend}
          icon={
            isStreaming ? (
              <Loader2 className="animate-spin" />
            ) : (
              <SendHorizontal />
            )
          }
        >
          Send
        </Button>
      </div>
    </div>
  );
});
CommandInput.displayName = "CommandInput";

export { commandInputVariants };
