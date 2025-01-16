import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export class AIService {
  private static handleError(error: unknown, operation: string): never {
    console.error(`Error ${operation}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to ${operation}: ${error.message}`);
    }
    throw new Error(`Failed to ${operation}: Unknown error occurred`);
  }

  static async testConnection(): Promise<boolean> {
    try {
      console.log("Testing OpenAI connection...");
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: "Test connection",
          },
        ],
        max_tokens: 5,
      });
      console.log("OpenAI connection successful");
      return true;
    } catch (error) {
      console.error("OpenAI connection failed:", error);
      return false;
    }
  }

  static async generatePlan(input: string): Promise<string> {
    console.log("Generating plan for input:", input);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a planning agent. Break down the user request into clear, actionable steps.",
          },
          {
            role: "user",
            content: `Create a detailed plan to answer this question: "${input}"`,
          },
        ],
        temperature: 0.7,
      });

      console.log("Plan generated successfully");
      return response.choices[0].message.content || "";
    } catch (error) {
      return this.handleError(error, "generate plan");
    }
  }

  static async generateResponse(input: string, plan: string): Promise<string> {
    console.log("Generating response for input:", input);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a knowledgeable assistant. Provide detailed, accurate responses.",
          },
          {
            role: "user",
            content: `Question: "${input}"\nPlan: ${plan}\n\nProvide a comprehensive response following this plan.`,
          },
        ],
        temperature: 0.7,
      });

      console.log("Response generated successfully");
      return response.choices[0].message.content || "";
    } catch (error) {
      return this.handleError(error, "generate response");
    }
  }

  static async generateRefinement(
    input: string,
    response: string
  ): Promise<string> {
    console.log("Generating refinement for response");
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a refinement agent. Analyze responses and suggest improvements.",
          },
          {
            role: "user",
            content: `Original question: "${input}"\nCurrent response: ${response}\n\nSuggest improvements and refinements.`,
          },
        ],
        temperature: 0.7,
      });

      console.log("Refinement generated successfully");
      return completion.choices[0].message.content || "";
    } catch (error) {
      return this.handleError(error, "generate refinement");
    }
  }
}
