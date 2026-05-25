# LangChain ReAct Agent CLI

A standalone NestJS command-line application that demonstrates how to implement an autonomous ReAct agent using LangChain.js and Google Vertex AI.

## Features
- **Local Retriever Tool**: Creates a custom search tool using standard `tool()` builders and Zod schemas, wrapping a local vector database (`MemoryVectorStore`).
- **Autonomous Reasoning Loop**: Leverages LangChain's `createAgent` to execute a stateful loop where the agent independently reasons about a user question and decides to run search tools when required.
- **Trace Output**: Logs the step-by-step reasoning thought process, tool execution calls, retrieved inputs, and final generated output in the console.

## Prerequisites
Ensure Vertex AI environment variables and Application Default Credentials (ADC) are active:
```bash
gcloud auth application-default login
export VERTEX_AI_PROJECT_ID="your-project-id"
export VERTEX_AI_LOCATION="us-central1"
```

## How to Execute
Run this CLI application once using Nx:
```bash
npx nx execute langchain-agent
```
