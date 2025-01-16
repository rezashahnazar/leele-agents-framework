export type ThemeMode = "light" | "dark" | "system";

export interface Message {
  id: string;
  type: MessageType;
  message: string;
  timestamp: Date;
}

export type MessageType = "status" | "plan" | "result" | "refinement" | "error";

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}
