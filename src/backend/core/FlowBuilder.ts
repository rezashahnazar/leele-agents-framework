import {
  AnyFlowStep,
  Flow,
  FlowStep,
  ParallelStep,
  ConditionalStep,
  GoalBasedStep,
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

  addStep(step: FlowStep): FlowBuilder {
    this.steps.push({ ...step, type: "sequential" });
    return this;
  }

  parallel(
    name: string,
    description: string,
    execute: (input: any) => Promise<any>,
    items: (outputs: any[]) => any[],
    statusMessage?: string,
    outputProcessor?: (output: any) => string
  ): FlowBuilder {
    const step: ParallelStep = {
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

  conditional(
    name: string,
    description: string,
    condition: (input: any) => Promise<boolean>,
    onTrue: FlowStep[],
    onFalse: FlowStep[],
    statusMessage?: string
  ): FlowBuilder {
    const step: ConditionalStep = {
      name,
      description,
      execute: async (input: any) => {
        const result = await condition(input);
        const steps = result ? onTrue : onFalse;
        let lastOutput = input;
        for (const step of steps) {
          lastOutput = await step.execute(lastOutput);
        }
        return lastOutput;
      },
      type: "conditional",
      condition,
      onTrue,
      onFalse,
      statusMessage,
    };
    this.steps.push(step);
    return this;
  }

  goalBased(
    name: string,
    description: string,
    execute: (input: any) => Promise<any>,
    goalCheck: (result: any) => Promise<boolean>,
    maxAttempts: number,
    statusMessage?: string,
    outputProcessor?: (output: any) => string
  ): FlowBuilder {
    const step: GoalBasedStep = {
      name,
      description,
      execute,
      type: "goal-based",
      goalCheck,
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
