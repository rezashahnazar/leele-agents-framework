import { AIService } from "@/backend/services/AIService";
import {
  AgentOrchestrator,
  GameStep,
} from "@/backend/services/AgentOrchestrator";

export const runtime = "edge";

// Define types for our game
type Ingredient = string;
type Recipe = string;

// Define the Smart Chef Awards game flow
const gameFlow = {
  whenReceivingAQuestion: [
    // Chief determines ingredients
    {
      say: "Chef is analyzing the dish and selecting main ingredients...",
      do: async (foodTitle: string): Promise<Ingredient[]> => {
        console.log("Chief analyzing food:", foodTitle);
        const response = await AIService.generateResponse(
          foodTitle,
          `You are a master chef. For the dish "${foodTitle}", list exactly 5 main ingredients. 
           Return ONLY a JSON array of 5 strings, each being an ingredient name.`
        );
        const ingredients = JSON.parse(response) as Ingredient[];
        console.log("Chief selected ingredients:", ingredients);
        return ingredients;
      },
      as: "plan",
      processOutput: (ingredients: Ingredient[]): string =>
        `Chef has selected these main ingredients: ${ingredients.join(", ")}`,
    },

    // Players guess and create recipes (parallel)
    {
      say: "Players are creating their recipes...",
      do: async (ingredient: Ingredient): Promise<Recipe> => {
        console.log("Player received ingredient:", ingredient);
        const response = await AIService.generateResponse(
          ingredient,
          `You are Player #${Math.floor(
            Math.random() * 1000
          )}, a creative chef in our game.
           You've been given ONE main ingredient: "${ingredient}".
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
      as: "result",
      parallel: true,
      getInput: (outputs: any[]): Ingredient[] => {
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
    },

    // Summarizer creates final article
    {
      say: "Creating the final article about our chefs' creations...",
      do: async (recipes: Recipe[]): Promise<string> => {
        console.log("Summarizer received recipes:", recipes.length);
        const response = await AIService.generateResponse(
          JSON.stringify(recipes),
          `You are a food critic writing an entertaining article.
           You've received ${recipes.length} different interpretations from our chef players.
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
      as: "refinement",
      getInput: (outputs: any[]): Recipe[] => {
        const recipes = outputs[1];
        if (!Array.isArray(recipes)) {
          throw new Error(
            `Invalid recipes from players: ${JSON.stringify(recipes)}`
          );
        }
        console.log("Collecting all recipes for summary:", recipes.length);
        return recipes;
      },
    },
  ] satisfies GameStep[],
};

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt)
    return new Response("Please provide a food title!", { status: 400 });

  console.log("Starting Smart Chef Awards game with food:", userPrompt);
  return AgentOrchestrator.process(gameFlow.whenReceivingAQuestion, userPrompt);
}
