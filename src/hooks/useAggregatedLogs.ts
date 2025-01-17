import { useMemo } from "react";
import { Message } from "@/app/types";

export function useAggregatedLogs(logs: Message[]) {
  return useMemo(() => {
    const messageMap = new Map<string, Message>();

    for (const log of logs) {
      if (!log.messageId) {
        messageMap.set(log.id, log);
        continue;
      }

      const existingMessage = messageMap.get(log.messageId);
      if (existingMessage) {
        // Always append for the same type, replace for different type
        messageMap.set(log.messageId, {
          ...existingMessage,
          message:
            existingMessage.type === log.type
              ? existingMessage.message + log.message
              : log.message,
          type: log.type, // Update type in case it changed
          // Keep the original timestamp for stability
          timestamp: existingMessage.timestamp,
        });
      } else {
        // Create new message
        messageMap.set(log.messageId, {
          ...log,
          id: log.messageId, // Use messageId as the stable id
        });
      }
    }

    // Sort only once at the end
    return Array.from(messageMap.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }, [logs]);
}
