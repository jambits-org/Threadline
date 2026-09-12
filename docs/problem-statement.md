# Problem Statement

## The Context Tax

Software delivery context is fragmented across ticket trackers, source control, pull requests, chat discussions, support systems, CI, and individual developer memory. Before a developer can safely change a file, they often need to reconstruct:

- why the change exists;
- which architectural constraints apply;
- what was previously tried or rejected;
- which files, owners, tests, and services are affected;
- what customer or production outcome motivated the work.

Generic AI assistants make individual exploration faster but do not solve this team problem. They can increase inconsistency when every developer uses a different prompt, context selection method, model, and agent workflow.

## The Failure Mode

The current pattern resembles a slot machine:

    developer prompt → partially remembered context → agent output
    → trial and error → manual correction → another prompt

Results vary because the workflow is not encoded, the source evidence is unclear, and the agent lacks the repository’s actual engineering rules.

## The Opportunity

The product creates a repeatable path from intent to outcome:

    Jira intent → code change → engineering decision → review
    → release or support outcome

It does not claim that a model should replace developers. It makes engineers faster by removing repeated information retrieval, reducing rework, preserving decision rationale, and drafting operational updates from evidence.

## Target Users

- Engineering teams that already use GitHub and a work tracker such as Jira.
- Developers joining an unfamiliar repository or working across services.
- Tech leads who need design decisions and review context to persist.
- Engineering managers who want AI adoption without forcing a new workflow or vendor-specific coding agent.

## Success Criteria

The product succeeds when a developer can:

1. Start from an existing ticket, PR, file, or project.
2. Receive a short, cited explanation of relevant code and decisions.
3. Produce a plan that follows the repository’s own engineering contract.
4. Collaborate on competing ideas without losing the rationale.
5. Complete less manual reporting after the work is done.

