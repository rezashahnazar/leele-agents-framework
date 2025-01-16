export interface Message {
  id: string;
  type: MessageType;
  message: string;
  timestamp: Date;
  theme: ThemeMode;
}

export type MessageType = "status" | "plan" | "result" | "refinement" | "error";
export type ThemeMode = "light" | "dark";
