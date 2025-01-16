import { AIService } from "@/backend/services/AIService";
import { AgentOrchestrator } from "@/backend/services/AgentOrchestrator";

export const runtime = "edge";

// Define how our AI agent should think and work
const agent = {
  whenReceivingAQuestion: [
    {
      say: "Let me analyze this request...",
      do: AIService.generatePlan,
      as: "plan",
    },
    {
      say: "I'll research this topic thoroughly...",
      do: async (question: string) => {
        const plan = await AIService.generatePlan(question);
        return await AIService.generateResponse(question, plan);
      },
      as: "result",
    },
    {
      say: "Now, I'll organize what I've found...",
      do: async (question: string) => {
        const plan = await AIService.generatePlan(question);
        return await AIService.generateResponse(question, plan);
      },
      as: "result",
    },
    {
      say: "I'll write a comprehensive response...",
      do: async (question: string) => {
        const plan = await AIService.generatePlan(question);
        return await AIService.generateResponse(question, plan);
      },
      as: "result",
    },
    {
      say: "Finally, I'll review and improve my answer...",
      do: async (question: string) => {
        const plan = await AIService.generatePlan(question);
        const response = await AIService.generateResponse(question, plan);
        return await AIService.generateRefinement(question, response);
      },
      as: "refinement",
    },
  ],
};

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) return new Response("Missing user prompt", { status: 400 });

  // Let the agent handle the question
  return AgentOrchestrator.process(agent.whenReceivingAQuestion, userPrompt);
}
