import { AgentService } from "./AgentService";
import { AgentMessageType } from "../types/agent";

type AgentStep = {
  say: string;
  do: (input: string) => Promise<string>;
  as: string;
};

export class AgentOrchestrator {
  static process(steps: AgentStep[], input: string) {
    const { stream, executor } = AgentService.createAgentExecutor();

    executor.executeFlow(
      {
        steps: steps.map((step) => ({
          behavior: {
            type: step.as as AgentMessageType,
            execute: step.do,
          },
          statusMessage: step.say,
        })),
      },
      input
    );

    return AgentService.createResponse(stream);
  }
}
