# Vertex AI Embeddings CLI

A standalone NestJS command-line application showcasing text embedding generation using Google Vertex AI and the Vercel AI SDK.

## Features
- **Vercel AI SDK Integration**: Utilizes the provider-agnostic Vercel AI SDK `embed` interface.
- **Google Vertex AI Adapter**: Connects to Vertex AI using `@ai-sdk/google-vertex`.
- **Text-Embedding-004 Model**: Generates a high-dimensional embedding vector for input text and prints the dimensions and initial float values.

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
npx nx execute embeddings-vertexai
```
