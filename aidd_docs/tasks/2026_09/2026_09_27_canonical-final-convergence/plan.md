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
| **Scope** | Change only `schema-adrenaline`; track Lantern and Handbook work in issue #36 and consume their published commits as evidence. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Define and verify the final archive contract | [`phase-1.md`](./phase-1.md) |
| 2 | Build the provider-owned final convergence gate | [`phase-2.md`](./phase-2.md) |
| 3 | Record consumer commits and prove convergence | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [Issue #36](https://github.com/RebelliousSmile/schema-adrenaline/issues/36) | Requires canonical final URL, unchanged candidate bytes, both consumer lockfiles and SRI, provider checks, and exact immutable provenance. |
| [v2.5.0 release](https://github.com/RebelliousSmile/schema-adrenaline/releases/tag/v2.5.0) | Published immutable with `candidate.tgz` and checksum; archive digest is `62033e75384f17ee21e4e5e76d231b84c25b3fdcb0d5de74ecdbc89c94be95cc`. |
| [v2.6.0 release](https://github.com/RebelliousSmile/schema-adrenaline/releases/tag/v2.6.0) | Already exposes `schema-adrenaline-2.6.0.tgz` and its checksum; archive digest equals the v2.6.0 candidate manifest's SHA-256. |
| [Lantern `7935a9a`](https://github.com/RebelliousSmile/lantern/commit/7935a9a9e1decc7577dedc8b79aec11be4fce9b6) | The fresh `main` checkout still declares `v2.6.0-rc.1` in `package.json`, `package-lock.json` and `pnpm-lock.yaml`; its protocol-2 final parser accepts Mist only. |
| [Handbook `12eb3ca`](https://github.com/RebelliousSmile/obsidian-handbook/commit/12eb3ca46bda5a12a5d6310fca3523c4a724d509) | The fresh `main` checkout already pins canonical v2.6.0 with the candidate SRI in `package.json` and `pnpm-lock.yaml`; its protocol-2 final parser accepts Mist only. |
| [Issue #36 consumer handoff](https://github.com/RebelliousSmile/schema-adrenaline/issues/36#issuecomment-5857401993) | Tracks the Lantern migration and both consumer-owned final proofs outside this repository, including the required full commits and evidence links. |
| [GitHub immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) | A published immutable release cannot gain or rename assets, and its tag name cannot be reused after deletion. |

## Decisions

| Decision | Why |
| -------- | --- |
| Use v2.6.0 for canonical final convergence and keep v2.5.0 as a documented immutable exception. | The exact v2.5.0 canonical URL requested by the issue cannot be created under its locked tag; v2.6.0 already has the required canonical asset and candidate digest. |
| Keep the protocol-1 candidate manifest and its historical consumer refs unchanged; record final adoption separately. | Candidate proofs must remain an audit of what was tested before promotion, while final lockfile commits occur afterward. |
| Reuse the existing protocol-2 final-artifact envelope and place provider tag commit and candidate-manifest identity in verified evidence. | This avoids introducing an incompatible input shape while keeping the entire provenance chain auditable. |
| Keep consumer lockfile, installation, bundle and rendering assertions consumer-owned. | The provider coordinates provenance, while Lantern and Handbook own their runtime adapters and checks. |
| Treat v2.6.0's canonical publication, Handbook final pin and ordinary candidate/esbuild checks as established inputs; keep all consumer edits outside this repository and list them in issue #36. | The user restricted implementation to `schema-adrenaline`; the provider can verify consumer evidence but cannot create it locally. |
