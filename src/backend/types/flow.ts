import { AgentMessageType } from "./agent";

export interface FlowContext {
  sendMessage: (
    type: AgentMessageType,
    message: string,
    messageId?: string
  ) => Promise<void>;
  messageId: string;
}

export type FlowExecuteFunction = (
  input: any,
  context: FlowContext
) => Promise<any>;

export interface BaseFlowStep {
  name: string;
  description: string;
  type: string;
  execute: FlowExecuteFunction;
  statusMessage?: string;
  outputProcessor?: (output: any) => any;
}

export interface SequentialFlowStep extends BaseFlowStep {
  type: "sequential";
}

export interface ParallelFlowStep extends BaseFlowStep {
  type: "parallel";
  items: (outputs: any[]) => any[];
}

export interface GoalBasedFlowStep extends BaseFlowStep {
  type: "goal-based";
  evaluator: (result: any, context: FlowContext) => Promise<boolean>;
  maxAttempts: number;
}

export interface ConditionalFlowStep extends BaseFlowStep {
  type: "conditional";
}

export type AnyFlowStep =
  | SequentialFlowStep
  | ParallelFlowStep
  | GoalBasedFlowStep
  | ConditionalFlowStep;

export interface Flow {
  name: string;
  description: string;
  steps: AnyFlowStep[];
  onError?: (error: Error) => Promise<string>;
}
