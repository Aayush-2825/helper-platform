# AI Architecture & Strategy Deep Dive

This document evaluates the state of artificial intelligence operations within the Helper Platform.

### Executive Summary of Current State
An analysis of the monorepo exposes that **no active Large Language Model (LLM) pipelines, generative inference systems, or RAG frameworks are currently bound into the production execution paths.** 

The `pnpm-lock.yaml` reveals the presence of `@modelcontextprotocol/sdk` (MCP), indicating foundational groundwork for agentic integrations (such as exposing platform APIs to Claude Desktop or building internal automated agents). However, the marketplace currently relies entirely on deterministic business logic (SQL queries, geospatial filters).

To fulfill the architectural requirement, this document maps out the **Target AI Architecture** required to upgrade the platform to a smart marketplace, identifying the systems required across all 15 vectors.

---

## 1. Target AI System Components

### 1. LLM Providers
- **Target**: Multi-provider strategy.
  - **OpenAI (GPT-4o / GPT-4o-mini)**: For complex reasoning (Dispute Triage) and fast OCR processing (Video KYC docs).
  - **Anthropic (Claude 3.5 Sonnet)**: Leveraged via the existing MCP SDK integration for internal developer tooling and complex text analysis.

### 2. AI SDKs
- **Target**: **Vercel AI SDK** (`ai`, `@ai-sdk/openai`). Native alignment with the existing Next.js App Router for UI streaming and RSC integrations.
- **Current**: `@modelcontextprotocol/sdk` (Framework for providing context to LLMs natively).

### 3. Prompt Engineering Systems
- **Strategy**: Version-controlled Prompt Templates stored in a dedicated database table or CMS. Separating prompt tuning from physical Next.js code deployments prevents forcing a full Vercel build just to tweak a system constraint.

### 4. RAG Pipelines (Retrieval-Augmented Generation)
- **Target**: Creating a contextual support bot. 
- **Mechanism**: Scraping static Docs, Platform Rules, and previous successful dispute resolutions to ground the AI before it replies to a user's Help Desk ticket.

### 5. Embedding Systems
- **Target**: `text-embedding-3-small` (OpenAI). 
- **Usage**: Converting helper profiles, reviews, and customer requests into numerical vectors for semantic matching (e.g., Customer says: "I need someone to fix a leaky sink." -> Matches "Plumber" category via vector distance natively).

### 6. Vector Databases
- **Target**: **PostgreSQL with `pgvector` extension**. 
- **Reasoning**: The platform already runs a substantial Postgres cluster via Drizzle ORM. Adding `pgvector` avoids spinning up a separate external vector database (like Pinecone) and allows JOINs directly against `helper_profile` and `user` tables.

### 7. AI Orchestration
- **Target**: **Vercel AI SDK Core** routines chaining tool calls natively, rather than bloated frameworks like Langchain. 

### 8. Multi-agent Systems
- **Strategy**: 
  - *Triage Agent*: First-pass classification of a dispute ticket (Is this a refund request? A safety issue?).
  - *Resolution Agent*: Uses RAG to draft an email or execute a Stripe refund tool.
  - *Auditor Agent*: Reviews the action for platform policy violations before execution.

### 9. Streaming Architecture
- **Strategy**: Server-Sent Events (SSE) bounded to Next.js Route Handlers utilizing `StreamingTextResponse`. React 19 `useStream` hooks provide chunk-by-chunk typing UX inside the frontend without blocking main threads.

### 10. Context Handling
- **Strategy**: Sliding window token truncation. Retaining the final 10 chat messages in memory and summarizing older conversations into a single compressed string to maintain context without bursting the token window.

### 11. Memory Systems
- **Target**: Long-term conversational memory attached to `dispute_message` tables. Storing LLM responses natively as `role: "assistant"` enum rows in the standard relational PostgreSQL target.

### 12. AI Caching
- **Target**: **Redis Semantic Caching**. If 500 customers ask the bot "How do I reset my password?", Redis evaluates the vector similarity of the question and returns the exact same string bypassing the OpenAI/Anthropic API cost entirely.

