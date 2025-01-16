import { OpenAI } from "openai";
import { API_CONFIG } from "@/config/constants";
import type { AgentConfig } from "@/types";

export class ApiClient {
  private static instance: ApiClient;
  private openai: OpenAI;
  private config: AgentConfig;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    this.config = {
      model: API_CONFIG.MODEL,
      temperature: API_CONFIG.TEMPERATURE,
      maxTokens: API_CONFIG.MAX_TOKENS,
    };
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async planTask(userPrompt: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content:
              "You are a task planning agent. Break down the user request into actionable steps.",
          },
          {
            role: "user",
            content: `Please break down this task into steps: ${userPrompt}`,
          },
        ],
        temperature: this.config.temperature,
      });
      return response;
    } catch (error) {
      console.error("Error in planTask:", error);
      throw error;
    }
  }

  async executeTask(plan: string, userPrompt: string) {
    // Similar implementation for task execution
  }
}
