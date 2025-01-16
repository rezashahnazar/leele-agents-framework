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
      const response = await AIService.generateResponse(
        concept,
        `You are a senior software architect analyzing a software concept.
         For the given concept: "${concept}", create a structured analysis that includes:
         1. Core problem definition
         2. Target users and stakeholders
         3. Key technical objectives
         4. Success criteria
         5. Initial technical scope
         6. High-level system requirements
         
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
      const response = await AIService.generateResponse(
        analysis,
        `Based on the initial analysis, conduct thorough technical research:
         1. Identify relevant technologies and frameworks
         2. Analyze similar technical solutions
         3. Research best practices and patterns
         4. Identify potential technical challenges
         5. Consider scalability and performance factors
         
         Structure your findings professionally.`
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
        backend: "Detail backend architecture, APIs, databases, and services.",
        frontend:
          "Outline frontend architecture, state management, and UI/UX considerations.",
        infrastructure:
          "Describe infrastructure needs, deployment, and DevOps practices.",
        security:
          "Analyze security requirements, authentication, and data protection.",
        performance:
          "Evaluate performance considerations, optimizations, and scalability.",
      };

      return AIService.generateResponse(
        input.content,
        prompts[input.type] || "Analyze general architectural requirements"
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
      return AIService.generateResponse(
        architectureAnalysis,
        `Based on the architectural analysis, make and document key technical decisions:
         1. Technology stack selection with rationale
         2. Architecture patterns and their justification
         3. Data storage and management approach
         4. API design principles
         5. Security measures
         6. Performance optimization strategies
         
         For each decision:
         - Document the options considered
         - Provide reasoning for the chosen approach
         - List potential trade-offs and mitigations`
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
      return AIService.generateResponse(
        decisions,
        `Create a comprehensive implementation plan including:
         1. Development phases and milestones
         2. Technical dependencies and their order
         3. Required resources and expertise
         4. Potential technical challenges and solutions
         5. Testing and quality assurance approach
         6. Deployment strategy
         
         Present this in a structured, actionable format.`
      );
    },
    statusMessage: "Creating detailed implementation plan...",
  })
  // Final Blueprint Assembly
  .goalBased(
    "Blueprint Assembly",
    "Assemble and refine the final technical blueprint",
    async (inputs: string) => {
      return AIService.generateResponse(
        inputs,
        `Create a professional technical blueprint that includes:
         1. Executive Summary
         2. System Overview
         3. Technical Architecture
         4. Design Decisions and Rationale
         5. Implementation Plan
         6. Security Considerations
         7. Performance Optimizations
         8. Testing Strategy
         9. Deployment Plan
         10. Risk Analysis and Mitigation
         11. Technical Recommendations
         12. Appendices (API specs, data models, etc.)
         
         Format this as a complete, professional technical blueprint document.`
      );
    },
    async (blueprint: string) => {
      const evaluation = await AIService.generateResponse(
        blueprint,
        `Evaluate this technical blueprint's completeness and quality by analyzing:
         1. Technical depth and accuracy
         2. Architectural clarity
         3. Implementation feasibility
         4. Risk coverage
         5. Overall completeness
         
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
