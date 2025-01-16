import { AgentMessageType } from "../types/agent";

export type AgentBehavior = {
  type: AgentMessageType;
  execute: (input: any) => Promise<any>;
  processOutput?: (output: any) => any;
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
      message: string
    ) => Promise<void>,
    writer: WritableStreamDefaultWriter
  ) {
    this.writer = writer;
  }

  async executeFlow(flow: AgentFlow, initialInput: any): Promise<void> {
    try {
      const stepOutputs: any[] = [];

      for (const step of flow.steps) {
        // Send status message if provided
        if (step.statusMessage) {
          await this.sendMessage("status", step.statusMessage);
        }

        // Get input for this step
        const input = step.getInput ? step.getInput(stepOutputs) : initialInput;

        if (step.parallel && Array.isArray(input)) {
          // Execute behaviors in parallel
          console.log(`Executing parallel step with ${input.length} items`);
          const promises = input.map(async (item, index) => {
            console.log(
              `Starting parallel execution ${index + 1}/${input.length}`
            );
            const result = await step.behavior.execute(item);
            console.log(
              `Completed parallel execution ${index + 1}/${input.length}`
            );

            // Process and send individual results immediately
            const processedResult = step.behavior.processOutput
              ? step.behavior.processOutput(result)
              : result;

            await this.sendMessage(
              step.behavior.type,
              typeof processedResult === "string"
                ? processedResult
                : JSON.stringify(processedResult)
            );

            return result;
          });

          const parallelResults = await Promise.all(promises);
          stepOutputs.push(parallelResults);
        } else {
          // Execute single behavior
          console.log("Executing single step");
          const result = await step.behavior.execute(input);
          console.log("Step execution completed");

          // Store raw result before processing for output
          stepOutputs.push(result);

          // Process result for display
          const processedResult = step.behavior.processOutput
            ? step.behavior.processOutput(result)
            : result;

          await this.sendMessage(
            step.behavior.type,
            typeof processedResult === "string"
              ? processedResult
              : JSON.stringify(processedResult)
          );
        }
      }

      // Send completion message
      await this.sendMessage("status", "Task completed successfully!");
    } catch (error) {
      console.error("Error in agent flow:", error);
      const errorMessage = flow.onError
        ? await flow.onError(error as Error)
        : "Error occurred during processing";
      await this.sendMessage("status", errorMessage);
    } finally {
      // Close the stream
      await this.writer.close();
    }
  }
}
