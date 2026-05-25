# Interactive IT Knowledge Base CLI

An interactive NestJS command-line search assistant that matches user queries to an IT support database using high-dimensional text embeddings and cosine similarity.

## Features
- **Interactive Interface**: Prompts the user for queries dynamically via Node's `readline` module.
- **Batch Embedding Generation**: Uses the Vercel AI SDK `embedMany` interface with Google Vertex AI's `text-embedding-004` to vectorize the entire knowledge base at launch.
- **Cosine Similarity Lookup**: Computes the semantic similarity between the user's query embedding and the pre-computed database embedding vectors.
- **Answer Retrieval**: Displays the matching question and answer, alongside a similarity score, if the score exceeds the validation threshold (`0.7`).

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
npx nx execute interactive-it-kb
```
Because the application is interactive, it will prompt you for text input in the terminal.
