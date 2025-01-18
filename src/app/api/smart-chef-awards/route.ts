import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";

export const runtime = "edge";

// Define the Smart Chef Awards game flow using our new builder
const smartChefFlow = new FlowBuilder()
  .name("Smart Chef Awards")
  .description(
    "A creative cooking game where chefs guess a dish from single ingredients"
  )
  // Chief determines ingredients
  .addStep({
    name: "Ingredient Selection",
    description: "Chef analyzes the dish and selects main ingredients",
    type: "sequential",
    execute: async (foodTitle: string) => {
      console.log("Chief analyzing food:", foodTitle);
      const response = await AIService.generate(
        foodTitle,
        "You are a master chef.",
        `For the dish "${foodTitle}", list exactly 5 main ingredients. 
         Return ONLY a JSON array of 5 strings, each being an ingredient name.`
      );
      const ingredients = JSON.parse(response);
      console.log("Chief selected ingredients:", ingredients);
      return ingredients;
    },
    statusMessage:
      "Chef is analyzing the dish and selecting main ingredients...",
    outputProcessor: (ingredients: string[]) =>
      `Chef has selected these main ingredients: ${ingredients.join(", ")}`,
  })
  // Players create recipes in parallel
  .parallel(
    "Recipe Creation",
    "Players create recipes based on single ingredients",
    async (ingredient: string) => {
      console.log("Player received ingredient:", ingredient);
      const response = await AIService.generate(
        ingredient,
        `You are Player #${Math.floor(
          Math.random() * 1000
        )}, a creative chef in our game.`,
        `You've been given ONE main ingredient: "${ingredient}".
         Create a recipe that you think might be the original dish this ingredient came from.
         
         Include:
         1. Your guess of what the original dish might be
         2. A creative recipe using "${ingredient}" as a key ingredient
         3. Why you think this could be the original dish

         Be creative and have fun with your interpretation!`
      );
      console.log(`Player finished recipe for ingredient: ${ingredient}`);
      return response;
    },
    (outputs: any[]) => {
      const ingredients = outputs[0];
      console.log("Raw ingredients from Chief:", ingredients);
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error(
          `Invalid ingredients from Chief: ${JSON.stringify(ingredients)}`
        );
      }
      console.log("Distributing ingredients to players:", ingredients);
      return ingredients;
    },
    "Players are creating their recipes..."
  )
  // Summarizer creates final article
  .addStep({
    name: "Article Creation",
    description: "Create a final article about the chefs' creations",
    type: "sequential",
    execute: async (recipes: string[]) => {
      console.log("Summarizer received recipes:", recipes.length);
      const response = await AIService.generate(
        JSON.stringify(recipes),
        "You are a food critic writing an entertaining article.",
        `You've received ${recipes.length} different interpretations from our chef players.
         Each chef only knew ONE main ingredient and had to guess the original dish!
         
         Write a fun and engaging article that:
         1. Highlights the creativity of each chef
         2. Compares their different guesses
         3. Notes any interesting patterns or unique approaches
         4. Makes it entertaining for readers

         Make it fun and engaging!`
      );
      console.log("Summary created");
      return response;
    },
    statusMessage: "Creating the final article about our chefs' creations...",
  })
  .onError(async (error) => `Game error: ${error.message}`)
  .build();

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) {
    return new Response("Please provide a food title!", { status: 400 });
  }

  console.log("Starting Smart Chef Awards game with food:", userPrompt);
  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(smartChefFlow), userPrompt);

  return AgentService.createResponse(stream);
}
