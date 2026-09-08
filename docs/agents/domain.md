# Domain Docs

This is a single-context repository.

## Before exploring

Read these files when they exist and are relevant:

- `CONTEXT.md` at the repository root
- ADRs under `docs/adr/`

If they do not exist, proceed silently. The `domain-modeling` workflow creates
them lazily when the first project-specific term or durable decision is ready
to be recorded.

## Use the glossary vocabulary

Use canonical terms from `CONTEXT.md` in issue titles, tests, hypotheses,
implementation plans, and architecture proposals. Avoid synonyms that the
glossary explicitly rejects.

If a required concept is absent, reconsider whether it belongs to the project
language or record the gap for `domain-modeling`.

## ADR conflicts

If proposed work contradicts an existing ADR, surface the conflict explicitly
instead of silently overriding the recorded decision.
