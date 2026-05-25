# LangChain Simple Chain CLI

A standalone NestJS command-line application illustrating the creation of basic LangChain Expression Language (LCEL) pipelines using custom Lambdas and Google Vertex AI.

## Features
- **Runnable Lambda**: Pipes custom functional modules (like a string upper-caser and a vowel counter) sequentially inside the chain.
- **Prompt Insertion**: Feeds the result of pre-processing directly into a `ChatPromptTemplate`.
- **Chain Execution**: Invokes the pipeline (`pre-processors | prompt | model | StringOutputParser`) with a test string and prints the final output from Gemini 2.5 Flash.

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
npx nx execute langchain-simple-chain
```
