export type AgentMessageType =
  | "status"
  | "plan"
  | "result"
  | "refinement"
  | "evaluation";

export interface AgentMessage {
  type: AgentMessageType;
  message: string;
  messageId?: string;
  isChunk?: boolean;
}

export interface AgentState {
  currentStep: string;
  context: Record<string, any>;
  memory: Array<{
    role: "user" | "agent";
    content: string;
    timestamp: number;
  }>;
  metadata: Record<string, any>;
  currentMessageId?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  defaultContext?: Record<string, any>;
}

export interface AgentEnvironment {
  state: AgentState;
  config: AgentConfig;
  sendMessage: (message: AgentMessage) => Promise<void>;
  sendChunk?: (
    chunk: string,
    messageId: string,
    type: AgentMessageType
  ) => Promise<void>;
}

export interface AgentPolicy {
  decideNextAction(state: AgentState): Promise<string>;
  evaluateAction(action: string, result: any): Promise<number>;
}

export interface AgentAction {
  type: string;
  payload: any;
  execute(environment: AgentEnvironment): Promise<any>;
}

export type AgentObservation = {
  type: string;
  data: any;
  timestamp: number;
};
