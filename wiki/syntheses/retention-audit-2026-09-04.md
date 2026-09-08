---
title: "Retention Audit 2026-09-04"
type: synthesis
tags: [retention, audit, roadmap]
sources: [current-project-state-2026-09-04]
last_updated: 2026-09-04
---

## Decision

Prioritize **Reliable Daily Momentum** before adding more rooms or content. The first vertical slice must make points, daily quests, achievements and authenticated persistence use one authoritative state path, then expose the next useful goal with honest sync/recovery feedback.

## Iteration 1 Status

Implemented on `develop` without modifying map, collider, spawn or portal configuration:

- Quest hydration starts after player identity, and explorer visits persist without decreasing.
- Achievement rewards use the same point/persistence path; previously unreachable or incorrect triggers were repaired.
- Account sync is debounced, serialized, local-first and recovers a failed full batch before applying a newer partial batch.
- Daily Goal HUD shows the next goal, reward readiness, chest progress and truthful local/sync/retry state on desktop and mobile.
- The multiplayer stress-test script parses, targets the current nine rooms and reports intentional teardown correctly.
- Final post-main gate: production build passed, Playwright passed 75 cases with one intentional Desktop skip for mobile-only geometry, and the 1-bot connectivity smoke reported zero connection errors/unexpected drops.

## Why

- [[DEVERTown]] already has broad content but weak direction between activities.
- Broken or cosmetic progression undermines competence and trust.
- A visible next goal improves activation without forcing a linear route.
- The slice is isolated from map/collider/portal invariants.

## Ordered Work

1. ~~Repair progression sync, hydration and achievement reward persistence.~~
2. ~~Add Daily Goal HUD and real claim/reload/offline tests.~~
3. Instrument the approved privacy-safe activation/return baseline and verify the product-provided metrics.
4. Implement conflict-safe guest-to-account progression merge.
5. Build Hall of Fame plus scheduled social rendezvous after authoritative multiplayer tests.
6. Gate any proximity voice experiment behind explicit consent, feature flags and small-group capacity tests.

## Open Risks

- Frontend/backend room data divergence needs a dedicated migration plan.
- The Golden Frog interaction failure needs an organic proximity/input reproduction.
- The client bundle is large enough to threaten time-to-interactive on weaker mobile devices.
- Achievement ownership is still browser-storage scoped rather than account scoped.
- Multiplayer tests still need authoritative peer and reconnect assertions before load testing becomes an acceptance gate.
- The Product Spec uses eight-area wording in two places while the runtime has nine maps.
- Current sync accepts client-provided points, so the stated zero-trust anti-farming rule is not implemented yet.
- `MWR` had conflicting weekly/monthly meanings; derived docs now use `MWR-7` and `MRR-30`.

## Connections

- [[RetentionFramework]] — prioritization and measurement rules.
- [[current-project-state-2026-09-04]] — evidence snapshot.
- [[DEVERTown]] — product entity.
