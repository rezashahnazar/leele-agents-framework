"use client";

import { useCallback } from "react";
import { LogsPanel } from "./LogsPanel";
import { Header } from "./Header";
import { PromptInput } from "./PromptInput";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAgent } from "@/hooks/useAgent";
import { cn } from "@/lib/utils";

interface LeelEAgentUIProps {
  className?: string;
  apiUrl?: string;
}

export default function LeelEAgentUI({ className, apiUrl }: LeelEAgentUIProps) {
  const { theme, toggleTheme } = useTheme();
  const {
    userPrompt,
    setUserPrompt,
    isLoading,
    logs,
    setLogs,
    handleRunAgent,
  } = useAgent(apiUrl);

  const handlePromptChange = useCallback(
    (value: string) => {
      setUserPrompt(value);
    },
    [setUserPrompt]
  );

  useKeyboardShortcuts({
    onClearLogs: () => setLogs([]),
    onFocusPrompt: () => document.getElementById("prompt")?.focus(),
    onToggleTheme: toggleTheme,
  });

  return (
    <div
      className={cn(
        "flex flex-col h-[100dvh] w-full overflow-hidden bg-background/40",
        className
      )}
    >
      <Header theme={theme} onThemeToggle={toggleTheme} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <LogsPanel logs={logs} setLogs={setLogs} isLoading={isLoading} />
        </div>

        <PromptInput
          value={userPrompt}
          onChange={handlePromptChange}
          onSubmit={handleRunAgent}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
