import {
  Flow,
  AnyFlowStep,
  ParallelStep,
  ConditionalStep,
  GoalBasedStep,
} from "../types/flow";
import { AgentMessageType } from "../types/agent";

export class FlowExecutor {
  constructor(
    private sendMessage: (
      type: AgentMessageType,
      message: string
    ) => Promise<void>,
    private writer: WritableStreamDefaultWriter
  ) {}

  private async executeStep(
    step: AnyFlowStep,
    input: any,
    outputs: any[]
  ): Promise<any> {
    if (step.statusMessage) {
      await this.sendMessage("status", step.statusMessage);
    }

    let result: any;

    switch (step.type) {
      case "parallel":
        result = await this.executeParallelStep(step as ParallelStep, outputs);
        break;
      case "conditional":
        result = await this.executeConditionalStep(
          step as ConditionalStep,
          input
        );
        break;
      case "goal-based":
        result = await this.executeGoalBasedStep(step as GoalBasedStep, input);
        break;
      default:
        result = await step.execute(input);
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
    step: ParallelStep,
    outputs: any[]
  ): Promise<any[]> {
    try {
      const items = step.items(outputs);
      if (!Array.isArray(items)) {
        throw new Error("Parallel step items must return an array");
      }

      await this.sendMessage(
        "status",
        `Starting parallel execution of ${items.length} items...`
      );

      // Execute all items in parallel and collect results
      const results = await Promise.all(
        items.map(async (item, index) => {
          try {
            await this.sendMessage(
              "status",
              `Processing item ${index + 1}/${items.length}: ${
                item.type || "Unknown type"
              }`
            );

            const result = await step.execute(item);

            // Check if the result indicates an error
            if (result && typeof result === "object" && "error" in result) {
              console.error(
                `Error in parallel item ${index + 1}:`,
                result.error
              );
              await this.sendMessage(
                "status",
                `Item ${index + 1} failed: ${result.error}`
              );
              return result;
            }

            await this.sendMessage(
              "status",
              `Completed item ${index + 1}/${items.length}`
            );
            return result;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";
            console.error(`Error in parallel item ${index + 1}:`, error);
            await this.sendMessage(
              "status",
              `Item ${index + 1} failed: ${errorMessage}`
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
        `Parallel execution completed: ${successful} succeeded, ${failed} failed`
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
            `Error processing parallel results: ${errorMessage}`
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
      await this.sendMessage("status", `Parallel step failed: ${errorMessage}`);
      throw new Error(`Parallel step failed: ${errorMessage}`);
    }
  }

  private async executeConditionalStep(
    step: ConditionalStep,
    input: any
  ): Promise<any> {
    return step.execute(input);
  }

  private async executeGoalBasedStep(
    step: GoalBasedStep,
    input: any
  ): Promise<any> {
    let attempts = 0;
    let result: any;

    while (attempts < step.maxAttempts) {
      attempts++;
      result = await step.execute(input);

      if (await step.goalCheck(result)) {
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

      for (const step of flow.steps) {
        const result = await this.executeStep(step, initialInput, outputs);
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
