import { AgentMessageType } from "../types/agent";

export type AgentBehavior = {
  type: AgentMessageType;
  execute: (input: string) => Promise<string>;
};

export type AgentStep = {
  behavior: AgentBehavior;
  statusMessage?: string;
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

  async executeFlow(flow: AgentFlow, input: string): Promise<void> {
    try {
      for (const step of flow.steps) {
        // Send status message if provided
        if (step.statusMessage) {
          await this.sendMessage("status", step.statusMessage);
        }

        // Execute behavior
        const result = await step.behavior.execute(input);
        await this.sendMessage(step.behavior.type, result);
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
