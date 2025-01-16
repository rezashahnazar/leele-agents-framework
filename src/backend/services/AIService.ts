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

  static async generate(
    input: string,
    systemPrompt: string,
    userPrompt: string,
    operation = "generate"
  ): Promise<string> {
    console.log(`${operation} for input:`, input);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
      });

      console.log(`${operation} completed successfully`);
      return response.choices[0].message.content || "";
    } catch (error) {
      return this.handleError(error, operation);
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      console.log("Testing OpenAI connection...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Test connection" }],
        max_tokens: 5,
      });
      console.log("OpenAI connection successful");
      return true;
    } catch (error) {
      console.error("OpenAI connection failed:", error);
      return false;
    }
  }
}
