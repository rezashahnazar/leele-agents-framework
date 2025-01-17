import { AgentMessageType } from "../types/agent";
import { FlowContext } from "../types/flow";
import { nanoid } from "nanoid";

export type AgentBehavior = {
  type: AgentMessageType;
  execute: (input: any, context: FlowContext) => Promise<any>;
  processOutput?: (output: any) => any;
  stream?: boolean;
  evaluator?: (result: any, context: FlowContext) => Promise<boolean>;
  maxAttempts?: number;
};

export type AgentStep = {
  behavior: AgentBehavior;
  statusMessage?: string;
  parallel?: boolean;
  getInput?: (previousOutputs: any[]) => any;
};

export type AgentFlow = {
  steps: AgentStep[];
  onError?: (error: Error) => Promise<string>;
};

export class AgentExecutor {
  private writer: WritableStreamDefaultWriter;

  constructor(
    private sendMessage: (
      type: AgentMessageType,
      message: string,
      messageId?: string
    ) => Promise<void>,
    writer: WritableStreamDefaultWriter
  ) {
    this.writer = writer;
  }

  private async streamResponse(message: string): Promise<void> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    this.writer.write(data).catch(console.error);
  }

  async executeFlow(flow: AgentFlow, initialInput: any): Promise<void> {
    try {
      const stepOutputs: any[] = [];

      for (const step of flow.steps) {
        const messageId = nanoid();

        if (step.statusMessage) {
          this.sendMessage("status", step.statusMessage, messageId).catch(
            console.error
          );
        }

        const input = step.getInput
          ? step.getInput(stepOutputs)
          : stepOutputs.length > 0
          ? stepOutputs[stepOutputs.length - 1]
          : initialInput;

        const context: FlowContext = {
          sendMessage: (
            type: AgentMessageType,
            message: string,
            messageId?: string
          ) => {
            this.sendMessage(type, message, messageId).catch(console.error);
            return Promise.resolve();
          },
          messageId,
        };

        if (step.parallel && Array.isArray(input)) {
          console.log(`Executing parallel step with ${input.length} items`);
          const promises = input.map(async (item, index) => {
            console.log(
              `Starting parallel execution ${index + 1}/${input.length}`
            );
            const result = await step.behavior.execute(item, context);
            const processedResult = step.behavior.processOutput
              ? step.behavior.processOutput(result)
              : result;
            console.log(
              `Completed parallel execution ${index + 1}/${input.length}`
            );
            return processedResult;
          });

          const parallelResults = await Promise.all(promises);
          stepOutputs.push(parallelResults);
        } else if (step.behavior.evaluator && step.behavior.maxAttempts) {
          // Goal-based step
          console.log("Executing goal-based step");
          let attempts = 0;
          let currentInput = input;
          let result;

          while (attempts < step.behavior.maxAttempts) {
            result = await step.behavior.execute(currentInput, context);
            const processedResult = step.behavior.processOutput
              ? step.behavior.processOutput(result)
              : result;

            // Check if the goal is met
            const goalMet = await step.behavior.evaluator(
              processedResult,
              context
            );
            if (goalMet) {
              console.log("Goal met, moving to next step");
              stepOutputs.push(processedResult);
              break;
            }

            attempts++;
            if (attempts < step.behavior.maxAttempts) {
              console.log(
                `Goal not met, attempt ${attempts + 1}/${
                  step.behavior.maxAttempts
                }`
              );
              currentInput = processedResult;
            } else {
              console.log("Max attempts reached, using last result");
              stepOutputs.push(processedResult);
            }
          }
        } else {
          console.log("Executing single step");
          const result = await step.behavior.execute(input, context);
          const processedResult = step.behavior.processOutput
            ? step.behavior.processOutput(result)
            : result;
          console.log("Step execution completed");
          stepOutputs.push(processedResult);
        }
      }

      this.sendMessage(
        "status",
        "Task completed successfully!",
        nanoid()
      ).catch(console.error);
    } catch (error) {
      console.error("Error in agent flow:", error);
      this.sendMessage(
        "status",
        flow.onError
          ? await flow.onError(error as Error)
          : "Error occurred during processing",
        nanoid()
      ).catch(console.error);
    } finally {
      await this.writer.close();
    }
  }
}
