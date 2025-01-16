import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageSkeleton() {
  return (
    <div className="group relative flex gap-3 p-4 rounded-lg transition-all duration-1000 bg-muted/80 border border-muted animate-pulse">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 dark:bg-white/10">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded-full bg-muted"></div>
          <div className="h-4 w-8 rounded-full bg-muted"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-[80%] rounded bg-muted"></div>
          <div className="h-4 w-[60%] rounded bg-muted"></div>
        </div>
      </div>
    </div>
  );
}
