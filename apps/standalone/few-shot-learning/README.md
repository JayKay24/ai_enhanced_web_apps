# Few-Shot Learning CLI

A standalone NestJS command-line application demonstrating few-shot in-context learning using the Vercel AI SDK and Google Vertex AI.

## Features
- **In-Context Structured Completion**: Uses structured instruction prompts to guide the LLM to complete a numbered list in the exact formatting specified (e.g. programming languages list).
- **Sentiment & Tone Adaptation**: Integrates system prompts containing multi-turn exemplary user-assistant pairs to dynamically alter model behavior for customer support scenarios.

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
npx nx execute few-shot-learning
```
