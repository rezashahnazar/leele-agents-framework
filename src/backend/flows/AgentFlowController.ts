import { ConversationalAgent } from "../agents/ConversationalAgent";

export type FlowStep = {
  type: "input" | "process" | "analyze" | "plan" | "execute" | "refine";
  action: (agent: ConversationalAgent, data?: any) => Promise<void>;
};

export type AgentFlow = {
  name: string;
  description: string;
  steps: FlowStep[];
};

export class AgentFlowController {
  private static flows: Record<string, AgentFlow> = {
    conversation: {
      name: "Conversation Flow",
      description: "Standard conversational flow with planning and refinement",
      steps: [
        {
          type: "input",
          action: async (agent, message) => {
            await agent.processInput(message);
          },
        },
      ],
    },
    // Add more flows here
  };

  static async executeFlow(
    flowName: string,
    agent: ConversationalAgent,
    data: any
  ): Promise<void> {
    const flow = this.flows[flowName];
    if (!flow) {
      throw new Error(`Flow ${flowName} not found`);
    }

    for (const step of flow.steps) {
      await step.action(agent, data);
    }
  }

  static getAvailableFlows(): string[] {
    return Object.keys(this.flows);
  }

  static getFlowDescription(flowName: string): string | null {
    return this.flows[flowName]?.description || null;
  }
}
