# Few-Shot Chain Prompting CLI

A standalone NestJS command-line application demonstrating few-shot prompt formatting using LangChain and custom shared utilities in the monorepo.

## Features
- **Reasoning Prompts**: Formats complex user questions using few-shot logic to steer the AI's response format and tone.
- **Message List Representation**: Generates a list of formatted few-shot chat message objects (system, user, assistant history).
- **String Representation**: Outputs a raw text representation of the formatted prompt to debug prompt templates.

## How to Execute
Run this CLI application once using Nx:
```bash
npx nx execute few-shot-chain
```
