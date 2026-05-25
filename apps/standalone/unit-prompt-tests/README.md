# Unit Prompt Tests

A standalone Jest-based test runner that validates LLM prompt behavior, output formats, and semantic correctness.

## Features
- **Mocked Responses**: Demonstrates how to mock Vercel AI SDK `generateText` responses for testing.
- **Semantic Similarity Matching**: Uses `string-comparison` to verify that generated text is semantically close to expected summaries using cosine similarity.
- **Constraint Validator**: Verifies that LLM outputs satisfy specific length boundaries (minimum/maximum word count) and contain required keyword tokens.

## How to Run Tests
Run the test suite using Nx:
```bash
npx nx test unit-prompt-tests
```
