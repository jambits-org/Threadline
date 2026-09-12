# Threadline

The shared reasoning layer for software teams.

It learns from how a team already delivers software and turns that context into cited, safe, repeatable workflows. It is designed to reduce the context tax around engineering work without replacing a team’s architecture, code practices, or existing tools.

## Problem

Teams adopt AI through disconnected chats, personal prompts, and agent experiments. The result is inconsistent quality:

- developers repeatedly reconstruct context from Jira, GitHub, chat, support, and CI;
- agents do not know the team’s architecture, conventions, and prior decisions;
- important decisions remain buried in messages and review threads;
- each developer invents a different workflow;
- teams lose trust when an agent applies generic practices that conflict with the codebase.

## Product

    Existing tools
    GitHub + Jira + Slack/Discord + support + CI
                       ↓
    Team Engineering Contract
    repository architecture, practices, skills, and rules
                       ↓
    Shared Dev Memory
    what changed, why, who decided, and what happened
                       ↓
    Guided workflows
    Understand · Build · Decide · Update
                       ↓
    IDE, PR, Slack, and Discord

The first workflow is ticket to reviewed PR:

    Jira ticket → cited context pack → impact map → approved plan
    → draft PR or implementation → verification → EOD/update draft

## Product Principles

1. **Follow the team; do not impose a process.** Existing repository architecture, CI, code-owner rules, PR templates, and approved practices govern every code workflow.
2. **Evidence before confidence.** Answers, plans, and reviews cite the issue, code, PR, decision, or outcome that supports each material claim.
3. **Workflows over prompt roulette.** Developers choose familiar actions; the system packages context, expected outputs, and approvals.
4. **Private exploration, deliberate sharing.** Personal agent chats remain private until a developer shares an idea to a ticket or project.
5. **Draft first, mutate second.** The default is read-only research and drafts. Shared posts, PR creation, and any higher-risk write require an explicit approval.
6. **CLI-first and MCP-native.** Developers install one Threadline adapter into the coding agent they already use. Codex, Claude Code, Kiro, and IDE agents consume the same shared context and workflow contract.

## CLI-First Installation

Threadline is delivered as an NPM package and configured as an MCP server inside an existing coding agent:

    Codex / Claude Code / Kiro
                 ↓
    local Threadline MCP adapter, installed through NPM
                 ↓
    shared Threadline control plane
                 ↓
    team engineering contract, memory, workflows, and approvals

The planned first-run flow is:

    npx @jambits/threadline init
    threadline mcp config <codex|claude-code|kiro>

The CLI identifies the local repository, reads the repository contract, and prints the smallest client-specific MCP configuration. Each client keeps its own approval behavior; Threadline never silently grants broad tool permissions.

## Repository Status

This repository now includes the first local MVP: an NPM-installable CLI and stdio MCP server that discovers a repository’s engineering contract and builds context from local Git history. Hosted source connectors and shared organization memory require configured organization credentials and are the next implementation phase.

## Local Development

    npm install
    npm run build
    node dist/cli.js init
    node dist/cli.js contract
    node dist/cli.js context authentication
    node dist/cli.js mcp config codex

For an MCP client, configure its local server command to:

    npx -y @jambits/threadline mcp serve

## Documentation

- [Problem statement](docs/problem-statement.md)
- [High-level product design](docs/product-design.md)
- [Architecture and data flows](docs/architecture.md)
- [Technology stack](docs/technical-stack.md)
- [MCP and optional CLI adapters](docs/mcp-and-cli.md)

## Non-goals for the MVP

- Replacing Jira, GitHub, Slack, Discord, or an IDE.
- A generic company-wide chatbot.
- Automatically mining every private conversation into company memory.
- Imposing a universal code architecture or review rubric.
- Autonomous merge, production deploy, permission change, or destructive action.
