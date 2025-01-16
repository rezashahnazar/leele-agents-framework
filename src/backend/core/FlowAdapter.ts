import { AgentFlow, AgentStep } from "./AgentExecutor";
import { Flow, AnyFlowStep } from "../types/flow";
import { AgentMessageType } from "../types/agent";

export class FlowAdapter {
  static toAgentFlow(flow: Flow): AgentFlow {
    return {
      steps: flow.steps.map(this.toAgentStep),
      onError: flow.onError,
    };
  }

  private static toAgentStep(step: AnyFlowStep): AgentStep {
    return {
      behavior: {
        type: step.type as AgentMessageType,
        execute: step.execute,
        processOutput: step.outputProcessor,
      },
      statusMessage: step.statusMessage,
      parallel: step.type === "parallel",
      getInput: "items" in step ? step.items : undefined,
    };
  }
}
