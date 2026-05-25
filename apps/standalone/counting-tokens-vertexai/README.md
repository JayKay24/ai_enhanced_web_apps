# Vertex AI Token Counter & Chat CLI

A standalone NestJS command-line application demonstrating Google Gen AI SDK usage on Vertex AI for counting tokens, generating embeddings, and establishing chats.

## Features
- **Token Counting**: Queries Vertex AI (`gemini-2.5-flash`) to count tokens for raw text strings and complex multi-turn chat histories.
- **Content Embeddings**: Accesses `gemini-embedding-001` to generate vector embeddings for semantic data representations.
- **Cosine Similarity Matcher**: Computes cosine similarity between high-dimensional vectors to perform semantic search comparisons.
- **Conversational Chat**: Starts an active Gemini chat session, queries it, and parses token usage metadata from the response.

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
npx nx execute counting-tokens-vertexai
```
