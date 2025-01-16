# Leele Agentic Flow Framework

<div align="center">
  <img src="docs/assets/logo.png" alt="Leele Agentic Flow Logo" width="200"/>
  <h3>Build Complex AI Agent Workflows with Ease</h3>
  <p>A powerful and flexible TypeScript framework for creating sophisticated AI agent workflows with sequential, parallel, conditional, and goal-based execution capabilities.</p>
</div>

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

## 📚 Table of Contents

- [Introduction](#-introduction)
  - [Why Leele?](#why-leele)
  - [Key Features](#key-features)
  - [When to Use](#when-to-use)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
- [Core Concepts](#-core-concepts)
  - [Flow Architecture](#flow-architecture)
  - [Step Types](#step-types)
  - [Data Flow](#data-flow)
  - [Error Handling](#error-handling)
- [Tutorials](#-tutorials)
  - [Basic Flow Creation](#basic-flow-creation)
  - [Advanced Flow Patterns](#advanced-flow-patterns)
  - [Real-World Examples](#real-world-examples)
- [API Reference](#-api-reference)
- [Advanced Topics](#-advanced-topics)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Introduction

### Why Leele?

Leele Agentic Flow Framework solves common challenges in building AI agent workflows:

- **Complexity Management**: Break down complex AI tasks into manageable, reusable steps
- **Flow Control**: Handle branching logic, parallel processing, and iterative refinement
- **Error Resilience**: Built-in error handling and recovery mechanisms
- **Scalability**: From simple sequential flows to complex distributed workflows
- **Type Safety**: Full TypeScript support with comprehensive type definitions

### Key Features

#### 🔄 Sequential Processing

Execute tasks in a defined order with clear data flow:

```typescript
const sequentialFlow = new FlowBuilder()
  .name("Data Processing")
  .addStep({
    name: "Data Validation",
    execute: async (input) => validateData(input),
  })
  .addStep({
    name: "Data Transformation",
    execute: async (input) => transformData(input),
  })
  .build();
```

#### ⚡ Parallel Processing

Run multiple tasks concurrently for improved performance:

```typescript
const parallelFlow = new FlowBuilder()
  .parallel(
    "Batch Processing",
    "Process multiple items concurrently",
    async (item) => {
      const result = await processItem(item);
      return { id: item.id, result };
    },
    (outputs) =>
      outputs.map((item) => ({
        type: "processed",
        content: item,
      })),
    "Processing batch items..."
  )
  .build();
```

#### 🔀 Smart Branching

Make intelligent decisions based on dynamic conditions:

```typescript
const smartFlow = new FlowBuilder()
  .conditional(
    "Content Analysis",
    "Choose processing path based on content type",
    async (content) => {
      const type = await analyzeContentType(content);
      return type === "text";
    },
    [
      // Text processing steps
      {
        name: "Text Analysis",
        execute: async (text) => analyzeText(text),
      },
    ],
    [
      // Non-text processing steps
      {
        name: "Media Analysis",
        execute: async (media) => analyzeMedia(media),
      },
    ]
  )
  .build();
```

#### 🎯 Goal-Based Iteration

Refine outputs until they meet quality criteria:

```typescript
const qualityFlow = new FlowBuilder()
  .goalBased(
    "Content Optimization",
    "Refine content until quality threshold met",
    async (content) => {
      const improved = await improveContent(content);
      return improved;
    },
    async (result) => {
      const quality = await assessQuality(result);
      return quality >= 0.85;
    },
    3,
    "Optimizing content quality..."
  )
  .build();
```

### When to Use

Leele is ideal for:

- **AI Agent Orchestration**: Coordinate multiple AI models and services
- **Content Generation Pipelines**: Multi-stage content creation and refinement
- **Data Processing Workflows**: Complex data transformation and analysis
- **Decision Systems**: Intelligent branching based on AI analysis
- **Quality Assurance**: Iterative improvement with quality checks

## 🏁 Getting Started

### Prerequisites

- Node.js 16.x or higher
- TypeScript 4.9.x or higher
- pnpm (recommended) or npm

### Installation

```bash
# Using pnpm (recommended)
pnpm add leele-agents-framework

# Using npm
npm install leele-agents-framework
```

### Quick Start

1. **Create a Simple Flow**

```typescript
import { FlowBuilder } from "leele-agents-framework";

// Create a basic text processing flow
const textFlow = new FlowBuilder()
  .name("Text Processor")
  .description("Process and analyze text input")
  .addStep({
    name: "Text Analysis",
    execute: async (text: string) => {
      return {
        wordCount: text.split(/\s+/).length,
        sentiment: await analyzeSentiment(text),
      };
    },
  })
  .build();
```

2. **Execute the Flow**

```typescript
import { FlowExecutor } from "leele-agents-framework";

const executor = new FlowExecutor();
const result = await executor.executeFlow(textFlow, "Sample text input");
console.log(result);
```

## 🎓 Core Concepts

### Flow Architecture

A Flow in Leele consists of:

1. **Flow Container**: The main workflow definition
2. **Steps**: Individual processing units
3. **Data Pipeline**: Input/output flow between steps
4. **Error Handlers**: Recovery mechanisms
5. **Status Updates**: Progress monitoring

```typescript
interface Flow {
  name: string;
  description?: string;
  steps: Step[];
  onError?: ErrorHandler;
  metadata?: Record<string, any>;
}

interface Step {
  name: string;
  type: StepType;
  execute: ExecuteFunction;
  statusMessage?: string;
}
```

### Step Types

#### Sequential Steps

Basic building blocks executed in order:

```typescript
.addStep({
  name: "Basic Processing",
  type: "sequential",
  execute: async (input) => {
    // Process input
    return output;
  },
  statusMessage: "Processing..."
})
```

#### Parallel Steps

For concurrent execution:

```typescript
.parallel(
  "Batch Processing",
  "Process items concurrently",
  // Process function
  async (item) => processItem(item),
  // Items generator
  (outputs) => items.map(item => ({
    type: "item",
    content: item
  })),
  "Processing batch..."
)
```

#### Conditional Steps

For dynamic branching:

```typescript
.conditional(
  "Content Router",
  "Route based on content type",
  // Condition function
  async (input) => isTextContent(input),
  // True path
  [textProcessingSteps],
  // False path
  [mediaProcessingSteps],
  "Evaluating content..."
)
```

#### Goal-Based Steps

For iterative refinement:

```typescript
.goalBased(
  "Quality Optimizer",
  "Optimize until quality met",
  // Improvement function
  async (content) => improve(content),
  // Goal check function
  async (result) => checkQuality(result) >= threshold,
  maxAttempts,
  "Optimizing...",
  // Final processor
  (result) => result
)
```

### Data Flow

Data flows through steps following these patterns:

1. **Sequential Flow**:

```
Input -> Step 1 -> Step 2 -> ... -> Step N -> Output
```

2. **Parallel Flow**:

```
          -> Step 1A ->
Input ->  -> Step 1B ->  -> Combine -> Output
          -> Step 1C ->
```

3. **Conditional Flow**:

```
          -> True Path  ->
Input ->                  -> Output
          -> False Path ->
```

4. **Goal-Based Flow**:

```
Input -> Process -> Check Goal -> (Repeat if needed) -> Output
```

### Error Handling

Comprehensive error handling at multiple levels:

```typescript
const robustFlow = new FlowBuilder()
  // Step-level error handling
  .addStep({
    name: "Risky Operation",
    execute: async (input) => {
      try {
        return await riskyOperation(input);
      } catch (error) {
        return fallbackOperation(input);
      }
    },
  })
  // Flow-level error handling
  .onError(async (error) => {
    console.error("Flow error:", error);
    await notifyAdmin(error);
    return defaultOutput;
  })
  .build();
```

## 📖 Tutorials

### Basic Flow Creation

1. **Simple Text Processing Flow**

```typescript
const textProcessor = new FlowBuilder()
  .name("Text Processor")
  .addStep({
    name: "Cleanup",
    execute: async (text) => text.trim(),
  })
  .addStep({
    name: "Analysis",
    execute: async (text) => ({
      length: text.length,
      words: text.split(/\s+/).length,
    }),
  })
  .build();
```

2. **Content Generation Flow**

```typescript
const contentGenerator = new FlowBuilder()
  .name("Content Generator")
  .addStep({
    name: "Topic Analysis",
    execute: async (topic) => analyzeTopic(topic),
  })
  .goalBased(
    "Content Creation",
    "Generate high-quality content",
    async (outline) => generateContent(outline),
    async (content) => evaluateQuality(content) >= 0.8,
    3
  )
  .build();
```

### Advanced Flow Patterns

1. **Multi-Stage Processing**

```typescript
const multiStageFlow = new FlowBuilder()
  .name("Multi-Stage Processor")
  // Stage 1: Data Collection
  .parallel(
    "Data Collection",
    "Collect data from multiple sources",
    async (source) => fetchData(source),
    (outputs) =>
      dataSources.map((source) => ({
        type: "source",
        content: source,
      }))
  )
  // Stage 2: Data Validation
  .conditional(
    "Validation",
    "Validate collected data",
    async (data) => validateData(data),
    [
      // Valid data path
      {
        name: "Process Valid Data",
        execute: async (data) => processValidData(data),
      },
    ],
    [
      // Invalid data path
      {
        name: "Handle Invalid Data",
        execute: async (data) => handleInvalidData(data),
      },
    ]
  )
  // Stage 3: Results Optimization
  .goalBased(
    "Optimization",
    "Optimize results",
    async (results) => optimizeResults(results),
    async (results) => checkOptimizationQuality(results) >= 0.9,
    5
  )
  .build();
```

2. **Error Recovery Flow**

```typescript
const recoveryFlow = new FlowBuilder()
  .name("Error Recovery Flow")
  .addStep({
    name: "Main Operation",
    execute: async (input) => {
      try {
        return await mainOperation(input);
      } catch (error) {
        throw new RecoverableError(error);
      }
    },
  })
  .conditional(
    "Error Check",
    "Check for errors",
    async (result) => result instanceof RecoverableError,
    [
      // Error recovery path
      {
        name: "Recovery",
        execute: async (error) => recoverFromError(error),
      },
    ],
    [
      // Success path
      {
        name: "Success",
        execute: async (result) => processSuccess(result),
      },
    ]
  )
  .onError(async (error) => {
    if (error instanceof RecoverableError) {
      return await attemptRecovery(error);
    }
    throw error;
  })
  .build();
```

### Real-World Examples

1. **AI Content Creation Pipeline**

```typescript
const contentPipeline = new FlowBuilder()
  .name("AI Content Pipeline")
  // Step 1: Topic Analysis
  .addStep({
    name: "Topic Analysis",
    execute: async (topic) => {
      const analysis = await analyzeTopicDepth(topic);
      return {
        mainTopics: analysis.topics,
        targetAudience: analysis.audience,
        complexity: analysis.complexity,
      };
    },
  })
  // Step 2: Parallel Research
  .parallel(
    "Research",
    "Gather information from multiple sources",
    async (topic) => {
      const sources = await researchTopic(topic);
      return {
        topic,
        sources,
        timestamp: Date.now(),
      };
    },
    (analysis) =>
      analysis.mainTopics.map((topic) => ({
        type: "research",
        content: topic,
      }))
  )
  // Step 3: Content Generation
  .goalBased(
    "Content Generation",
    "Generate and refine content",
    async (research) => {
      const content = await generateContent(research);
      return {
        content,
        metadata: {
          sources: research.sources,
          generated: Date.now(),
        },
      };
    },
    async (result) => {
      const quality = await assessContentQuality(result.content);
      return quality.score >= 0.85;
    },
    3
  )
  // Step 4: Final Processing
  .addStep({
    name: "Final Processing",
    execute: async (content) => {
      const processed = await formatContent(content);
      return {
        ...processed,
        timestamp: Date.now(),
        version: "1.0",
      };
    },
  })
  .onError(async (error) => {
    await logError(error);
    return {
      error: true,
      message: error.message,
      timestamp: Date.now(),
    };
  })
  .build();
```

## 🔧 Advanced Topics

### Custom Step Types

Create your own step types:

```typescript
interface CustomStep extends BaseStep {
  type: "custom";
  customConfig: any;
}

const customFlow = new FlowBuilder()
  .addCustomStep({
    type: "custom",
    customConfig: {
      // Custom configuration
    },
    execute: async (input) => {
      // Custom execution logic
    },
  })
  .build();
```

### Flow Composition

Combine multiple flows:

```typescript
const subFlow1 = new FlowBuilder()
  .name("Sub Flow 1")
  // ... sub flow 1 steps
  .build();

const subFlow2 = new FlowBuilder()
  .name("Sub Flow 2")
  // ... sub flow 2 steps
  .build();

const compositeFlow = new FlowBuilder()
  .name("Composite Flow")
  .addFlow(subFlow1)
  .addFlow(subFlow2)
  .build();
```

### Middleware Integration

Add middleware for cross-cutting concerns:

```typescript
const withLogging = (flow: Flow): Flow => ({
  ...flow,
  steps: flow.steps.map((step) => ({
    ...step,
    execute: async (input) => {
      console.log(`Executing ${step.name}`);
      const result = await step.execute(input);
      console.log(`Completed ${step.name}`);
      return result;
    },
  })),
});

const loggingFlow = withLogging(myFlow);
```

## 🔍 Troubleshooting

### Common Issues

1. **Flow Execution Failures**

```typescript
// Problem: Steps failing silently
// Solution: Add proper error handling
.addStep({
  name: "Risky Step",
  execute: async (input) => {
    try {
      return await riskyOperation(input);
    } catch (error) {
      console.error("Step failed:", error);
      throw new StepExecutionError(error.message);
    }
  }
})
```

2. **Memory Leaks**

```typescript
// Problem: Resources not being cleaned up
// Solution: Use cleanup handlers
.addStep({
  name: "Resource Intensive Step",
  execute: async (input) => {
    const resource = await acquireResource();
    try {
      return await processWithResource(resource, input);
    } finally {
      await releaseResource(resource);
    }
  }
})
```

### Debugging Tips

1. **Enable Debug Logging**

```typescript
const debugFlow = new FlowBuilder()
  .enableDebug()
  // ... flow steps
  .build();
```

2. **Step Inspection**

```typescript
const inspectableFlow = new FlowBuilder()
  .addStep({
    name: "Inspectable Step",
    execute: async (input) => {
      const stepState = {
        input,
        timestamp: Date.now(),
        memory: process.memoryUsage(),
      };
      await logStepState(stepState);
      return processInput(input);
    },
  })
  .build();
```

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development Setup
- Pull Request Process
- Coding Standards

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ by the Leele Team</p>
  <p>
    <a href="https://twitter.com/leeleai">Twitter</a> •
    <a href="https://discord.gg/leele">Discord</a> •
    <a href="https://leele.ai/docs">Documentation</a>
  </p>
</div>
