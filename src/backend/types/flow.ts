export type FlowStepType =
  | "sequential"
  | "parallel"
  | "conditional"
  | "goal-based";

export type FlowStep = {
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
  type: FlowStepType;
  statusMessage?: string;
  outputProcessor?: (output: any) => string;
};

export type ParallelStep = FlowStep & {
  type: "parallel";
  items: (outputs: any[]) => any[];
};

export type ConditionalStep = FlowStep & {
  type: "conditional";
  condition: (input: any) => Promise<boolean>;
  onTrue: FlowStep[];
  onFalse: FlowStep[];
};

export type GoalBasedStep = FlowStep & {
  type: "goal-based";
  goalCheck: (result: any) => Promise<boolean>;
  maxAttempts: number;
};

export type AnyFlowStep =
  | FlowStep
  | ParallelStep
  | ConditionalStep
  | GoalBasedStep;

export type Flow = {
  name: string;
  description: string;
  steps: AnyFlowStep[];
  onError?: (error: Error) => Promise<string>;
};
