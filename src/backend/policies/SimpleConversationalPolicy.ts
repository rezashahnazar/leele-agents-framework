import { AgentPolicy, AgentState } from "../types/agent";

export class SimpleConversationalPolicy implements AgentPolicy {
  async decideNextAction(state: AgentState): Promise<string> {
    // In this simple implementation, we always return 'respond'
    // In a more sophisticated implementation, this would analyze the state
    // and choose from multiple possible actions
    return "respond";
  }

  async evaluateAction(action: string, result: any): Promise<number> {
    // Simple reward function - in a real implementation,
    // this would evaluate the quality of the response
    if (result?.success) {
      return 1.0;
    }
    return 0.0;
  }
}
