import {
  Flow,
  AnyFlowStep,
  ParallelFlowStep,
  ConditionalFlowStep,
  GoalBasedFlowStep,
  FlowContext,
} from "../types/flow";
import { AgentMessageType } from "../types/agent";

export class FlowExecutor {
  constructor(
    private sendMessageCallback: (
      type: AgentMessageType,
      message: string,
      messageId?: string
    ) => Promise<void>,
    private writer: WritableStreamDefaultWriter
  ) {}

  private async sendMessage(
    type: AgentMessageType,
    message: string,
    messageId?: string
  ): Promise<void> {
    await this.sendMessageCallback(type, message, messageId);
  }

  private async executeStep(
    step: AnyFlowStep,
    input: any,
    outputs: any[],
    context: FlowContext
  ): Promise<any> {
    if (step.statusMessage) {
      await this.sendMessage("status", step.statusMessage);
    }

    let result: any;

    switch (step.type) {
      case "parallel":
        result = await this.executeParallelStep(
          step as ParallelFlowStep,
          outputs,
          context
        );
        break;
      case "conditional":
        result = await this.executeConditionalStep(
          step as ConditionalFlowStep,
          input,
          context
        );
        break;
      case "goal-based":
        result = await this.executeGoalBasedStep(
          step as GoalBasedFlowStep,
          input,
          context
        );
        break;
      default:
        result = await step.execute(input, context);
    }

    const processedResult = step.outputProcessor
      ? step.outputProcessor(result)
      : result;
    if (processedResult !== undefined) {
      await this.sendMessage(
        step.type as AgentMessageType,
        typeof processedResult === "string"
          ? processedResult
          : JSON.stringify(processedResult)
      );
    }

    return result;
  }

  private async executeParallelStep(
    step: ParallelFlowStep,
    outputs: any[],
    context: FlowContext
  ): Promise<any[]> {
    try {
      const items = step.items(outputs);
      if (!Array.isArray(items)) {
        throw new Error("Parallel step items must return an array");
      }

      await this.sendMessage(
        "status",
        `Starting parallel execution of ${items.length} items...`,
        context.messageId
      );

      // Execute all items in parallel and collect results
      const results = await Promise.all(
        items.map(async (item, index) => {
          try {
            await this.sendMessage(
              "status",
              `Processing item ${index + 1}/${items.length}: ${
                item.type || "Unknown type"
              }`,
              context.messageId
            );

            const result = await step.execute(item, context);

            // Check if the result indicates an error
            if (result && typeof result === "object" && "error" in result) {
              console.error(
                `Error in parallel item ${index + 1}:`,
                result.error
              );
              await this.sendMessage(
                "status",
                `Item ${index + 1} failed: ${result.error}`,
                context.messageId
              );
              return result;
            }

            await this.sendMessage(
              "status",
              `Completed item ${index + 1}/${items.length}`,
              context.messageId
            );
            return result;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";
            console.error(`Error in parallel item ${index + 1}:`, error);
            await this.sendMessage(
              "status",
              `Item ${index + 1} failed: ${errorMessage}`,
              context.messageId
            );
            return { type: item.type, error: errorMessage };
          }
        })
      );

      // Count successful and failed items
      const successful = results.filter(
        (r) => r && typeof r === "object" && !("error" in r)
      ).length;
      const failed = results.length - successful;

      await this.sendMessage(
        "status",
        `Parallel execution completed: ${successful} succeeded, ${failed} failed`,
        context.messageId
      );

      // Process and send the combined results
      if (step.outputProcessor) {
        try {
          // Always send results as an array to the output processor
          const processedResult = step.outputProcessor(results);

          if (processedResult) {
            // Send the processed result
            await this.sendMessage(
              step.type as AgentMessageType,
              processedResult
            );
          }
        } catch (error) {
          console.error("Error processing parallel results:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          await this.sendMessage(
            "status",
            `Error processing parallel results: ${errorMessage}`,
            context.messageId
          );
        }
      } else {
        // If no output processor, send raw results
        await this.sendMessage(
          step.type as AgentMessageType,
          JSON.stringify(results)
        );
      }

      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error in parallel step:", errorMessage);
      await this.sendMessage(
        "status",
        `Parallel step failed: ${errorMessage}`,
        context.messageId
      );
      throw new Error(`Parallel step failed: ${errorMessage}`);
    }
  }

  private async executeConditionalStep(
    step: ConditionalFlowStep,
    input: any,
    context: FlowContext
  ): Promise<any> {
    return step.execute(input, context);
  }

  private async executeGoalBasedStep(
    step: GoalBasedFlowStep,
    input: any,
    context: FlowContext
  ): Promise<any> {
    let attempts = 0;
    let result: any;

    while (attempts < step.maxAttempts) {
      attempts++;
      result = await step.execute(input, context);

      if (await step.evaluator(result, context)) {
        return result;
      }

      if (attempts < step.maxAttempts) {
        await this.sendMessage(
          "status",
          `Attempt ${attempts}/${step.maxAttempts} did not meet goal. Retrying...`
        );
      }
    }

    await this.sendMessage(
      "status",
      `Reached maximum attempts (${step.maxAttempts}). Using best result.`
    );
    return result;
  }

  async executeFlow(flow: Flow, initialInput: any): Promise<void> {
    try {
      const outputs: any[] = [];
      const context: FlowContext = {
        sendMessage: this.sendMessage.bind(this),
        messageId: "",
      };

      for (const step of flow.steps) {
        const result = await this.executeStep(
          step,
          initialInput,
          outputs,
          context
        );
        outputs.push(result);
      }

      await this.sendMessage("status", "Flow completed successfully!");
    } catch (error) {
      console.error("Error in flow execution:", error);
      const errorMessage = flow.onError
        ? await flow.onError(error as Error)
        : "Error occurred during flow execution";
      await this.sendMessage("status", errorMessage);
    } finally {
      await this.writer.close();
    }
  }
}