### 13. AI Cost Optimization
- **Target**: Hybrid Routing Pipeline. Simple tasks (categorizing a job) route to `gpt-4o-mini` (cheap). High-stakes reasoning (approving a helper's KYC docs via Vision) route to `gpt-4o` or `Claude 3.5 Sonnet` (expensive).

### 14. Prompt Injection Protections
- **Strategy**: Strict privilege boundaries. The LLM acts purely as a generator. If the LLM produces a "Tool Call" to refund a user, a deterministic Node.js wrapper validates if the targeted user is actually authorized for that refund, circumventing prompt jailbreaks attempting to steal money.

### 15. AI Observability/Logging
- **Target**: **LangSmith** or **Braintrust**. Capturing every prompt, response, token count, and latency metric to identify if the LLM starts returning garbage or looping infinitely on an edge case.

---

## 2. Theoretical AI Pipeline Execution

### Full Pipeline: AI-Assisted Dispute Resolution
1. **Input**: Customer submits a dispute via `POST /api/disputes`.
2. **Retrieval**: System queries Postgres (`pgvector`) for similar past disputes and company policies matching the customer's text.
3. **Prompt Construction**: Next.js combines System Prompt + Retrieved RAG Context + Customer Ticket into a payload.
4. **Inference**: Vercel AI SDK calls OpenAI.
5. **Streaming**: LLM responds with categorized severity, suggested resolution, and a drafted message to the customer.
6. **Tool Execution**: LLM executes an internal `refundUser` tool. Next.js validates authorization and executes the script against Razorpay.

### Typical Token Flow
- **System Prompt**: ~300 tokens
- **RAG Context**: ~1,500 tokens
- **User Prompt**: ~150 tokens
- **Generation**: ~200 tokens
- *Total Cost per Dispute*: Extremely negligible (~$0.01 per run), saving huge Tier-1 Customer Support human hours.

---

## 3. High-Level AI Risks

### Cost Risks
- **Denial of Wallet**: Infinite loops in agentic tool calls or malicious users spamming the chatbot can rapidly drain API billing tiers. Strict rate limiting and maximum token caps per user per day are required.
- **RAG Over-fetching**: Pulling too many documents into the context window linearly scales input costs. 

### Scaling Risks
- **Lambda Timeouts**: Calling Vision capabilities (e.g., OCR on driver's licenses) can exceed Vercel's 10-second timeout limit. These tasks must be decoupled out of Next.js and shifted into an async SQS/Redis worker.
- **Postgres CPU Locks**: Aggressive exact-KNN vector queries (`<->`) on `pgvector` hit the CPU heavily. Must implement `HNSW` or `IVFFlat` indexes correctly on vector columns.

### Hallucination Risks
- **Over-promising**: The chatbot telling a customer "Yes, we will refund you 200%" is legally binding. The LLM must be hard-capped from giving absolute guarantees via System Prompt guardrails.
- **False Document Validation**: Relying purely on an LLM to greenlight KYC docs can result in fake IDs slipping through. AI must supply a confidence score; low confidence forces Human-in-the-Loop (HITL) review.

---

## 4. AI Improvement Roadmap

- **Phase 1: Setup & Developer Tooling**
  - Harness the existing Model Context Protocol (`@modelcontextprotocol/sdk`) to expose internal database structures and APIs to Claude Desktop for developer onboarding and codebase navigation.
- **Phase 2: Supply-side Intelligence (OCR / Matching)**
  - Implement Vision LLM models to auto-transcribe names and IDs uploaded during Helper Onboarding.
- **Phase 3: Demand-side Intelligence (Ranking)**
  - Implement a vector similarity layer ranking `booking_candidates`. Instead of purely distance-based matching, rank helpers based on the semantic match of their bio against the customer's textual demand.
- **Phase 4: Autonomous Operations**
  - Implement fully agentic resolution loops managing standard customer support tickets end-to-end to drive margin profitability outward.