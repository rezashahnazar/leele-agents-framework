import { BaseAgent } from "../core/BaseAgent";
import { AIService } from "../services/AIService";
import {
  AgentConfig,
  AgentEnvironment,
  AgentMessage,
  AgentPolicy,
} from "../types/agent";

export class ConversationalAgent extends BaseAgent {
  private writer: WritableStreamDefaultWriter;
  private currentResponse: string = "";

  constructor(
    config: AgentConfig,
    policy: AgentPolicy,
    writer: WritableStreamDefaultWriter
  ) {
    super(config, policy);
    this.writer = writer;
  }

  protected async streamResponse(message: string): Promise<void> {
    const encoder = new TextEncoder();
    await this.writer.write(encoder.encode(message));
  }

  async processMessage(message: AgentMessage): Promise<void> {
    await this.sendMessage(message);
  }

  protected async executeActionStrategy(
    environment: AgentEnvironment
  ): Promise<any> {
    const { state } = environment;
    const input = state.memory[state.memory.length - 1]?.content;

    if (!input) {
      throw new Error("No input found in memory");
    }

    // Generate and send plan
    const plan = await AIService.generatePlan(input);
    await this.sendMessage({
      type: "plan",
      message: plan,
    });

    // Send execution status
    await this.sendMessage({
      type: "status",
      message: "Executing task...",
    });

    // Generate and send response
    this.currentResponse = await AIService.generateResponse(input, plan);
    await this.sendMessage({
      type: "result",
      message: this.currentResponse,
    });

    // Generate and send refinement
    const refinement = await AIService.generateRefinement(
      input,
      this.currentResponse
    );
    await this.sendMessage({
      type: "refinement",
      message: refinement,
    });

    // Final status
    await this.sendMessage({
      type: "status",
      message: "Task completed successfully!",
    });

    return { success: true };
  }
}
