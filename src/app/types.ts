export interface LogMessage {
  type: "status" | "plan" | "result" | "refinement" | "error";
  message: string;
  timestamp?: Date;
}
