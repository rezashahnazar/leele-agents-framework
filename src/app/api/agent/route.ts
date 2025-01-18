import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";
import { FlowContext } from "@/backend/types/flow";

export const runtime = "edge";

const EVALUATION_PROMPT = `Please evaluate the response based on the following criteria:

[CRITERIA EVALUATION]
For each criterion, use EXACTLY one of these symbols followed by your explanation:
[✓] = Full points
[~] = Half points
[✗] = Zero points

1. Completeness (2.00): Are all aspects of the question covered?
2. Accuracy (2.00): Is the provided information accurate and correct?
3. Structure (1.00): Does the response have a logical and coherent structure?
4. Clarity (1.00): Is the response expressed in simple and understandable language?
5. Practicality (1.00): Does the response provide practical and implementable solutions?
6. Examples (1.00): Are appropriate examples used to clarify the topic?
7. Context (1.00): Are the necessary context and conditions explained?
8. Details (0.50): Are sufficient details provided for deep understanding?
9. Coherence (0.25): Is there a logical connection between parts?
10. Engagement (0.25): Is the response engaging and interesting?

[SCORING CALCULATION]
Show your work:
1. Completeness: [symbol] = X.XX
2. Accuracy: [symbol] = X.XX
3. Structure: [symbol] = X.XX
4. Clarity: [symbol] = X.XX
5. Practicality: [symbol] = X.XX
6. Examples: [symbol] = X.XX
7. Context: [symbol] = X.XX
8. Details: [symbol] = X.XX
9. Coherence: [symbol] = X.XX
10. Engagement: [symbol] = X.XX

Total Score = X.XX

[FINAL_SCORE]
{score: X.XX}

[SUGGESTIONS]
If the score is less than 7.00, provide specific suggestions for improvement.`;

