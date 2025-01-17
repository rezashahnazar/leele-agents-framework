import { AgentFlow, AgentStep } from "./AgentExecutor";
import { Flow, AnyFlowStep, FlowContext } from "../types/flow";
import { AgentMessageType } from "../types/agent";

export class FlowAdapter {
  static toAgentFlow(flow: Flow): AgentFlow {
    return {
      steps: flow.steps.map(this.toAgentStep),
      onError: flow.onError,
    };
  }

  private static toAgentStep(step: AnyFlowStep): AgentStep {
    if (step.type === "goal-based") {
      return {
        behavior: {
          type: step.type as AgentMessageType,
          execute: async (input: any, context: FlowContext) => {
            const result = await step.execute(input, {
              ...context,
              sendMessage: async (type, message, messageId) => {
                await context.sendMessage(type, message, messageId);
              },
            });
            return result;
          },
          processOutput: step.outputProcessor,
          stream: false,
          evaluator: step.evaluator,
          maxAttempts: step.maxAttempts,
        },
        statusMessage: step.statusMessage,
        parallel: false,
      };
    }

    return {
      behavior: {
        type: step.type as AgentMessageType,
        execute: async (input: any, context: FlowContext) => {
          const result = await step.execute(input, {
            ...context,
            sendMessage: async (type, message, messageId) => {
              await context.sendMessage(type, message, messageId);
            },
          });
          return result;
        },
        processOutput: step.outputProcessor,
        stream: step.type === "sequential" || step.type === "parallel",
      },
      statusMessage: step.statusMessage,
      parallel: step.type === "parallel",
      getInput: "items" in step ? step.items : undefined,
    };
  }
}
