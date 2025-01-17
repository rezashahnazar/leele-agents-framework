import { useState, useCallback } from "react";
import { Message, StreamChunk } from "@/app/types";

export function useLogs() {
  const [logs, setLogs] = useState<Message[]>([]);

  const addLog = useCallback((log: Omit<Message, "timestamp">) => {
    setLogs((prev) => [...prev, { ...log, timestamp: new Date() }]);
  }, []);

  const appendChunk = useCallback((chunk: StreamChunk) => {
    setLogs((prev) => {
      const newLogs = [...prev];
      const existingMessageIndex = newLogs.findIndex(
        (log) => log.messageId === chunk.messageId
      );

      if (existingMessageIndex === -1) {
        return [
          ...prev,
          {
            id: chunk.messageId,
            messageId: chunk.messageId,
            type: chunk.chunk.type,
            message: chunk.chunk.content,
            timestamp: new Date(),
            theme: prev[prev.length - 1]?.theme || "light",
          },
        ];
      }

      newLogs[existingMessageIndex] = {
        ...newLogs[existingMessageIndex],
        message: newLogs[existingMessageIndex].message + chunk.chunk.content,
      };

      return newLogs;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, addLog, appendChunk, clearLogs, setLogs };
}
