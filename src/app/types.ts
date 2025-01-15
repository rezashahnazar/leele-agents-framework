export interface Message {
  id: string;
  type: "status" | "plan" | "result" | "refinement" | "error";
  message: string;
  timestamp: Date;
  theme: "light" | "dark";
}
