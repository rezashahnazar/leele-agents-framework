import { Message, StreamChunk } from "@/app/types";

interface StreamOptions {
  onLog: (log: Omit<Message, "timestamp">) => void;
  onChunk: (chunk: StreamChunk) => void;
  onError: (error: string) => void;
}

export function useStreamResponse(apiUrl?: string) {
  const streamResponse = async (
    userPrompt: string,
    { onLog, onChunk, onError }: StreamOptions
  ) => {
    try {
      const response = await fetch(apiUrl || "/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const processBuffer = () => {
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.substring(5).trim());
              if ("chunk" in json) {
                onChunk(json as StreamChunk);
              } else {
                onLog(json);
              }
            } catch (error) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        processBuffer();
      }

      // Process any remaining data
      if (buffer) {
        buffer += decoder.decode(); // Flush the stream
        processBuffer();
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
