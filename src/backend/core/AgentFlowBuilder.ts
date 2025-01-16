import { AgentBehavior, AgentFlow, AgentStep } from "./AgentExecutor";
import { AgentMessageType } from "../types/agent";

export class AgentFlowBuilder {
  private steps: AgentStep[] = [];
  private errorHandler?: (error: Error) => Promise<string>;

  addStep(
    description: string,
    fn: (input: string) => Promise<string>,
    type: AgentMessageType = "result"
  ): AgentFlowBuilder {
    this.steps.push({
      behavior: {
        type,
        execute: fn,
      } as AgentBehavior,
      statusMessage: description,
    });
    return this;
  }

  onError(handler: (error: Error) => Promise<string>): AgentFlowBuilder {
    this.errorHandler = handler;
    return this;
  }

  build(): AgentFlow {
    return {
      steps: this.steps,
      onError: this.errorHandler,
    };
  }
}

// Common behaviors factory
export const createBehavior = (
  description: string,
  fn: (input: string) => Promise<string>,
  type: AgentMessageType = "result"
): AgentStep => ({
  behavior: {
    type,
    execute: fn,
  } as AgentBehavior,
  statusMessage: description,
});

// Predefined behaviors
export const commonBehaviors = {
  analyze: (input: string) =>
    Promise.resolve(`
To break down the task of responding to "${input}" into actionable steps:

1. **Input Analysis**:
   - Understand user's intent: ${input}
   - Identify key themes and context
   - Determine required capabilities

2. **Strategy Formation**:
   - Choose appropriate response type
   - Plan information gathering steps
   - Identify potential challenges

3. **Knowledge Assembly**:
   - Gather relevant information
   - Structure response components
   - Prepare supporting details`),

  execute: (input: string) =>
    Promise.resolve(`
Here are the detailed results of processing "${input}":

1. **Comprehension Results**:
   - Core message understood
   - Context analyzed
   - Key points identified

2. **Processing Outcome**:
   - Information gathered
   - Analysis completed
   - Solutions formulated`),

  refine: (input: string) =>
    Promise.resolve(`
Based on the interaction with "${input}", here are potential improvements:

1. **Response Enhancement**:
   - Add more detailed examples
   - Include relevant context
   - Deepen explanation depth

2. **Interaction Quality**:
   - Improve engagement level
   - Enhance clarity
   - Add supporting resources`),
};
