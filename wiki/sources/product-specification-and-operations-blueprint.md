---
title: "Product Specification and Operations Blueprint"
type: source
tags: [product-spec, operations, retention, social]
date: 2026-09-04
source_file: docs/plans/PRODUCT_SPEC_AND_OPERATIONS_BLUEPRINT.md
---

## Summary

The v1.0 product contract positions [[DEVERTown]] as a digital clubhouse for FPT University Da Nang students and FU-DEVER members. It resolves target personas, platform mix, retention targets, privacy constraints and the priority order Social 50%, Learn 30%, Play 20%.

## Key Claims

- Target D1 is at least 40%, D7 at least 20%, average session length 12–18 minutes and monthly return at least 30%.
- Declared v0.4.1 baseline is 30–50 DAU, 120–150 WAU and at least 95% onboarding conversion.
- Allowed telemetry is limited to room visits, minigame records, quest progress and anonymous JavaScript errors.
- v0.5.0 prioritizes guest-to-account merge, Hall of Fame and a small-group proximity voice experiment.
- Account assets are account-bound; the client map or a shared JSON file should become the room SSOT.

## Connections

- [[DEVERTown]] — product and operating scope.
- [[RetentionFramework]] — turns product targets into measurable behavioral gates.
- [[retention-audit-2026-09-04]] — implementation ordering.

## Contradictions and Evidence Gaps

- The section heading says 18 criteria but the document defines 27.
- It refers to eight areas in two reward/roadmap statements while the current client defines nine maps.
- `MWR` means monthly return in this source but Meaningful Weekly Return in the existing framework; derived docs use `MRR-30` and `MWR-7` to avoid ambiguity.
- The DAU/WAU/onboarding figures are product-provided baselines without telemetry artifacts in the repository, so they are not independently verified.
- Guest auto-merge, server-authoritative anti-farming, feature flags and account-bound achievements are specifications, not confirmed current capabilities.
