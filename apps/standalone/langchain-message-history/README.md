# LangChain Chat Message History CLI

A standalone NestJS command-line application that demonstrates conversational memory and message history persistence using LangChain.js and Google Vertex AI.

## Features
- **In-Memory History**: Implements `InMemoryChatMessageHistory` to store and update conversation transcripts (user prompts and AI responses).
- **Messages Placeholder**: Uses `MessagesPlaceholder` inside prompt templates to dynamically insert conversation history into the prompt stream.
- **Session-Based Chats**: Simulates a multi-turn chat session where the assistant recalls the user's name across turns.
- **History Dump**: Prints a final clean log of the entire session history to verify message roles and contents.

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
npx nx execute langchain-message-history
```
