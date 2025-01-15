import { NextRequest } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.L_OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.L_OPENAI_BASE_URL;

// Initialize OpenAI client
const openai = new OpenAI({
  baseURL: OPENAI_BASE_URL,
  apiKey: OPENAI_API_KEY,
});

// Helper to send SSE messages
const sendSSEMessage = async (
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  data: any
) => {
  await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
};

export async function POST(request: NextRequest) {
  const { userPrompt } = await request.json();

  // Create a stream to send SSE messages
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Process in background
  (async () => {
    try {
      // Step 1: Task Planning
      await sendSSEMessage(writer, encoder, {
        type: "status",
        message: "Planning task execution...",
      });

      const planningResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
        temperature: 0.7,
      });

      const plan = planningResponse.choices[0].message.content;
      await sendSSEMessage(writer, encoder, {
        type: "plan",
        message: plan,
      });

      // Step 2: Task Execution
      await sendSSEMessage(writer, encoder, {
        type: "status",
        message: "Executing task...",
      });

      const executionResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a task execution agent. Execute the given plan and provide detailed results.",
          },
          {
            role: "user",
            content: `Execute this plan: ${plan}\nOriginal request: ${userPrompt}`,
          },
        ],
        temperature: 0.7,
      });

      const result = executionResponse.choices[0].message.content;
      await sendSSEMessage(writer, encoder, {
        type: "result",
        message: result,
      });

      // Step 3: Review and Refinement
      await sendSSEMessage(writer, encoder, {
        type: "status",
        message: "Reviewing and refining results...",
      });

      const refinementResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a review agent. Review the execution results and suggest improvements or refinements.",
          },
          {
            role: "user",
            content: `Review these results:\n${result}\nOriginal request: ${userPrompt}`,
          },
        ],
        temperature: 0.7,
      });

      const refinement = refinementResponse.choices[0].message.content;
      await sendSSEMessage(writer, encoder, {
        type: "refinement",
        message: refinement,
      });

      // Final status
      await sendSSEMessage(writer, encoder, {
        type: "status",
        message: "Task completed successfully!",
      });
    } catch (error: any) {
      console.error("Error in agent processing:", error);
      await sendSSEMessage(writer, encoder, {
        type: "error",
        message: error.message || "An error occurred during processing",
      });
    } finally {
      writer.close();
    }
  })();

  // Return the readable stream for SSE
  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
