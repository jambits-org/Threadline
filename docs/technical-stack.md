# Technology Stack

## Decision

Use a CLI-first TypeScript product with a small hosted control plane. The installable MCP adapter is the developer entry point; PostgreSQL and S3-compatible object storage power shared team memory, connector ingestion, authorization, and approvals. Do not require a graph database, Redis, a separate vector database, or a workflow SaaS.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Developer distribution | NPM packages: @threadline/mcp and @threadline/cli | One installable adapter for Codex, Claude Code, Kiro, and compatible MCP clients |
| Runtime | Node.js 24 LTS + TypeScript | Strong MCP and connector SDK support; NPM is the natural installation path for a local adapter |
| Package management | pnpm workspaces | Simple monorepo without premature build-system complexity |
| Hosted HTTP API | Fastify | Internal control-plane API for OAuth, webhooks, connector ingestion, shared memory, and approvals; it is not the developer-facing product surface |
| Web application | React + Vite | Focused evidence, approval, and admin interface; no server-rendering requirement for the MVP |
| Shared contracts | TypeScript + Zod | One schema for API payloads, workflow artifacts, and MCP tools |
| Primary database | PostgreSQL 16+ | Transactions, relational causal links, JSON metadata, row-level security, full-text search, and operational maturity |
| Vector search | pgvector | Keeps semantic retrieval beside access filters and source metadata |
| Text search | PostgreSQL full-text search and trigram indexes | Strong exact identifier, code symbol, and ticket-key retrieval without a separate search cluster |
| Job queue | pg-boss | Durable background jobs using PostgreSQL; avoids introducing Redis in the MVP |
| Object storage | S3-compatible storage | Encrypted source snapshots, raw webhook payloads, and large artifacts |
| ORM/migrations | Drizzle plus explicit SQL migrations | Typed access without hiding important relational and security queries |
| Agent interface | Provider adapter with structured outputs | Avoids hard dependency on one model vendor or coding-agent harness |
| MCP server | TypeScript MCP SDK over Streamable HTTP | Standard remote integration for coding agents and IDEs |
| Observability | OpenTelemetry + structured JSON logs | Trace connector events, workflow stages, model/tool calls, and approvals |
| Deployment | Docker containers on a managed container platform | Portable deployment; begin with one API/worker service and one web service |

## Monorepo Shape

    apps/
      api/          Fastify control plane: webhooks, authentication, shared API, remote MCP endpoint
      worker/       jobs, indexing, workflow execution
      web/          React evidence and approval UI
    packages/
      contracts/    schemas and event/artifact types
      core/         policies, workflow state machine, graph/linking logic
      connectors/   GitHub, Jira, Slack, Discord, and support adapters
      mcp/          domain tools and authorization middleware
      cli/          local MCP bridge, repository discovery, and client configuration
      ui/           shared web components
    docs/

## What Is Deliberately Not a Dependency

- A single privileged coding-agent vendor. The adapter must work with Codex, Claude Code, Kiro, and compatible MCP clients.
- A specific model provider.
- Redis, Kafka, Neo4j, or a separate vector database for the MVP.
- An enterprise workflow engine before a product workflow proves the need.
- Full repository copies on the hosted service for read-only context use.

## Why PostgreSQL First

The product needs transactional links, tenant isolation, approvals, audit logs, background work, source provenance, and hybrid retrieval. PostgreSQL handles these needs with one operational database. A graph database can be evaluated later if cross-repository traversal, graph analytics, or query latency becomes a measured bottleneck.

## Why TypeScript and Fastify

TypeScript is chosen for delivery speed and interoperability, not because Threadline needs a custom coding environment. The official MCP TypeScript SDK supports local stdio and remote Streamable HTTP transports, and the Node ecosystem has mature integration libraries for the first connectors.

Fastify is only an implementation choice for the hosted service. Existing coding CLIs cannot receive organization webhooks, host shared team data, enforce cross-user authorization, or retain workflow and audit state. A small hosted API is therefore necessary, but developers should normally experience only the NPM-installed MCP adapter inside their chosen coding CLI.

## Security Baseline

- Verify provider webhook signatures before processing.
- Encrypt connector credentials and source snapshots.
- Enforce tenant and visibility checks in the database and API, not in an LLM prompt.
- Treat retrieved chat, support, issue, PR, and code-comment content as untrusted data.
- Use stage-scoped credentials: research agents cannot write code or post messages; verification cannot merge.
- Require explicit, out-of-model approval for shared posts and writes.
