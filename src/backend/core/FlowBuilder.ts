import {
  AnyFlowStep,
  Flow,
  FlowExecuteFunction,
  FlowContext,
} from "../types/flow";

export class FlowBuilder {
  private steps: AnyFlowStep[] = [];
  private flowName: string = "";
  private flowDescription: string = "";
  private errorHandler?: (error: Error) => Promise<string>;

  name(name: string): FlowBuilder {
    this.flowName = name;
    return this;
  }

  description(description: string): FlowBuilder {
    this.flowDescription = description;
    return this;
  }

  addStep(
    step: Omit<AnyFlowStep, "type"> & { type: "sequential" }
  ): FlowBuilder {
    this.steps.push(step);
    return this;
  }

  parallel(
    name: string,
    description: string,
    execute: FlowExecuteFunction,
    items: (outputs: any[]) => any[],
    statusMessage?: string,
    outputProcessor?: (output: any) => any
  ): FlowBuilder {
    const step: AnyFlowStep = {
      name,
      description,
      execute,
      type: "parallel",
      items,
      statusMessage,
      outputProcessor,
    };
    this.steps.push(step);
    return this;
  }

  goalBased(
    name: string,
    description: string,
    execute: FlowExecuteFunction,
    evaluator: (result: any, context: FlowContext) => Promise<boolean>,
    maxAttempts: number,
    statusMessage?: string,
    outputProcessor?: (output: any) => any
  ): FlowBuilder {
    const step: AnyFlowStep = {
      name,
      description,
      execute,
      type: "goal-based",
      evaluator,
      maxAttempts,
      statusMessage,
      outputProcessor,
    };
    this.steps.push(step);
    return this;
  }

  onError(handler: (error: Error) => Promise<string>): FlowBuilder {
    this.errorHandler = handler;
    return this;
  }

  build(): Flow {
    if (!this.flowName) throw new Error("Flow name is required");
    if (!this.flowDescription) throw new Error("Flow description is required");

    return {
      name: this.flowName,
      description: this.flowDescription,
      steps: this.steps,
      onError: this.errorHandler,
    };
  }
}
