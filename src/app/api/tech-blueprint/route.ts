import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";

export const runtime = "edge";

const techBlueprintFlow = new FlowBuilder()
  .name("Technical Blueprint Generator")
  .description(
    "An AI agent that transforms high-level software concepts into detailed technical blueprints"
  )
  // Initial Analysis
  .addStep({
    name: "Concept Analysis",
    description: "Analyze the software concept and create initial structure",
    type: "sequential",
    execute: async (concept: string) => {
      const response = await AIService.generate(
        concept,
        "You are a senior software architect analyzing a software concept.",
        `For the given concept: "${concept}", create a structured analysis that includes:
         1. Core technical requirements
         2. System architecture overview
         3. Key technical challenges
         4. Technology stack recommendations
         5. Initial scope boundaries
         
         Return the analysis in a clear, structured format.`
      );
      return response;
    },
    statusMessage:
      "Analyzing software concept and creating initial structure...",
  })
  // Technical Research
  .addStep({
    name: "Technical Research",
    description: "Research technical approaches and best practices",
    type: "sequential",
    execute: async (analysis: string) => {
      const response = await AIService.generate(
        analysis,
        "You are a technical architect.",
        `Based on the initial analysis, design the system architecture:
         1. Component breakdown
         2. Data flow diagrams
         3. API specifications
         4. Integration points
         5. Security considerations
         
         Present the architecture in a clear, technical format.`
      );
      return response;
    },
    statusMessage: "Researching technical approaches and best practices...",
  })
  // Parallel Architecture Analysis
  .parallel(
    "Architecture Analysis",
    "Analyze different architectural aspects in parallel",
    async (input: { type: string; content: string }) => {
      const prompts: Record<string, string> = {
        backend: "Detail backend services, databases, and API design.",
        frontend:
          "Outline UI/UX architecture, state management, and client-side considerations.",
        devops: "Describe deployment, scaling, and operational requirements.",
        security:
          "Analyze security requirements, authentication, and data protection.",
      };

      return AIService.generate(
        input.content,
        "You are a specialized technical architect.",
        prompts[input.type] || "Analyze general technical requirements"
      );
    },
    (previousOutputs: any[]) => {
      const analysis = previousOutputs[previousOutputs.length - 1];
      return [
        { type: "backend", content: analysis },
        { type: "frontend", content: analysis },
        { type: "infrastructure", content: analysis },
        { type: "security", content: analysis },
        { type: "performance", content: analysis },
      ];
    },
    "Analyzing different architectural aspects..."
  )
  // Technical Design Decisions
  .addStep({
    name: "Design Decisions",
    description: "Make and document key technical decisions",
    type: "sequential",
    execute: async (architectureAnalysis: string) => {
      return AIService.generate(
        architectureAnalysis,
        "You are a technical project manager.",
        `Create a comprehensive technical implementation plan including:
         1. Development phases
         2. Technical dependencies
         3. Resource allocation
         4. Risk mitigation
         5. Timeline estimates
         
         Present this in a structured, technical format.`
      );
    },
    statusMessage: "Making and documenting key technical decisions...",
  })
  // Implementation Planning
  .addStep({
    name: "Implementation Planning",
    description: "Create detailed implementation plan",
    type: "sequential",
    execute: async (decisions: string) => {
      return AIService.generate(
        decisions,
        "You are a technical project manager.",
        `Create a comprehensive technical blueprint that includes:
         1. Executive Technical Summary
         2. System Architecture
         3. Component Specifications
         4. API Documentation
         5. Security Measures
         6. Implementation Roadmap
         7. Technical Requirements
         8. Performance Considerations
         9. Scalability Plan
         10. Technical Appendices
         
         Format this as a complete technical blueprint document.`
      );
    },
    statusMessage: "Creating detailed implementation plan...",
  })
  // Final Blueprint Assembly
  .goalBased(
    "Blueprint Assembly",
    "Assemble and refine the final technical blueprint",
    async (inputs: string) => {
      return AIService.generate(
        inputs,
        "You are a technical documentation specialist.",
        `Create a comprehensive technical blueprint that includes:
         1. Executive Technical Summary
         2. System Architecture
         3. Component Specifications
         4. API Documentation
         5. Security Measures
         6. Implementation Roadmap
         7. Technical Requirements
         8. Performance Considerations
         9. Scalability Plan
         10. Technical Appendices
         
         Format this as a complete technical blueprint document.`
      );
    },
    async (blueprint: string) => {
      const evaluation = await AIService.generate(
        blueprint,
        "You are a technical review specialist.",
        `Evaluate this technical blueprint's completeness and quality by analyzing:
         1. Technical depth and accuracy
         2. Architecture completeness
         3. Implementation feasibility
         4. Security considerations
         
         Return ONLY a single number between 1-10 representing overall quality.`
      );
      const score = parseFloat(evaluation.replace(/[^\d.]/g, ""));
      return !isNaN(score) && score >= 8.5;
    },
    3,
    "Assembling and refining the final technical blueprint...",
    (blueprint: string) => blueprint
  )
  .onError(
    async (error) => `Error generating technical blueprint: ${error.message}`
  )
  .build();

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) {
    return new Response("Please provide a software concept!", { status: 400 });
  }

  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(techBlueprintFlow), userPrompt);

  return AgentService.createResponse(stream);
}
