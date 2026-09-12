# High-Level Product Design

## Four Actions

| Developer need | Action | Result |
| --- | --- | --- |
| Why is this code here? | Understand | Cited ticket, PR, decision, owner, and outcome history |
| Help me work on this ticket | Build | Context pack, implementation plan, and approved PR draft |
| We have competing ideas | Decide | Evidence-backed comparison, conflicts, and a decision record |
| What did we do today? | Update | EOD, standup, and project update drafted from real work |

The product should not ask a developer to select a master agent, a sub-agent, a model, or a prompt pattern. Specialist agents are implementation details behind a bounded workflow.

## Team Engineering Contract

Every repository has specific architecture, abstractions, code practices, review expectations, and developer skills. The system must follow those rules, not invent alternatives.

The Team Engineering Contract is a versioned repository-specific context pack containing:

- architecture and module boundaries;
- repository instructions and contribution guides;
- CI, test, lint, build, and release commands;
- PR templates, code-owner rules, and review expectations;
- design records and accepted technical decisions;
- stable patterns inferred from the codebase and accepted pull requests;
- approved skills or playbooks for working in the repository.

Rule priority:

    explicit repository rules and CI
        ↓
    approved architecture and design decisions
        ↓
    established accepted code patterns
        ↓
    individual developer preferences
        ↓
    generic AI suggestions

If a rule is missing, the product labels it as unknown. It may draft a proposed practice, but only a person can approve it into the contract. A PR review must always identify which contract sources it used.

## Collaboration

Developers need room for different exploration and creativity. The product provides a clear boundary:

    private developer exploration
        ↓ share to ticket or project
    structured proposal with evidence
        ↓
    shared project space
        ↓
    comparison of agreements, trade-offs, conflicts, and open questions
        ↓
    human-approved decision
        ↓
    durable context for future implementation

The shared space stores proposals, constraints, decisions, open questions, experiments, and outcomes. It is not another unstructured chat server and it does not silently publish private chats.

## Human Control

| Action class | Default behavior |
| --- | --- |
| Retrieve context or search evidence | automatic |
| Draft a plan, PR description, or update | automatic and visible |
| Create a branch or draft PR | explicit approval during initial adoption |
| Post to a shared channel or update a work item | named approver and policy |
| Merge, deploy, delete data, or change permissions | outside MVP; existing controls remain authoritative |

