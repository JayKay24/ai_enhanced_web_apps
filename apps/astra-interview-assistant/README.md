# Astra Interview Assistant

A Next.js-based conversational AI assistant that I designed to help job seekers practice for real-world interviews. Powered by Google Vertex AI, my application simulates realistic interview scenarios and provides personalized feedback using an LLM-powered interviewer.

## Features

- **Customizable Interviews:** Configure job type, difficulty, question type, and number of questions.
- **Voice Interactions:** Listen to the interviewer's questions using Google Cloud Text-to-Speech (TTS).
- **Session Management:** Save and resume interview sessions securely using Upstash Redis.
- **Personalized Feedback:** Get detailed, constructive feedback at the end of each session based on the entire conversation history.
- **Modern UI:** Built with Radix UI and Tailwind CSS.

## Architecture

```mermaid
flowchart TD
    subgraph Client["Browser Client (Port 4500)"]
        UI["Interview UI (Next.js App Router)"]
        Audio["Audio Player (TTS Playback)"]
        Hook["useInterviewChat Hook"]
        UI --> Hook
        Audio --> Hook
    end

    subgraph Security["Edge & Auth Layer"]
        Proxy["proxy.ts (Edge Proxy)"]
        Clerk["Clerk Authentication"]
        Upstash["Upstash Redis (Rate Limiter & Quotas)"]
        Proxy --> Clerk
        Proxy --> Upstash
    end

    subgraph Server["Next.js Server Runtime"]
        ChatAPI["POST /api/chat"]
        SessionAPI["POST /api/sessions"]
        TTSAPI["POST /api/tts"]
        InterviewService["Interview Service (interview-service.ts)"]
        TTSService["TTS Service (tts-service.ts)"]

        ChatAPI --> InterviewService
        SessionAPI --> InterviewService
        TTSAPI --> TTSService
    end

    subgraph MCP["MCP Microservice (Port 4501)"]
        MCPServer["NestJS MCP Server (Streamable HTTP /mcp)"]
        QuestionsTool["get-interview-questions Tool"]
        MCPServer --> QuestionsTool
    end

    subgraph Cloud["External Services & GCP"]
        Vertex["Google Vertex AI (gemini-2.5-flash)"]
        GCPTTS["Google Cloud Text-to-Speech"]
        RedisSession["Upstash Redis (Session Storage)"]
        InterviewService --> Vertex
        InterviewService --> RedisSession
        TTSService --> GCPTTS
    end

    Hook --> Proxy
    Proxy --> ChatAPI
    Proxy --> SessionAPI
    Proxy --> TTSAPI
    InterviewService -.->|"JSON-RPC via @ai-sdk/mcp"| MCPServer
```

I built the application on Next.js 15+ (App Router) and leveraged the following technologies:

- **Frontend Hooks:** Custom React hooks (`@ai-enhanced-web-apps/chat-hooks`) abstract away the `useChat` integration and audio playback.
- **Backend Services:** I encapsulated heavy operations like Redis state management, Vertex AI calls, and TTS synthesis in standard services (`interview-service.ts`, `tts-service.ts`) isolated from HTTP route handlers.
- **Authentication & Rate Limiting:** Secured with Clerk for user auth and Upstash Redis for sliding-window rate limiting.

## MCP Integration

I integrated this assistant with an experimental Model Context Protocol (MCP) server. When the user selects a "Frontend Engineer" job type with a "Technical" question type, my assistant leverages the `experimental_createMCPClient` from the Vercel AI SDK to stream connection and inject the MCP tools directly into the LLM context.

For more details on the server implementation, see the [Astra MCP Server README](../astra-mcp-server/README.md).

## Running Locally

To run the application locally, ensure you have your GCP credentials and environment variables set up, then run:

```bash
infisical run -- npx nx dev astra-interview-assistant
```

The application will be available at `http://localhost:4200` (or the port specified in your configuration).
