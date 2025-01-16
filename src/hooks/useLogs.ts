import { useState, useCallback } from "react";
import { Message } from "@/app/types";

export function useLogs() {
  const [logs, setLogs] = useState<Message[]>([]);

  const addLog = useCallback((log: Omit<Message, "timestamp">) => {
    setLogs((prev) => [...prev, { ...log, timestamp: new Date() }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs, setLogs };
}
