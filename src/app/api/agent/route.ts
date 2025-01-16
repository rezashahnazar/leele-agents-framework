import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";

export const runtime = "edge";

const agentFlow = new FlowBuilder()
  .name("AI Agent")
  .description(
    "An AI agent that processes questions with a structured approach"
  )
  .addStep({
    name: "Analysis",
    description: "Analyze and plan the response",
    type: "sequential",
    execute: async (question: string) => {
      return AIService.generate(
        question,
        "You are a planning agent. Break down the user request into clear, actionable steps.",
        `Create a detailed plan to answer this question: "${question}"`,
        "generate plan"
      );
    },
    statusMessage: "Analyzing your request...",
  })
  .addStep({
    name: "Response",
    description: "Generate initial response",
    type: "sequential",
    execute: async (question: string) => {
      const plan = await AIService.generate(
        question,
        "You are a planning agent. Break down the user request into clear, actionable steps.",
        `Create a detailed plan to answer this question: "${question}"`,
        "generate plan"
      );

      return await AIService.generate(
        question,
        "You are a knowledgeable assistant. Provide detailed, accurate responses.",
        `Question: "${question}"\nPlan: ${plan}\n\nProvide a comprehensive response following this plan.`,
        "generate response"
      );
    },
    statusMessage: "Generating response...",
  })
  .goalBased(
    "Refinement",
    "Refine the response for optimal quality",
    async (input: { question: string; response: string }) => {
      return AIService.generate(
        `${input.question}\n${input.response}`,
        "You are a refinement agent. Analyze responses and suggest improvements.",
        `Original question: "${input.question}"\nCurrent response: ${input.response}\n\nSuggest improvements and refinements.`,
        "generate refinement"
      );
    },
    async (response: string) => {
      const evaluation = await AIService.generate(
        response,
        "You are an evaluation agent. Rate content quality objectively.",
        `Evaluate this response's quality by analyzing:\n1. Accuracy\n2. Completeness\n3. Clarity\n\nReturn ONLY a single number between 1-10 representing overall quality.`,
        "evaluate response"
      );
      const score = parseFloat(evaluation.replace(/[^\d.]/g, ""));
      return !isNaN(score) && score >= 8.5;
    },
    3,
    "Refining response..."
  )
  .onError(async (error) => `Error processing request: ${error.message}`)
  .build();

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) return new Response("Missing user prompt", { status: 400 });

  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(agentFlow), userPrompt);

  return AgentService.createResponse(stream);
}