const agentFlow = new FlowBuilder()
  .name("Smart Assistant")
  .description(
    "An intelligent assistant that processes questions in a structured manner"
  )
  .addStep({
    name: "Analysis",
    description: "Analyze and plan the response",
    type: "sequential",
    execute: async (input: string, { sendMessage, messageId }: FlowContext) => {
      console.log("Analysis input:", input);
      await sendMessage("status", "Creating plan...", messageId);

      const question = typeof input === "string" ? input : "";

      const plan = await AIService.generateStream(
        question,
        "You are a planning assistant. Break down the user's request into clear and executable steps.",
        `Create a detailed plan to answer this question: "${question}"`,
        "generate plan",
        async (chunk) => {
          await sendMessage("plan", chunk, messageId);
        }
      );

      const result = { question, plan };
      console.log("Analysis output:", result);
      return result;
    },
    outputProcessor: (output: any) => {
      console.log("Analysis outputProcessor input:", output);
      if (!output || typeof output !== "object") {
        return { question: "", plan: "" };
      }
      const processed = {
        question: output.question || "",
        plan: output.plan || "",
      };
      console.log("Analysis outputProcessor output:", processed);
      return processed;
    },
    statusMessage: "Analyzing your request...",
  })
  .goalBased(
    "Response",
    "Generate and improve response until quality standards are met",
    async (
      input:
        | { question: string; plan: string }
        | {
            question: string;
            response: string;
            evaluation?: string;
            plan?: string;
          },
      { sendMessage, messageId }: FlowContext
    ) => {
      console.log("Response execute input:", input);

      const generateUniqueId = () => `${messageId}-${Date.now()}`;
      const maxAttempts = 3;
      let attempts = 0;

      if (typeof input === "string") {
        throw new Error(
          "Input must be an object containing question and plan."
        );
      }

      const question = input.question || "";

      if ("response" in input && input.evaluation) {
        const refinementId = generateUniqueId();
        await sendMessage("status", "Refining response...", refinementId);
        const refinedResponse = await AIService.generateStream(
          `${question}\n${input.response}`,
          "You are a refinement assistant. Analyze the current response and improve it based on the improvement suggestions.",
          `Original question: "${question}"\nCurrent response: ${input.response}\nImprovement suggestions: ${input.evaluation}\n\nImprove this response while maintaining structure and applying the suggested improvements.`,
          "generate refinement",
          async (chunk) => {
            await sendMessage("refinement", chunk, refinementId);
          }
        );

        const evaluationId = generateUniqueId();
        await sendMessage("status", "Evaluating response...", evaluationId);
        const evaluation = await AIService.generateStream(
          refinedResponse,
          `You are a very strict evaluator. Your standards are very high. You MUST follow the exact scoring format.`,
          `Original question: "${question}"
Current response: ${refinedResponse}

${EVALUATION_PROMPT}`,
          "evaluate response",
          async (chunk) => {
            await sendMessage("evaluation", chunk, evaluationId);
          }
        );

        attempts++;

        let completionReason = "";
        if (attempts >= maxAttempts) {
          completionReason = "Maximum number of improvement attempts reached.";
        } else {
          completionReason =
            "Response reached desired quality and needed no improvement.";
        }

        return {
          question,
          response: refinedResponse,
          evaluation,
          messageId: refinementId,
          evaluationId,
        };
      }

      if (!("plan" in input)) {
        throw new Error("A plan is required to generate the initial response");
      }

      const responseId = generateUniqueId();
      await sendMessage("status", "Generating response...", responseId);
      const response = await AIService.generateStream(
        question,
        "You are a knowledgeable assistant. Provide accurate and complete responses.",
        `Question: "${question}"\nPlan: ${input.plan}\n\nPlease provide a comprehensive response following this plan.`,
        "generate response",
        async (chunk) => {
          await sendMessage("result", chunk, responseId);
        }
      );

      const evaluationId = generateUniqueId();
      await sendMessage("status", "Evaluating response...", evaluationId);

      const evaluation = await AIService.generateStream(
        response,
        `You are a very strict evaluator. Your standards are very high. You MUST follow the exact scoring format.`,
        `Original question: "${question}"
Current response: ${response}

${EVALUATION_PROMPT}`,
        "evaluate response",
        async (chunk) => {
          await sendMessage("evaluation", chunk, evaluationId);
        }
      );

      attempts++;

      let completionReason = "";
      if (attempts >= maxAttempts) {
        completionReason = "Maximum number of improvement attempts reached.";
      } else {
        completionReason =
          "Response reached desired quality and needed no improvement.";
      }

      return {
        question,
        response,
        evaluation,
        messageId: responseId,
        evaluationId,
        completionReason,
        attempts,
      };
    },
    async (
      result: {
        question: string;
        response: string;
        evaluation: string;
        messageId: string;
        evaluationId: string;
        completionReason: string;
        attempts: number;
      },
      { sendMessage, messageId }: FlowContext
    ) => {
      console.log("Response evaluator input:", result);

      const scoreMatch = result.evaluation.match(/\{score:\s*(\d+\.\d{2})\}/);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

      console.log("Response evaluator output:", {
        score,
        evaluation: result.evaluation,
      });

      return score >= 7.0;
    },
    3,
    "Generating and improving response...",
    (output: any) => {
      console.log("Response outputProcessor input:", output);
      if (!output || typeof output !== "object") {
        return {
          question: "",
          response: "",
          evaluation: "",
          messageId: "",
          evaluationId: "",
          completionReason: "",
          attempts: 0,
        };
      }
      return {
        question: output.question || "",
        response: output.response || "",
        evaluation: output.evaluation || "",
        messageId: output.messageId || "",
        evaluationId: output.evaluationId || "",
        completionReason: output.completionReason || "",
        attempts: output.attempts || 0,
      };
    }
  )
  .onError(async (error) => `Error processing request: ${error.message}`)
  .build();

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) return new Response("Missing user prompt", { status: 400 });

  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(agentFlow), userPrompt);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}
