import { ConversationalAgent } from "../agents/ConversationalAgent";
import { AgentExecutor } from "../core/AgentExecutor";
import { SimpleConversationalPolicy } from "../policies/SimpleConversationalPolicy";
import { AgentConfig, AgentMessage, AgentMessageType } from "../types/agent";

export class AgentService {
  private static createStream(): {
    stream: TransformStream;
    writer: WritableStreamDefaultWriter;
  } {
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    return { stream, writer };
  }

  private static createConfig(type: string): AgentConfig {
    const configs: Record<string, AgentConfig> = {
      conversational: {
        id: "conversational-agent",
        name: "Conversational Agent",
        description:
          "A simple conversational agent that can engage in dialogue",
        capabilities: ["text-response", "planning", "refinement"],
      },
      // Add more agent types here
    };

    return configs[type] || configs.conversational;
  }

  static createAgentExecutor(type: string = "conversational"): {
    stream: ReadableStream;
    executor: AgentExecutor;
  } {
    const { stream, writer } = this.createStream();
    const config = this.createConfig(type);
    const policy = new SimpleConversationalPolicy();
    const agent = new ConversationalAgent(config, policy, writer);

    const executor = new AgentExecutor(async (type, message) => {
      await agent.processMessage({ type, message });
    }, writer);

    return {
      stream: stream.readable,
      executor,
    };
  }

  static createResponse(stream: ReadableStream): Response {
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
