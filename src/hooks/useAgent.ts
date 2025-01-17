import { useState, useCallback } from "react";
import { useStreamResponse } from "./useStreamResponse";
import { useLogs } from "./useLogs";
import { useTheme } from "./useTheme";

export function useAgent(apiUrl?: string) {
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const { logs, addLog, appendChunk, clearLogs, setLogs } = useLogs();
  const { streamResponse } = useStreamResponse(apiUrl);

  const handleRunAgent = useCallback(async () => {
    if (!userPrompt.trim() || isLoading) return;

    try {
      clearLogs();
      setIsLoading(true);

      await streamResponse(userPrompt, {
        onLog: (log) => addLog({ ...log, theme }),
        onChunk: (chunk) => appendChunk(chunk),
        onError: (message) =>
          addLog({
            id: crypto.randomUUID(),
            type: "error",
            message,
            theme,
          }),
      });
    } catch (error) {
      console.error("Error running agent:", error);
      addLog({
        id: crypto.randomUUID(),
        type: "error",
        message: "An unexpected error occurred while running the agent.",
        theme,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    userPrompt,
    isLoading,
    theme,
    clearLogs,
    addLog,
    appendChunk,
    streamResponse,
  ]);

  return {
    userPrompt,
    setUserPrompt,
    isLoading,
    logs,
    setLogs,
    handleRunAgent,
  };
}
