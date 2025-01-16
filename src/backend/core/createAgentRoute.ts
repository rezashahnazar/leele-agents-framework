import { AgentService } from "../services/AgentService";
import { AgentFlow } from "./AgentExecutor";

export const createAgentRoute = (flow: AgentFlow) => {
  return async function handler(req: Request) {
    try {
      const { messages } = await req.json();
      const userMessage = messages[messages.length - 1]?.content;

      if (!userMessage) {
        return new Response("No message provided", { status: 400 });
      }

      const { stream, executor } = AgentService.createAgentExecutor();
      executor.executeFlow(flow, userMessage).catch(console.error);

      return AgentService.createResponse(stream);
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  };
};
