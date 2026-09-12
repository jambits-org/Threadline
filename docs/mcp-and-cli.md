# MCP and Optional CLI Adapters

## Critical Decision

Do not make the product depend on a developer installing or using Codex, Claude Code, Kiro, or any other coding agent.

The hosted product must provide value through its GitHub, Jira, Slack/Discord, support, and web integrations. A developer can use the product from an existing ticket, pull request, or chat command even if they have no local AI CLI.

MCP and local CLI adapters are optional acceleration paths for teams that already use coding agents.

## Integration Model

    Hosted Dev AI Adoption Layer
        ↓
    Remote Dev Context MCP gateway
        ↓
    Codex · Claude Code · Kiro · IDE agents · product specialists

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

## Coding-Agent Compatibility

The first integration should be remote MCP over Streamable HTTP with OAuth and scope-limited tools. This lets supported clients consume the same team context without a bespoke extension for each client.

- Codex locally exposes MCP management commands through its CLI.
- Claude Code exposes MCP configuration through its CLI.
- Kiro supports local and remote MCP servers, workspace/project configuration, and OAuth-protected remote servers.

Client configuration is an adapter concern. The product contract is the same domain tool schema and policy model for every client.

## Optional Local CLI

Later, ship a thin Dev Brain CLI for local worktree context:

    devbrain login
    devbrain context <ticket-or-pr>
    devbrain check
    devbrain mcp install <client>

The CLI can inspect uncommitted files, invoke local tests, and bridge a developer’s active repository to an approved workflow. It must be optional: its absence cannot prevent normal hosted-product usage.

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
