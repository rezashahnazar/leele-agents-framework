import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";

export const runtime = "edge";

const prdGeneratorFlow = new FlowBuilder()
  .name("PRD Generator")
  .description(
    "An AI agent that transforms high-level requirements into detailed PRDs"
  )
  // Initial Analysis
  .addStep({
    name: "Requirements Analysis",
    description:
      "Analyze the high-level requirements and create a structured outline",
    type: "sequential",
    execute: async (requirements: string) => {
      const response = await AIService.generate(
        requirements,
        "You are a senior product manager analyzing high-level requirements.",
        `For the given requirements: "${requirements}", create a structured analysis that includes:
         1. Core problem statement
         2. Target audience
         3. Key objectives
         4. Success metrics
         5. Initial scope boundaries
         
         Return the analysis in a clear, structured format.`
      );
      return response;
    },
    statusMessage: "Analyzing requirements and creating initial structure...",
  })
  // Market Research
  .addStep({
    name: "Market Research",
    description: "Conduct market research and competitive analysis",
    type: "sequential",
    execute: async (analysis: string) => {
      const response = await AIService.generate(
        analysis,
        "You are a market research analyst.",
        `Based on the initial analysis, conduct a thorough market research:
         1. Identify key market trends
         2. Analyze potential competitors
         3. Highlight market opportunities
         4. Identify potential risks
         5. Suggest market positioning
         
         Structure your findings professionally.`
      );
      return response;
    },
    statusMessage: "Conducting market research and competitive analysis...",
  })
  // Feature Breakdown
  .parallel(
    "Feature Analysis",
    "Break down features and analyze them in parallel",
    async (input: { type: string; content: string }) => {
      const prompts: Record<string, string> = {
        functional:
          "Detail the core functional requirements, user flows, and technical considerations.",
        technical:
          "Outline technical architecture, system requirements, and implementation considerations.",
        ux: "Describe user experience goals, interaction patterns, and design principles.",
        security:
          "Analyze security requirements, data protection needs, and compliance considerations.",
      };

      return AIService.generate(
        input.content,
        "You are a technical product analyst.",
        prompts[input.type] || "Analyze general requirements"
      );
    },
    (previousOutputs: any[]) => {
      const analysis = previousOutputs[previousOutputs.length - 1];
      return [
        { type: "functional", content: analysis },
        { type: "technical", content: analysis },
        { type: "ux", content: analysis },
        { type: "security", content: analysis },
      ];
    },
    "Breaking down and analyzing different aspects of the product..."
  )
  // Integration and Timeline
  .addStep({
    name: "Integration Planning",
    description: "Create implementation timeline and integration plan",
    type: "sequential",
    execute: async (features: string) => {
      return AIService.generate(
        features,
        "You are a project planner.",
        `Create a comprehensive implementation plan including:
         1. Development phases
         2. Resource requirements
         3. Dependencies
         4. Risk mitigation strategies
         5. Timeline estimates
         
         Present this in a structured, professional format.`
      );
    },
    statusMessage: "Creating implementation plan and timeline...",
  })
  // Final PRD Assembly
  .goalBased(
    "PRD Assembly",
    "Assemble and refine the final PRD document",
    async (inputs: string) => {
      return AIService.generate(
        inputs,
        "You are a PRD documentation specialist.",
        `Create a professional PRD document that includes:
         1. Executive Summary
         2. Problem Statement & Objectives
         3. Market Analysis
         4. Product Features & Requirements
         5. Technical Specifications
         6. UX/UI Requirements
         7. Security Considerations
         8. Implementation Plan
         9. Success Metrics
         10. Appendices
         
         Format this as a complete, professional PRD document.`
      );
    },
    async (prd: string) => {
      const evaluation = await AIService.generate(
        prd,
        "You are a PRD quality analyst.",
        `Evaluate this PRD's completeness and quality by analyzing:
         1. Clarity and structure
         2. Technical depth
         3. Business alignment
         4. Implementation feasibility
         
         Return ONLY a single number between 1-10 representing overall quality.`
      );
      const score = parseFloat(evaluation.replace(/[^\d.]/g, ""));
      return !isNaN(score) && score >= 8.5;
    },
    3,
    "Assembling and refining the final PRD...",
    (prd: string) => prd
  )
  .onError(async (error) => `Error generating PRD: ${error.message}`)
  .build();

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) {
    return new Response("Please provide product requirements!", {
      status: 400,
    });
  }

  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(prdGeneratorFlow), userPrompt);

  return AgentService.createResponse(stream);
}
