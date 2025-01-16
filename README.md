# Comprehensive Tutorial on Flow-Based Route Implementations

This tutorial provides a detailed explanation of how to create AI-driven flows in various route.ts files and how to build out UI pages and components in a maintainable way. Below, you’ll find guidelines for implementing both the backend (flows) and the frontend (UI) using Tailwind CSS and standard component libraries like shadcn. By the end of this guide, you should have a clear picture of:

- How to set up each route.ts to create and execute your custom flow.
- How steps are built and how data is piped from one step to the next.
- The significance of sequential, parallel, conditional, and goal-based steps.
- Error handling and final responses on the server side.
- Best practices for building UI pages and React components that interface with these flows.

---

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [Project Structure Overview](#project-structure-overview)
3. [Flow Builder Essentials](#flow-builder-essentials)
4. [Step Types Explained](#step-types-explained)
   - [Sequential Steps](#sequential-steps)
   - [Parallel Steps](#parallel-steps)
   - [Conditional Steps](#conditional-steps)
   - [Goal-Based Steps](#goal-based-steps)
5. [Example Routes](#example-routes)
   - [Creative Writer (src/app/api/creative-writer/route.ts)](#creative-writer-route)
   - [Technical Blueprint (src/app/api/tech-blueprint/route.ts)](#technical-blueprint-route)
   - [Smart Chef Awards (src/app/api/smart-chef-awards/route.ts)](#smart-chef-awards-route)
   - [PRD Generator (src/app/api/prd-generator/route.ts)](#prd-generator-route)
   - [Agent (src/app/api/agent/route.ts)](#agent-route)
6. [Error Handling](#error-handling)
7. [UI Implementation (Pages and Components)](#ui-implementation-pages-and-components)
   - [Overall Structure](#overall-structure)
   - [Tailwind & shadcn UI](#tailwind--shadcn-ui)
   - [Example Page with API Call](#example-page-with-api-call)
   - [Best Practices](#best-practices)
8. [Conclusion](#conclusion)

---

## Installation and Setup

1. Make sure you have [pnpm](https://pnpm.io/) installed, as the project uses pnpm for package management.
2. Run the following commands to install dependencies and start the development server:

   ```bash
   pnpm install
   pnpm dev
   ```

3. Tailwind is configured via a tailwind.config.ts file. We recommend using standard components (like shadcn UI components) wherever possible, avoiding global style overrides or custom CSS classes. This best practice ensures a consistent and maintainable UI.

---

## Project Structure Overview

Here are some relevant directories:

- **src/backend**: Contains core logic for building, executing, and managing flows (e.g., FlowBuilder, FlowExecutor).
- **src/app/api**: Contains multiple route.ts files. Each route is responsible for handling an HTTP request and executing a specific AI flow using our FlowBuilder.
- **src/app**: Contains Next.js pages and potentially page-based routes in addition to the API routes for a full-stack approach.
- **src/components**: May contain shared, reusable UI components (e.g., custom inputs, modals, etc.), especially if you’re using shadcn or other design libraries.

Key backend files to note:

- **FlowBuilder** (in src/backend/core/FlowBuilder.ts) helps build a flow definition with steps and error-handling logic.
- **FlowExecutor** (in src/backend/core/FlowExecutor.ts) actually runs the flow steps in order (or parallel).
- **AgentService** and **AgentOrchestrator** coordinate powering each flow via user prompts.
- **route.ts** files (like creative-writer/route.ts) define and expose the flows as endpoints.

---

## Flow Builder Essentials

The FlowBuilder is the main piece for creating a “flow.” Here’s how you typically use it:

```typescript
import { FlowBuilder } from "@/backend/core/FlowBuilder";

const myFlow = new FlowBuilder()
  .name("Flow Name")
  .description("Description of the flow")
  .addStep({
    name: "Step 1",
    description: "Describe step 1",
    type: "sequential",
    execute: async (input: string) => {
      // ...
      return "someResponse";
    },
    statusMessage: "Status shown during step 1...",
  })
  // ... can add more steps
  .onError(async (error) => `Error: ${error.message}`)
  .build();
```

After building your flow, you can convert it to an agent flow and run it with:

```typescript
import { FlowAdapter } from "@/backend/core/FlowAdapter";
import { AgentService } from "@/backend/services/AgentService";

const { stream, executor } = AgentService.createAgentExecutor();
executor.executeFlow(FlowAdapter.toAgentFlow(myFlow), userPrompt);
```

The final result is typically returned as a streaming response to the client.

---

## Step Types Explained

### Sequential Steps

A “sequential” step will run one after the other in the order they’re defined. For example:

```typescript
.addStep({
  name: "Analyze Topic",
  description: "Examine the user topic in detail",
  type: "sequential",
  execute: async (topic: string) => {
    // Some analysis logic
    return "Result of analysis";
  },
  statusMessage: "Analyzing the user topic..."
})
```

### Parallel Steps

A “parallel” step runs multiple tasks simultaneously (or conceptually in parallel) if you supply an array of items. It’s defined using the `.parallel()` method in FlowBuilder:

```typescript
.parallel(
  "Parallel Step",
  "Execute tasks in parallel",
  async (item: string) => {
    // Execute logic for each "item" in parallel
    return `Result for ${item}`;
  },
  (previousOutputs: any[]) => {
    // Return an array of items to be processed in parallel
    return ["task1", "task2", "task3"];
  },
  "Executing tasks in parallel..."
)
```

When the parallel step finishes, it returns an array of results corresponding to each parallel subtask.

### Conditional Steps

Use a “conditional” to branch your flow. If the condition returns true, it executes one set of steps; if false, it executes an alternate set:

```typescript
.conditional(
  "Condition Check",
  "Evaluates some condition to branch the flow",
  async (input: string) => {
    // Return true or false
    return input.toLowerCase().includes("multi");
  },
  // Steps to run if true
  [
    {
      name: "True Path",
      description: "Handle the 'true' scenario",
      type: "sequential",
      execute: async (val: string) => {
        return "Handled True Path";
      },
    },
  ],
  // Steps to run if false
  [
    {
      name: "False Path",
      description: "Handle the 'false' scenario",
      type: "sequential",
      execute: async (val: string) => {
        return "Handled False Path";
      },
    },
  ],
  "Checking condition..."
)
```

### Goal-Based Steps

A “goal-based” step repeats until it achieves a certain threshold or until it hits a maximum attempt count:

```typescript
.goalBased(
  "Evaluation Step",
  "Refine until it meets certain criteria",
  async (data: string) => {
    // Produce a refined version of the data
    return "Refined result";
  },
  async (result: string) => {
    // Evaluate if the result meets the goal
    const score = parseFloat(result); // or some logic
    return score >= 8.5;
  },
  3, // max attempts
  "Refining data until threshold is met..."
)
```

If the goal check returns `true` before hitting the max attempts, it proceeds. Otherwise, it may finalize or raise an error (depending on how you configure it).

---

## Example Routes

Here are a few routes demonstrating how these step types and flows come together.

### Creative Writer Route

Path: **src/app/api/creative-writer/route.ts**

```typescript
import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";

export const runtime = "edge";

const creativeWriterFlow = new FlowBuilder()
  .name("Creative Writer")
  .description(
    "An AI agent that helps write creative stories with multiple perspectives"
  )
  .addStep({
    name: "Topic Analysis",
    description: "Analyze the topic and create a story outline",
    type: "sequential",
    execute: async (topic: string) => {
      const response = await AIService.generateResponse(
        topic,
        `You are a story planner. For the topic "${topic}", create a detailed outline...
         Return the outline in a clear, structured format.`
      );
      return response;
    },
    statusMessage: "Analyzing topic and creating outline...",
  })
  .conditional(
    "Perspective Check",
    "Determine if the story would benefit from multiple perspectives",
    async (outline: string) => {
      const response = await AIService.generateResponse(
        outline,
        `Based on this outline, would this story benefit from multiple character perspectives?
         Return ONLY true or false.`
      );
      return response.toLowerCase().includes("true");
    },
    [
      {
        name: "Multiple Perspectives",
        description:
          "Generate story segments from different character viewpoints",
        type: "sequential",
        execute: async (characterInfo: string) => {
          return AIService.generateResponse(
            characterInfo,
            `Write a story segment from this character's perspective.`
          );
        },
      },
    ],
    [
      {
        name: "Single Narrative",
        description: "Generate a cohesive single-perspective story",
        type: "sequential",
        execute: async (outline: string) => {
          return AIService.generateResponse(
            outline,
            `Write a complete story following this outline.`
          );
        },
      },
    ],
    "Determining optimal narrative structure..."
  )
  .goalBased(
    "Story Refinement",
    "Refine the story until it meets quality standards",
    async (story: string) => {
      return AIService.generateResponse(
        story,
        `Please refine the story for better pacing and characterization.`
      );
    },
    async (story: string) => {
      const evaluation = await AIService.generateResponse(
        story,
        `Evaluate this story's quality from 1-10.`
      );
      const score = parseFloat(evaluation.replace(/[^\d.]/g, ""));
      return !isNaN(score) && score >= 8.5;
    },
    3,
    "Refining the story until it meets quality standards...",
    (story: string) => story
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
```

### Technical Blueprint Route

Path: **src/app/api/tech-blueprint/route.ts**

```typescript
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
  .addStep({
    name: "Concept Analysis",
    description: "Analyze the software concept and create initial structure",
    type: "sequential",
    execute: async (concept: string) => {
      return AIService.generateResponse(
        concept,
        `You are a senior software architect analyzing a software concept...
         Return the analysis in a clear, structured format.`
      );
    },
    statusMessage:
      "Analyzing software concept and creating initial structure...",
  })
  .addStep({
    name: "Technical Research",
    description: "Research technical approaches and best practices",
    type: "sequential",
    execute: async (analysis: string) => {
      return AIService.generateResponse(
        analysis,
        `Based on the initial analysis, conduct thorough technical research...
         Structure your findings professionally.`
      );
    },
    statusMessage: "Researching technical approaches and best practices...",
  })
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
  .addStep({
    name: "Design Decisions",
    description: "Make and document key technical decisions",
    type: "sequential",
    execute: async (analysis: string) => {
      return AIService.generateResponse(
        analysis,
        `Based on the architecture analysis, propose major design decisions...
         Document each decision thoroughly.`
      );
    },
    statusMessage: "Making and documenting key technical decisions...",
  })
  .addStep({
    name: "Implementation Planning",
    description: "Create detailed implementation plan",
    type: "sequential",
    execute: async (decisions: string) => {
      return AIService.generateResponse(
        decisions,
        `Create a comprehensive implementation plan including milestones, resources, timelines...`
      );
    },
    statusMessage: "Creating detailed implementation plan...",
  })
  .goalBased(
    "Blueprint Assembly",
    "Assemble and refine the final technical blueprint",
    async (inputs: string) => {
      return AIService.generateResponse(
        inputs,
        `Create a professional technical blueprint that includes an Executive Summary, System Overview, etc.`
      );
    },
    async (blueprint: string) => {
      const evaluation = await AIService.generateResponse(
        blueprint,
        `Evaluate this technical blueprint's completeness and quality from 1-10.`
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
```

### Smart Chef Awards Route

Path: **src/app/api/smart-chef-awards/route.ts**

```typescript
import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";

export const runtime = "edge";

// Define the Smart Chef Awards game flow
const smartChefFlow = new FlowBuilder()
  .name("Smart Chef Awards")
  .description(
    "A creative cooking game where chefs guess a dish from single ingredients"
  )
  .addStep({
    name: "Ingredient Selection",
    description: "Chef analyzes the dish and selects main ingredients",
    type: "sequential",
    execute: async (foodTitle: string) => {
      const response = await AIService.generateResponse(
        foodTitle,
        `You are a master chef. For the dish "${foodTitle}", list exactly 5 main ingredients
         in a JSON array (no additional text).`
      );
      const ingredients = JSON.parse(response);
      return ingredients;
    },
    statusMessage:
      "Chef is analyzing the dish and selecting main ingredients...",
    outputProcessor: (ingredients: string[]) =>
      `Chef has selected these main ingredients: ${ingredients.join(", ")}`,
  })
  .parallel(
    "Recipe Creation",
    "Players create recipes based on single ingredients",
    async (ingredient: string) => {
      const response = await AIService.generateResponse(
        ingredient,
        `You are a creative chef. Given ONE ingredient "${ingredient}", guess the original dish and create a possible recipe.`
      );
      return response;
    },
    (outputs: any[]) => {
      // The outputs[0] is typically from the previous step. We'll assume it is the array of ingredients
      return outputs[0];
    },
    "Players are creating their recipes..."
  )
  .addStep({
    name: "Article Creation",
    description: "Create a final article about the chefs' creations",
    type: "sequential",
    execute: async (recipes: string[]) => {
      const response = await AIService.generateResponse(
        JSON.stringify(recipes),
        `You are a food critic writing an entertaining article about these chefs and their guessed recipes...
         Make it fun and engaging!`
      );
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

  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(smartChefFlow), userPrompt);

  return AgentService.createResponse(stream);
}
```

Observations:

- Parallel step is used to process each ingredient simultaneously.
- A final sequential step merges everything into one “article.”

### PRD Generator Route

Path: **src/app/api/prd-generator/route.ts**

```typescript
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
  .addStep({
    name: "Requirements Analysis",
    description:
      "Analyze the high-level requirements and create a structured outline",
    type: "sequential",
    execute: async (requirements: string) => {
      const response = await AIService.generateResponse(
        requirements,
        `You are a senior product manager analyzing the requirements. Create a structured analysis that includes
         problem statement, target audience, key objectives, success metrics, etc.`
      );
      return response;
    },
    statusMessage: "Analyzing requirements and creating initial structure...",
  })
  .addStep({
    name: "Market Research",
    description: "Conduct market research and competitive analysis",
    type: "sequential",
    execute: async (analysis: string) => {
      const response = await AIService.generateResponse(
        analysis,
        `Based on the initial analysis, conduct a thorough market research...
         Return structured findings.`
      );
      return response;
    },
    statusMessage: "Conducting market research and competitive analysis...",
  })
  .parallel(
    "Feature Analysis",
    "Break down features and analyze them in parallel",
    async (input: { type: string; content: string }) => {
      const prompts: Record<string, string> = {
        functional: "Detail the core functional requirements, user flows, etc.",
        technical: "Outline technical architecture, system requirements...",
        ux: "Describe user experience goals and design principles.",
        security:
          "Analyze security requirements and compliance considerations.",
      };
      return AIService.generateResponse(
        input.content,
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
  .addStep({
    name: "Integration Planning",
    description: "Create implementation timeline and integration plan",
    type: "sequential",
    execute: async (features: string) => {
      return AIService.generateResponse(
        features,
        `Create a comprehensive implementation plan including phases, resource requirements, etc.`
      );
    },
    statusMessage: "Creating implementation plan and timeline...",
  })
  .goalBased(
    "PRD Assembly",
    "Assemble and refine the final PRD document",
    async (inputs: string) => {
      return AIService.generateResponse(
        inputs,
        `Create a professional PRD document that includes all typical sections.`
      );
    },
    async (prd: string) => {
      const evaluation = await AIService.generateResponse(
        prd,
        `Evaluate this PRD's completeness and quality from 1-10.`
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
```

Key takeaways:

- Parallel steps break down feature analysis.
- A goal-based step refines the PRD until it meets a certain score.

### Agent Route

Path: **src/app/api/agent/route.ts**

```typescript
import { AIService } from "@/backend/services/AIService";
import { AgentOrchestrator } from "@/backend/services/AgentOrchestrator";

export const runtime = "edge";

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
    // more steps here
  ],
};

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) return new Response("Missing user prompt", { status: 400 });

  return AgentOrchestrator.process(agent.whenReceivingAQuestion, userPrompt);
}
```

This shows a simpler approach with a set of steps defined in an array. Each step has a `say`, `do`, and `as` property. The `AgentOrchestrator` runs them in sequence.

---

## Error Handling

Each route uses an `.onError(...)` method or a top-level catch in its flow pipeline. If an error is thrown during any step, FlowBuilder can forward the error message. For example:

```typescript
.onError(async (error) => `Sorry, there was an error: ${error.message}`)
```

This ensures the user receives a graceful response in case something goes wrong.

---

## UI Implementation (Pages and Components)

In addition to creating flows on the server side, you’ll typically build frontend pages and components to allow users to input prompts and receive streaming AI responses.

### Overall Structure

We use a Next.js 13+ App Router structure where each page is defined in the `src/app` directory. For example:

- `src/app/page.tsx` might be the homepage.
- `src/app/dashboard/page.tsx` might be a dashboard.
- Additional API calls can be made using fetch or Axios to the routes you defined in `src/app/api/...`.

### Tailwind & shadcn UI

To maintain consistency:

1. We rely on our `tailwind.config.ts` for configuration, ensuring we do not override global styles unnecessarily.
2. We prefer using shadcn UI components (or any standard library components) to keep a consistent design language.
3. Avoid writing custom CSS classes unless absolutely necessary. Instead, leverage Tailwind utilities and pre-built or composable shadcn components. For instance:

```tsx
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Our AI App</h1>
      <Button variant="default" onClick={() => alert("Hello!")}>
        Click Me
      </Button>
    </main>
  );
}
```

### Example Page with API Call

Suppose you want a page that prompts the user for a story topic and then calls the Creative Writer route:

```tsx
"use client";

import { useState } from "react";

export default function WriteStoryPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");

  async function handleGenerateStory() {
    // Make a POST request to the creative-writer route
    const response = await fetch("/api/creative-writer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt: topic }),
    });

    if (!response.body) {
      setResult("No response stream available.");
      return;
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let storyContent = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        storyContent += decoder.decode(value);
        setResult(storyContent);
      }
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Write a Creative Story</h2>
      <input
        type="text"
        placeholder="Enter a topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="border border-gray-300 rounded p-2 w-full mb-4"
      />
      <button
        onClick={handleGenerateStory}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Story
      </button>
      <div className="mt-4 whitespace-pre-wrap">
        {result || "Your story will appear here..."}
      </div>
    </div>
  );
}
```

Notes:

- We’re streaming the AI response from the server by reading the response body in chunks.
- We’re using a minimal custom CSS approach, mostly relying on Tailwind classes.

### Best Practices

1. Keep your UI code minimal and delegate logic to your flows on the backend.
2. For complex forms, leverage shadcn UI form components (like Input, Select, etc.) or other standard libraries.
3. Keep layout consistent by using Layout components in Next.js—avoid global CSS or random global overrides.
4. Use streaming responses where possible to provide real-time feedback to the user.
5. For major content sections, consider reusable patterns—like a “PromptForm” component that abstracts away the fetch and streaming for multiple pages.

---

## Conclusion

By following these patterns, you can create fully customized flows that handle various AI tasks—whether it’s creative writing, technical blueprint generation, cooking games, or product requirement documents—while providing a consistent and delightful user interface. The FlowBuilder allows you to combine sequential, parallel, conditional, and goal-based steps with ease, and you can expand further by adding your own step types or custom logic.

On the frontend, sticking to Tailwind’s utility classes and standard shadcn UI components will keep your styling clean and maintainable. Each UI page can easily tie into the AI endpoints you create, enabling users to input prompts and receive streaming AI responses with minimal boilerplate.

Use the references to each route.ts file as a guide on structuring your flows and the UI examples as a guide for building pages in Next.js with streaming AI responses. Together, these form a powerful full-stack AI application architecture that is extensible, reliable, and easy to maintain.
