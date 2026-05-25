# OpenAI Token Counter CLI

A standalone NestJS command-line application that demonstrates how to count text tokens accurately for OpenAI models.

## Features
- **Tiktoken Tokenizer**: Uses `@dqbd/tiktoken` to perform BPE encoding and count tokens for specific OpenAI models (e.g., `gpt-3.5-turbo`).
- **Context Limit Calculation**: Simulates a system prompt and a user prompt, calculates their token lengths, and determines the remaining token capacity before hitting the response context limit.

## How to Execute
Run this CLI application once using Nx:
```bash
npx nx execute counting-tokens-openai
```
