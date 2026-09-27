---
objective: "The canonical v2.6.0 final archive is proven identical to its candidate, both consumers resolve its final URL and SRI, and immutable commits and the provider tag form a checked provenance chain."
status: in-progress
---

# Plan: Converge consumers on the canonical final archive

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Complete issue #36 through the already published canonical v2.6.0 release, enforce post-promotion adoption, and retain auditable evidence. |
| **Source** | [RebelliousSmile/schema-adrenaline#36](https://github.com/RebelliousSmile/schema-adrenaline/issues/36) |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Define and verify the final archive contract | [`phase-1.md`](./phase-1.md) |
| 2 | Adopt the final URL in both consumers | [`phase-2.md`](./phase-2.md) |
| 3 | Enforce and record post-promotion convergence | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [Issue #36](https://github.com/RebelliousSmile/schema-adrenaline/issues/36) | Requires canonical final URL, unchanged candidate bytes, both consumer lockfiles and SRI, provider checks, and exact immutable provenance. |
| [v2.5.0 release](https://github.com/RebelliousSmile/schema-adrenaline/releases/tag/v2.5.0) | Published immutable with `candidate.tgz` and checksum; archive digest is `62033e75384f17ee21e4e5e76d231b84c25b3fdcb0d5de74ecdbc89c94be95cc`. |
| [v2.6.0 release](https://github.com/RebelliousSmile/schema-adrenaline/releases/tag/v2.6.0) | Already exposes `schema-adrenaline-2.6.0.tgz` and its checksum; archive digest equals the v2.6.0 candidate manifest's SHA-256. |
| [GitHub immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) | A published immutable release cannot gain or rename assets, and its tag name cannot be reused after deletion. |

## Decisions

| Decision | Why |
| -------- | --- |
| Use v2.6.0 for canonical final convergence and keep v2.5.0 as a documented immutable exception. | The exact v2.5.0 canonical URL requested by the issue cannot be created under its locked tag; v2.6.0 already has the required canonical asset and candidate digest. |
| Keep the protocol-1 candidate manifest and its historical consumer refs unchanged; record final adoption separately. | Candidate proofs must remain an audit of what was tested before promotion, while final lockfile commits occur afterward. |
| Reuse the existing protocol-2 final-artifact envelope and place provider tag commit and candidate-manifest identity in verified evidence. | This avoids introducing an incompatible input shape while keeping the entire provenance chain auditable. |
| Keep consumer lockfile, installation, bundle and rendering assertions consumer-owned. | The provider coordinates provenance, while Lantern and Handbook own their runtime adapters and checks. |
| Treat v2.6.0's existing canonical publication, Lantern pin and ordinary candidate/esbuild checks as established inputs, and change only missing final-convergence behavior. | Repeating already completed work would obscure the remaining Handbook pin and final evidence gap. |
