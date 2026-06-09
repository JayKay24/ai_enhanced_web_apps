# Interview MCP Server

An experimental standalone NestJS server that implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) to provide mock technical interview questions to the Astra Interview Assistant.

## Features

- **MCP Integration:** Uses the official `@modelcontextprotocol/sdk` to expose backend data to LLMs via standard JSON-RPC.
- **Streamable HTTP Transport:** Leverages the modern `StreamableHTTPServerTransport` allowing stateful connections over a unified `/mcp` HTTP endpoint.
- **Mock Questions API:** Exposes the `get-interview-questions` tool, returning a list of curated frontend-focused technical questions based on the requested difficulty (easy, medium, hard) and quantity.

## Running Locally

Serve the application locally using Nx:

```bash
npx nx serve interview-mcp-server
```

The MCP endpoint will be available at `http://localhost:4501/mcp`.
