---
status: pending
---

# Instruction: Record consumer commits and prove convergence

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
.
└── release-train/
    └── schema-adrenaline-v2.6.0-final.json ✅ pin the final artifact and two remote consumer commits
```

## User Journey

```mermaid
flowchart TD
  A[Consumer owners publish final adoption commits] --> B[Record exact Lantern and Handbook SHAs]
  B --> C[Dispatch provider final-convergence gate]
  C --> D[Verify final bytes, lockfiles and consumer-owned journeys]
  D --> E[Publish evidence and update issue 36]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    system: both consumer owners provide full commits on their main histories => immutable external inputs available: 5: cli
  section Happy path
    cli: commit final record and dispatch provider gate => final archive and both consumer proofs pass with exact commits: 5: cli
  section Edge case - incomplete handoff
    cli: one consumer remains on RC URL or lacks a final proof => gate fails and final record is not accepted: 1: cli
  section Edge case - identity mismatch
    cli: change a consumer SHA or artifact SRI => gate fails with the mismatch: 1: cli
```

## Tasks to do

### `1)` Pin the delivered consumer identities

> Seal the final record only after external owners finish their issue #36 tasks.

1. Read the full Lantern and Handbook commits supplied in issue #36; verify each is reachable remotely and included in that consumer's `main` history.
2. Verify both published consumer lockfiles resolve the canonical v2.6.0 URL with the candidate's SRI, then commit the protocol-2 final record with those exact SHAs.
3. Keep the protocol-1 candidate manifest and its historical prerelease consumer refs unchanged.

### `2)` Produce the final provenance chain

> Run the provider gate against the committed record and attach its evidence to the issue.

1. Dispatch the provider workflow at the commit carrying the final record and verification tools; require both consumer-owned protocol-2 assertions to pass at the recorded commits.
2. Retain the workflow artifact naming the final provider tag and tag commit, committed candidate-manifest digest, canonical archive URL, SHA-256, SRI, two consumer commits, lockfile URLs and journey statuses.
3. Run the ordinary provider check with the committed record, then link the successful gate and evidence in issue #36; keep the immutable v2.5.0 naming exception explicit.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | ------------------- |
| 1 | The final record names the canonical v2.6.0 artifact and two full consumer commits that are reachable on their respective `main` histories. |
| 1 | Both exact consumer lockfiles contain the final URL and published SRI; the historical candidate manifest is unchanged. |
| 2 | The provider gate proves byte-identical final archive and both consumer-owned final journeys, and emits one machine-readable chain with the exact provider tag commit and both consumer SHAs. |
| 2 | A missing final consumer proof, RC URL, wrong digest, SRI or commit fails; issue #36 receives links to the passing run and evidence only after success. |
