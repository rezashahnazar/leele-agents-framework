import { Message } from "@/app/types";

interface StreamOptions {
  onLog: (log: Omit<Message, "timestamp">) => void;
  onError: (error: string) => void;
}

export function useStreamResponse() {
  const streamResponse = async (
    userPrompt: string,
    { onLog, onError }: StreamOptions
  ) => {
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let partialData = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        partialData += decoder.decode(value, { stream: true });

        const lines = partialData.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].startsWith("data:")) {
            try {
              const json = JSON.parse(
                lines[i].substring("data:".length).trim()
              );
              onLog(json);
            } catch (error) {
              console.warn("Error parsing SSE data:", error);
            }
          }
        }
        partialData = lines[lines.length - 1];
      }
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to connect to the agent"
      );
    }
  };

  return { streamResponse };
}
