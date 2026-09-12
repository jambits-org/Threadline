# Architecture and Data Flows

## Architecture

    Customer systems
    Jira · GitHub · Slack/Discord · support · CI/CD
                         ↓
    Ingestion plane
    verify → queue → normalize → classify/redact → deterministic linking
                         ↓
    Evidence plane
    immutable source snapshots + relational causal graph + hybrid search
                         ↓
    Workflow control plane
    identity/policy + workflow state + approvals + artifacts + audit
                         ↓
    Interaction plane
    web evidence view + Slack/Discord app + MCP gateway + optional local CLI

## Source Authority

No single source is authoritative for every question.

| Question | Authority |
| --- | --- |
| What code is currently shipped? | Git repository plus deployment and CI state |
| Why was work requested? | Jira issue or product requirement |
| Why was a trade-off chosen? | Accepted ADR or PR decision; otherwise a tagged discussion |
| What did a customer experience? | Support record, with PII and visibility controls |
| Did the change work? | CI/CD, release, observability, incident, and support follow-up |
| What did someone do today? | Derived EOD summary, never canonical truth |

Every answer is composed of claims. A claim records supporting source objects, source roles, confidence, visibility, validity period, and any superseding decision.

## Ingestion Flow

    provider webhook or scheduled sync
        ↓
    authenticate and validate signature
        ↓
    persist encrypted raw event and dedupe key
        ↓
    enqueue and acknowledge provider
        ↓
    normalize to canonical object and visibility class
        ↓
    create deterministic links from issue IDs, PR links, commit SHAs, URLs, and releases
        ↓
    index permitted text for lexical and semantic retrieval

Weak semantic links are suggestions, not facts. A human can confirm or reject them. The system never upgrades an inference to an authoritative decision without evidence or confirmation.

## Ticket-to-PR Agent Flow

    ticket or chat command
        ↓
    workflow engine resolves repository, actor, policy, contract, and source snapshot
        ↓
    context specialist: cited evidence pack, conflicts, and uncertainty
        ↓
    impact specialist: files, symbols, tests, owners, and risks
        ↓
    planning specialist: ordered plan, acceptance criteria, and open questions
        ↓
    human plan approval
        ↓
    implementation adapter: branch-scoped code work or implementation brief
        ↓
    verification specialist: tests and contract-aware review
        ↓
    human approval for draft PR or shared update

The workflow engine, not an LLM, owns state transitions, budgets, retry limits, approval requirements, and permissions. Agents return schema-validated artifacts and receive only the capabilities needed for their stage.

## Core Data Stores

| Store | Purpose |
| --- | --- |
| PostgreSQL | tenant data, identity mappings, canonical objects, links, claims, workflow state, approvals, and audit trail |
| PostgreSQL full-text search plus pgvector | hybrid retrieval over access-filtered source chunks |
| S3-compatible encrypted object storage | raw webhook payloads, source snapshots, generated artifacts, and large files |
| PostgreSQL-backed job queue | connector processing, indexing, scheduled work, and bounded workflow stages |

PostgreSQL is sufficient for the MVP. A dedicated graph database is not added until measured query patterns require it.

