# MCP and CLI Adapters

## Critical Decision

Threadline is CLI-first: developers should be able to use it directly inside Codex, Claude Code, Kiro, and compatible coding agents. It should not privilege or lock the team into one of those clients.

The product is delivered through an installable local MCP adapter. The hosted control plane remains necessary because team memory, source connectors, authorization, approvals, and workflows are shared organization capabilities.

The product also remains usable from a ticket, pull request, or chat command when a developer is away from a local CLI.

## Integration Model

    Codex / Claude Code / Kiro
        ↓
    NPM-installed local Threadline MCP adapter
        ↓
    Hosted Threadline control plane and remote MCP gateway
        ↓
    team engineering contract, evidence graph, approvals, and connectors

The gateway exposes product-level domain tools, not raw vendor APIs:

| Tool | Purpose |
| --- | --- |
| dev.get_context | Resolve a ticket, PR, file, or module into cited context |
| dev.search_evidence | Search permitted claims and source excerpts |
| dev.get_impact | Return affected files, tests, ownership, and risks |
| dev.start_workflow | Start a bounded product workflow |
| dev.get_run | Retrieve artifacts, approvals, and workflow state |
| dev.draft_message | Create an EOD, standup, design, or status draft |
| dev.request_post | Create a pending shared-channel post requiring approval |

The server is a policy gateway. It is not a raw proxy for GitHub, Jira, Slack, Discord, or support APIs, and it is not the inbound webhook path.

## NPM Installation Experience

The planned package split is:

| Package | Responsibility |
| --- | --- |
| @threadline/mcp | Local stdio MCP server used by coding-agent clients |
| @threadline/cli | Login, repository discovery, configuration generation, diagnostics, and optional local checks |

    npx @jambits/threadline init
    threadline mcp config codex
    threadline mcp config claude-code
    threadline mcp config kiro

The configuration command prints the smallest client-specific MCP configuration for teams to review and add themselves. The local MCP server reads the active repository and uncommitted worktree only when the developer invokes a local-context workflow.

## Coding-Agent Compatibility

The first integration should expose both a local stdio MCP adapter and a remote MCP endpoint with OAuth and scope-limited tools. This allows client compatibility without a bespoke product extension for each vendor.

- Codex locally exposes MCP management commands through its CLI.
- Claude Code exposes MCP configuration through its CLI.
- Kiro supports local and remote MCP servers, workspace/project configuration, and OAuth-protected remote servers.

Client configuration is an adapter concern. The product contract is the same domain tool schema and policy model for every client.

## Local CLI

The CLI is thin, but it is a primary developer experience. It owns only local convenience:

    threadline login
    threadline context <ticket-or-pr>
    threadline check
    threadline mcp config <client>

The CLI can inspect uncommitted files, invoke local tests, and bridge a developer’s active repository to an approved workflow. Its absence cannot prevent normal hosted-product usage, but it is the recommended path for developers using a coding CLI.

The CLI should not contain the causal graph, authorization policy, workflow state, or connector credentials. Those remain in the hosted control plane.

## Local Extensions and Repository Rules

Repository-local configuration can provide agent-specific pointers to the shared contract, but the canonical Team Engineering Contract stays portable and reviewable in ordinary repository documentation and configuration. A team must be able to change coding-agent vendors without rewriting its engineering process.

## Security Rules

- Every remote MCP request is tenant-scoped, actor-scoped, and workload-scoped.
- Read tools are the default; write tools require a workflow run and explicit approval.
- No client receives broad shared connector credentials.
- Tool visibility and authorization are enforced server-side.
- Never auto-approve a blanket set of MCP tools in coding-agent clients.

## Sources

- [Model Context Protocol TypeScript SDK](https://ts.sdk.modelcontextprotocol.io/)
- [Model Context Protocol authorization specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- [Kiro MCP configuration](https://kiro.dev/docs/mcp/configuration/)
- [Claude Code CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-usage)
