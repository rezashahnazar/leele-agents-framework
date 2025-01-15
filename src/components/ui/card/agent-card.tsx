import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Typography } from "../typography/typography";
import { Bot, Circle } from "lucide-react";

const agentCardVariants = cva(
  "relative rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
  {
    variants: {
      status: {
        online: "border-primary/20",
        offline: "border-muted",
        busy: "border-yellow-500/20",
        error: "border-destructive/20",
      },
    },
    defaultVariants: {
      status: "offline",
    },
  }
);

const statusIndicatorVariants = cva(
  "absolute right-4 top-4 flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      status: {
        online: "bg-primary/10 text-primary",
        offline: "bg-muted text-muted-foreground",
        busy: "bg-yellow-500/10 text-yellow-500",
        error: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      status: "offline",
    },
  }
);

export interface AgentCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof agentCardVariants> {
  name: string;
  description?: string;
  capabilities?: string[];
  status?: "online" | "offline" | "busy" | "error";
}

export function AgentCard({
  className,
  name,
  description,
  capabilities,
  status = "offline",
  ...props
}: AgentCardProps) {
  return (
    <div className={cn(agentCardVariants({ status, className }))} {...props}>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Typography variant="large">{name}</Typography>
          {description && (
            <Typography variant="small" className="text-muted-foreground">
              {description}
            </Typography>
          )}
        </div>
      </div>

      <div className={cn(statusIndicatorVariants({ status }))}>
        <Circle className="h-2 w-2 fill-current" />
        <span>{status}</span>
      </div>

      {capabilities && capabilities.length > 0 && (
        <div className="mt-4">
          <Typography variant="small" className="mb-2 text-muted-foreground">
            Capabilities
          </Typography>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className="rounded-full bg-secondary px-2 py-1 text-xs font-medium"
              >
                {capability}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { agentCardVariants, statusIndicatorVariants };
