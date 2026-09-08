# Issue tracker: GitHub

Issues and specs for this repository live in GitHub Issues at
`fudever-club/dever_town`. Use the `gh` CLI for all operations.

## Conventions

- Create: `gh issue create --title "..." --body-file <file>`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body-file <file>`
- Add/remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Run commands inside this repository so `gh` infers
`fudever-club/dever_town` from the Git remote.

For multiline content on PowerShell, write the body to a temporary Markdown
file and pass it through `--body-file`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

External pull requests are not included in routine triage discovery. An
explicitly named PR can still be inspected when requested.

GitHub shares one number space between issues and pull requests. Resolve an
ambiguous reference with `gh pr view <number>` and fall back to
`gh issue view <number>`.

## Publishing and fetching

When a skill says “publish to the issue tracker,” create a GitHub issue.

When a skill says “fetch the relevant ticket,” run:

`gh issue view <number> --comments`

## Wayfinding operations

- **Map:** a GitHub issue labelled `wayfinder:map`.
- **Child ticket:** an issue linked as a GitHub sub-issue. If sub-issues are
  unavailable, add it to a task list in the map and place `Part of #<map>` in
  the child body.
- **Ticket labels:** `wayfinder:research`, `wayfinder:prototype`,
  `wayfinder:grilling`, or `wayfinder:task`.
- **Blocking:** use native GitHub issue dependencies when available. Otherwise,
  put `Blocked by: #<number>` near the top of the child issue.
- **Frontier:** open child issues with no open blockers and no assignee.
- **Claim:** `gh issue edit <number> --add-assignee @me`
- **Resolve:** comment with the answer, close the child issue, then append a
  short linked context pointer to the map’s `Decisions so far` section.
