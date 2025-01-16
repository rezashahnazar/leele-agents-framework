import { AgentService } from "./AgentService";
import { AgentMessageType } from "../types/agent";

export type GameStep = {
  say: string;
  do: (input: any) => Promise<any>;
  as: string;
  parallel?: boolean;
  getInput?: (outputs: any[]) => any;
  processOutput?: (output: any) => string;
};

export class AgentOrchestrator {
  static process(steps: GameStep[], input: string) {
    const { stream, executor } = AgentService.createAgentExecutor();

    executor.executeFlow(
      {
        steps: steps.map((step) => ({
          behavior: {
            type: step.as as AgentMessageType,
            execute: step.do,
            processOutput: step.processOutput,
          },
          statusMessage: step.say,
          parallel: step.parallel,
          getInput: step.getInput,
        })),
      },
      input
    );

    return AgentService.createResponse(stream);
  }
}
