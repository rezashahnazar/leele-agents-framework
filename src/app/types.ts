export interface Message {
  id: string;
  type: "status" | "plan" | "result" | "refinement" | "error";
  message: string;
  timestamp: Date;
  theme: "light" | "dark";
  isChunk?: boolean;
  messageId?: string;
}

export interface StreamChunk {
  messageId: string;
  chunk: {
    type: "status" | "plan" | "result" | "refinement" | "error";
    content: string;
  };
}
