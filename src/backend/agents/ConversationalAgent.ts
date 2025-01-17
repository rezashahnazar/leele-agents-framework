import { BaseAgent } from "../core/BaseAgent";
import { AIService } from "../services/AIService";
import {
  AgentConfig,
  AgentEnvironment,
  AgentMessage,
  AgentMessageType,
  AgentPolicy,
} from "../types/agent";
import { nanoid } from "nanoid";

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
    const data = encoder.encode(message);
    // Fire and forget but return a resolved promise for compatibility
    this.writer.write(data).catch(console.error);
    return Promise.resolve();
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (!message.messageId) {
      throw new Error("Message ID is required");
    }
    const data = JSON.stringify({
      type: message.type,
      message: message.message,
      messageId: message.messageId,
    });
    // Fire and forget but return a resolved promise for compatibility
    this.streamResponse(`data: ${data}\n\n`).catch(console.error);
    return Promise.resolve();
  }

  private async streamChunk(
    chunk: string,
    messageId: string,
    type: AgentMessageType
  ): Promise<void> {
    const data = JSON.stringify({
      type,
      message: chunk,
      messageId,
    });
    // Fire and forget but return a resolved promise for compatibility
    this.streamResponse(`data: ${data}\n\n`).catch(console.error);
    return Promise.resolve();
  }

  protected async executeActionStrategy(
    environment: AgentEnvironment
  ): Promise<any> {
    const { state } = environment;
    const input = state.memory[state.memory.length - 1]?.content;

    if (!input) {
      throw new Error("No input found in memory");
    }

    try {
      // Analysis & Planning step
      const planId = nanoid();
      // Fire status messages immediately
      this.processMessage({
        type: "status",
        message: "Analyzing your request...",
        messageId: planId,
      }).catch(console.error);

      this.processMessage({
        type: "status",
        message: "Creating plan...",
        messageId: planId,
      }).catch(console.error);

      // Start plan generation without waiting for completion
      const planPromise = AIService.generateStream(
        input,
        "You are a planning agent. Break down the user request into clear, actionable steps.",
        `Create a detailed plan to answer this question: "${input}"`,
        "plan",
        (chunk) => {
          // Stream chunks immediately
          this.streamChunk(chunk, planId, "plan").catch(console.error);
          return Promise.resolve();
        }
      );

      // Response step - start immediately without waiting for plan
      const responseId = nanoid();
      this.processMessage({
        type: "status",
        message: "Generating response...",
        messageId: responseId,
      }).catch(console.error);

      // Start response generation in parallel
      const responsePromise = AIService.generateStream(
        input,
        "You are a helpful AI assistant. Provide clear, direct responses.",
        `Answer the question: "${input}"`,
        "result",
        (chunk) => {
          this.streamChunk(chunk, responseId, "result").catch(console.error);
          return Promise.resolve();
        }
      );

      // Refinement step - start as soon as response starts coming
      const refinementId = nanoid();
      this.processMessage({
        type: "status",
        message: "Refining response...",
        messageId: refinementId,
      }).catch(console.error);

      // Start refinement in parallel
      const refinementPromise = AIService.generateStream(
        input,
        "You are a refinement agent. Analyze responses and suggest improvements.",
        `Refine the response as it comes: "${input}"`,
        "refinement",
        (chunk) => {
          this.streamChunk(chunk, refinementId, "refinement").catch(
            console.error
          );
          return Promise.resolve();
        }
      );

      // Wait for all streams to complete
      await Promise.all([planPromise, responsePromise, refinementPromise]);

      this.processMessage({
        type: "status",
        message: "Task completed successfully!",
        messageId: refinementId,
      }).catch(console.error);

      return { success: true };
    } catch (error) {
      console.error("Error in executeActionStrategy:", error);
      throw error;
    }
  }
}
