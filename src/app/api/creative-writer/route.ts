import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";

export const runtime = "edge";

// Define the Creative Writer flow that demonstrates all capabilities
const creativeWriterFlow = new FlowBuilder()
  .name("Creative Writer")
  .description(
    "An AI agent that helps write creative stories with multiple perspectives"
  )
  // First step: Analyze the topic and create an outline
  .addStep({
    name: "Topic Analysis",
    description: "Analyze the topic and create a story outline",
    type: "sequential",
    execute: async (topic: string) => {
      const response = await AIService.generateResponse(
        topic,
        `You are a story planner. For the topic "${topic}", create a detailed outline.
         Include:
         1. Main plot points
         2. Key characters
         3. Setting details
         4. Potential themes
         
         Return the outline in a clear, structured format.`
      );
      return response;
    },
    statusMessage: "Analyzing topic and creating outline...",
  })
  // Conditional step: Determine if the story needs multiple perspectives
  .conditional(
    "Perspective Check",
    "Determine if the story would benefit from multiple perspectives",
    async (outline: string) => {
      const response = await AIService.generateResponse(
        outline,
        `Based on this outline, would this story benefit from multiple character perspectives?
         Consider:
         1. Plot complexity
         2. Number of key characters
         3. Potential for conflicting viewpoints
         
         Return ONLY true or false.`
      );
      return response.toLowerCase().includes("true");
    },
    // If true: Generate multiple character perspectives in parallel
    [
      {
        name: "Multiple Perspectives",
        description:
          "Generate story segments from different character viewpoints",
        type: "sequential",
        execute: async (characterInfo: string) => {
          return AIService.generateResponse(
            characterInfo,
            `Write a story segment from this character's perspective.
             Make it emotional and personal to their viewpoint.`
          );
        },
      },
    ],
    // If false: Generate a single narrative
    [
      {
        name: "Single Narrative",
        description: "Generate a cohesive single-perspective story",
        type: "sequential",
        execute: async (outline: string) => {
          return AIService.generateResponse(
            outline,
            `Write a complete story following this outline.
             Focus on creating a strong, unified narrative voice.`
          );
        },
      },
    ],
    "Determining optimal narrative structure..."
  )
  // Goal-based step: Refine the story until it meets quality criteria
  .goalBased(
    "Story Refinement",
    "Refine the story until it meets quality standards",
    async (story: string) => {
      // Check if the story is already in string format
      const storyText =
        typeof story === "object" ? JSON.stringify(story) : story;
      return AIService.generateResponse(
        storyText,
        `Improve this story by:
         1. Enhancing descriptive language
         2. Strengthening character motivations
         3. Tightening plot coherence
         
         Return the complete improved story as a single cohesive narrative.`
      );
    },
    async (story: string) => {
      const evaluation = await AIService.generateResponse(
        story,
        `Evaluate this story's quality by analyzing:
         1. Descriptive language
         2. Character development
         3. Plot coherence
         
         Return ONLY a single number between 1-10 representing the overall quality.`
      );
      const score = parseFloat(evaluation.replace(/[^\d.]/g, ""));
      return !isNaN(score) && score >= 8.5;
    },
    3,
    "Refining story for optimal quality...",
    (story: string) => story
  )
  // Parallel step: Generate complementary content
  .parallel(
    "Complementary Content",
    "Generate additional content to enhance the story",
    async (input: { type: string; content: string }) => {
      try {
        const content =
          typeof input.content === "object"
            ? JSON.stringify(input.content)
            : input.content;

        let prompt = "";
        switch (input.type) {
          case "summary":
            prompt = `Create a compelling one-paragraph summary of this story:\n\n${content}`;
            break;
          case "title":
            prompt = `Generate an engaging title for this story (return ONLY the title, no additional text):\n\n${content}`;
            break;
          case "themes":
            prompt = `List the main themes present in this story (return as a bulleted list):\n\n${content}`;
            break;
          default:
            throw new Error(`Unknown content type: ${input.type}`);
        }

        const response = await AIService.generateResponse(content, prompt);
        return { type: input.type, result: response };
      } catch (error) {
        console.error(`Error generating ${input.type}:`, error);
        return {
          type: input.type,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    (outputs: any[]) => {
      // Get the last successful output (the story)
      const finalStory = outputs[outputs.length - 1];
      const storyContent =
        typeof finalStory === "object"
          ? JSON.stringify(finalStory)
          : finalStory;

      // Create an array of tasks
      return [
        { type: "summary", content: storyContent },
        { type: "title", content: storyContent },
        { type: "themes", content: storyContent },
      ];
    },
    "Generating complementary content...",
    (results) => {
      try {
        // Ensure we have an array of results by wrapping single result in array if needed
        const resultsArray = Array.isArray(results) ? results : [results];

        // Collect all successful results
        const validResults = resultsArray.filter(
          (result) =>
            result &&
            typeof result === "object" &&
            "type" in result &&
            "result" in result &&
            !("error" in result)
        );

        if (validResults.length === 0) {
          console.warn("No valid results to format");
          return "No valid complementary content was generated.";
        }

        // Sort results by type to ensure consistent order
        validResults.sort((a, b) => {
          const order: Record<string, number> = {
            title: 1,
            summary: 2,
            themes: 3,
          };
          return (
            (order[a.type as keyof typeof order] || 99) -
            (order[b.type as keyof typeof order] || 99)
          );
        });

        // Format each type of content appropriately
        const formattedSections = validResults.map((result) => {
          const content = result.result.trim();

          switch (result.type) {
            case "title":
              // Extract just the title text, removing any markdown or extra formatting
              const titleMatch = content.match(/[*#\s]*([^*#\n]+)/);
              return `Title: ${titleMatch ? titleMatch[1].trim() : content}`;
            case "summary":
              return `Summary:\n${content}`;
            case "themes":
              // Clean up theme formatting
              const cleanThemes = content
                .replace(/\*\*/g, "") // Remove bold markers
                .replace(/###[^#\n]*\n/, "") // Remove theme headers
                .replace(/^[#\s]*Themes[^:]*:/, "") // Remove theme headers
                .trim();
              return `Themes:\n${cleanThemes}`;
            default:
              return `${result.type}:\n${content}`;
          }
        });

        // Join sections with double newlines and clean up any extra whitespace
        return formattedSections
          .join("\n\n")
          .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
          .trim();
      } catch (error) {
        console.error("Error formatting results:", error);
        return error instanceof Error
          ? `Error formatting results: ${error.message}`
          : "Error formatting complementary content results";
      }
    }
  )
  .onError(
    async (error) =>
      `Sorry, there was an error in the creative process: ${error.message}`
  )
  .build();

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) {
    return new Response("Please provide a story topic!", { status: 400 });
  }

  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(creativeWriterFlow), userPrompt);

  return AgentService.createResponse(stream);
}
