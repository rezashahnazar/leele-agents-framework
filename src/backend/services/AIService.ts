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
    operation = "generate",
    stream = false,
    onChunk?: (chunk: string) => Promise<void>
  ): Promise<string> {
    if (stream && onChunk) {
      return this.generateStream(
        input,
        systemPrompt,
        userPrompt,
        operation,
        onChunk
      );
    }

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
        stream: false,
      });
      return response.choices[0].message.content || "";
    } catch (error) {
      return this.handleError(error, operation);
    }
  }

  static async generateStream(
    input: string,
    systemPrompt: string,
    userPrompt: string,
    type: string,
    onChunk: (chunk: string) => Promise<void>
  ): Promise<string> {
    try {
      const response = await fetch(
        `${process.env.OPENAI_BASE_URL}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
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
            stream: true,
          }),
        }
      );

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let pendingChunk = "";

      const processChunk = (text: string) => {
        const dataPrefix = "data: ";
        const start = text.indexOf(dataPrefix);
        if (start === -1) return;

        const jsonStr = text.slice(start + dataPrefix.length);
        if (jsonStr.includes("[DONE]")) return;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            // Fire and forget
            onChunk(content).catch(console.error);
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = pendingChunk + decoder.decode(value, { stream: true });
        const newlineIndex = chunk.lastIndexOf("\n");

        if (newlineIndex !== -1) {
          const completeChunks = chunk.slice(0, newlineIndex);
          pendingChunk = chunk.slice(newlineIndex + 1);

          // Process each complete line
          completeChunks.split("\n").forEach(processChunk);
        } else {
          pendingChunk = chunk;
        }
      }

      // Process any remaining chunk
      if (pendingChunk) {
        processChunk(pendingChunk);
      }

      return fullResponse;
    } catch (error) {
      return this.handleError(error, "stream generation");
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
