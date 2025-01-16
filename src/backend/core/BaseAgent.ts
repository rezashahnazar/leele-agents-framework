import {
  AgentAction,
  AgentConfig,
  AgentEnvironment,
  AgentMessage,
  AgentObservation,
  AgentPolicy,
  AgentState,
} from "../types/agent";

export abstract class BaseAgent {
  protected environment: AgentEnvironment;
  protected policy: AgentPolicy;
  protected observations: AgentObservation[] = [];

  constructor(config: AgentConfig, policy: AgentPolicy) {
    this.environment = {
      state: this.initializeState(),
      config,
      sendMessage: this.sendMessage.bind(this),
    };
    this.policy = policy;
  }

  protected initializeState(): AgentState {
    return {
      currentStep: "idle",
      context: this.environment?.config.defaultContext || {},
      memory: [],
      metadata: {},
    };
  }

  protected async sendMessage(message: AgentMessage): Promise<void> {
    // In streaming response format
    const encodedMessage = `data: ${JSON.stringify(message)}\n\n`;
    // This will be handled by the implementing class
    await this.streamResponse(encodedMessage);
  }

  protected abstract streamResponse(message: string): Promise<void>;

  protected async observe(observation: AgentObservation): Promise<void> {
    this.observations.push(observation);
    // Update state based on observation
    await this.updateState(observation);
  }

  protected async updateState(observation: AgentObservation): Promise<void> {
    // Basic state update logic - can be overridden by implementing classes
    if (observation.type === "user_input") {
      this.environment.state.memory.push({
        role: "user",
        content: observation.data,
        timestamp: observation.timestamp,
      });
    }
  }

  protected async executeAction(action: AgentAction): Promise<void> {
    try {
      const result = await action.execute(this.environment);
      const reward = await this.policy.evaluateAction(action.type, result);

      // Update state with action result
      this.environment.state.metadata.lastAction = {
        type: action.type,
        result,
        reward,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Action execution failed:", error);
      throw error;
    }
  }

  public async processInput(input: string): Promise<void> {
    // Observe the input
    await this.observe({
      type: "user_input",
      data: input,
      timestamp: Date.now(),
    });

    // Send status message
    await this.sendMessage({
      type: "status",
      message: "Planning task execution...",
    });

    // Get next action from policy
    const nextAction = await this.policy.decideNextAction(
      this.environment.state
    );

    // Execute the action
    await this.executeAction({
      type: nextAction,
      payload: input,
      execute: this.executeActionStrategy.bind(this),
    });
  }

  protected abstract executeActionStrategy(
    environment: AgentEnvironment
  ): Promise<any>;
}
