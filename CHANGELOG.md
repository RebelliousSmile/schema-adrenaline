# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `tools/validate-handbook-pack.ts` now checks the manifest facts the retired
  Handbook harness used to cover: a non-empty `pack.label`, the presence in both
  polarity layers of the seven `note` tokens and five `workspace` tokens that no
  contrast pair reaches, and the exact key sets of `assets.images` and
  `assets.fonts`.
- A `workspace` token whose name carries `texture` is refused on every layer: a
  page texture belongs to the note surface, never to Obsidian's own chrome.
- `minimumHandbookVersion` is refused below `2.7.0`. The field drives the
  Handbook checkout ref in CI, so lowering it would silently move the
  cross-repository test target. The comparison is component-wise on integers,
  not lexical, which would otherwise order 2.10.0 before 2.7.0.
- Four degraded manifests were added to `npm run validate:handbook`, one per new
  control that a fixture can express.

### Changed

- The cross-repository CI gate no longer runs Handbook 2.7.0's
  `assert:adrenaline-source`. That harness hardcodes the pack version it expects
  (`0.2.0`), and it lives only on the frozen 2.7.x tags, so every pack bump
  breaks it and no upstream fix can reach it. It was removed upstream on
  2026-09-15 and is absent from `v2.10.0` onward.
- Coverage that moved rather than disappeared: the manifest-shape assertions
  (label, required style tokens, asset keys) are now enforced in this repository
  by `npm run validate:pack`, read from `handbook/adrenaline/pack.json` instead
  of being restated as literals.
- Coverage that was abandoned: the Handbook block round-trip
  (`block.parse` -> `exportSpec.toToml` -> target `safeParse`) needs the Handbook
  codebase and cannot live here. It remains covered upstream by
  `assert:adrenaline-contract`, against the published package - see
  obsidian-handbook#36.
- `assert:adrenaline-theme` is still run against the declared minimum Handbook
  release: it proves that the oldest supported host can still read the current
  manifest.

## [2.2.0] - 2026-09-20

### Added

- A published cross-tool provider descriptor and descriptor-driven validation of
  every Handbook pack.
- Public package exports for the cross-tool descriptor, Handbook catalogue,
  pack manifests and declared Handbook assets, verified from an installed
  release tarball.

### Fixed

- The provider descriptor now references the real `corpus/cases.json` manifest
  and publishes its contract version, closing issue #10.

## [2.1.0] - 2026-09-18

### Added

- An explicit closed boundary for future consumer adapter keys: Adrenaline
  documents currently reject presentation metadata, the shared corpus proves it
  for PJ, PNJ and monster documents, and Lantern owns any future exhaustive
  adapter registry.

## [2.0.0] - 2026-09-18

### Changed

- **Breaking:** playable numeric scalars are now `{ minimum, current, maximum }`
  objects. This applies to characteristics, skills, formations, weapon
  percentages, health thresholds, protections, experience and contagion
  probabilities; structural and editorial numbers stay scalar.
- The public codecs enforce `minimum <= current <= maximum`. Generated draft-7
  schemas remain structural and the corpus proves the distinction with JSON and
  TOML inverted-range fixtures.

### Migration

- Convert every legacy playable scalar `n` to `{ minimum: 0, current: n,
  maximum: n }`. This preserves the recorded value without inventing a capacity.

## [1.1.1] - 2026-09-15

### Added

- Canonical PJ rejection fixtures for a missing `nom` field and missing
  `protections`, in both JSON and TOML, indexed in the public corpus manifest.

## [1.1.0] - 2026-09-13

### Added

- `Competence.notes` — a free-text note line on a skill entry (weapon
  reference, context), optional, no cross-schema link.
- Handbook Adrenaline pack (`0.3.0`): Zombiology visual tokens for h4,
  narrative emphasis, list marker glyph, status badges, table banner/border,
  and callout cartouche, for light and dark, with matching contrast pairs in
  `tools/validate-handbook-pack.ts`.

## [1.0.1] - 2026-09-12

### Fixed

- `--color-yellow` and `--adrenaline-signal` in the Handbook Adrenaline pack's
  light palette now meet their respective AA contrast thresholds against
  `--background-primary` (issue #5), without regressing the existing
  `--adrenaline-signal-ink`/`--adrenaline-signal` pair.

### Changed

- `tools/validate-handbook-pack.ts` now asserts `--color-yellow` (4.5:1) and
  `--adrenaline-signal` (3:1) against `--background-primary`, closing the gap
  that let both tokens regress undetected.

## [1.0.0] - 2026-09-11

### Added

- A stable ESM API exporting the three strict Zod schemas, their inferred
  TypeScript types, JSON/TOML codecs and contract version constants.
- Frozen `1.0.0` JSON Schemas and public package subpaths for schemas, examples
  and the shared conformance corpus.
- Installed-tarball, Node, esbuild, version immutability and reproducible release
  checks, plus a release preparation command producing a tarball and SHA-256.
- A tag workflow that assembles assets in a draft before publishing an immutable
  GitHub Release.

### Changed

- Every Zod object is strict, matching the generated JSON Schemas' rejection of
  unknown properties at both root and nested levels.
- `npm run check` now proves the executable contract, package exports, consumer
  bundle, frozen versions, reproducibility and Handbook pack in one gate.

## [0.2.0] - 2026-09-10

### Added

- A declarative Handbook game pack under `handbook/adrenaline/`, with light and
  dark palettes, the three Adrenaline document capabilities, three original
  textures and two redistributable local fonts.
- A strict root `handbook.json` catalogue that lets Handbook 2.7.0 or newer
  install and update the Adrenaline pack directly from this repository.
- Local catalogue, pack, asset, licence and contrast validation, including
  negative fixtures for unsafe paths, missing capabilities and inconsistent
  catalogue entries.
- A cross-repository installation harness that exercises the real installer of
  the declared minimum Handbook release, including successful asset replacement
  and atomic rollback after a failed update.

### Changed

- Validation fixtures now live under the shared `corpus/temoins/` and
  `corpus/refus/` layout.
- CI validates the Adrenaline package and theme against the immutable Handbook
  release named by `minimumHandbookVersion`, then installs the published
  catalogue through that host.

### Fixed

- Preserved readable Adrenaline content contrast on dark backgrounds.

## [0.1.0] - 2026-09-08

### Added

- Three character schemas for the Adrenaline System common ground, under
  `schemas/adrenaline/`: `pj` (player character), `pnj` (non-player character)
  and `monstre` (creature). Each comes with two examples exercising opposite
  ends of its range.
- Common Zod subschemas under `src/zod/common/`: characteristics, hit locations,
  damage thresholds, protections, gear, trainings, identity, narrative block and
  a contagion block kept generic enough for something other than a virus.
- The subschemas reproduce the published sheets: a skill carries its speciality,
  its own percentage, the characteristic it is rolled against, its total and its
  advantages; a training is one of three printed kinds and may list its skills or
  leave them to a separate global block, as the NPC sheet does; each damage
  threshold carries a base value and the value once protection is counted; the
  identity block holds exactly the nine printed fields, the character name
  sitting outside it.
- Repository skeleton: Zod → JSON Schema generation, example validation and a
  TOML-to-JSON helper, derived from `4rtamis/schema-in-the-mist` under MIT.
- `src/zod/common/primitives.ts`: four named numeric primitives — `Pourcentage`,
  `Points`, `Compte`, `Cumul` — each bounded on both sides. A bare `z.int()`
  generates `"maximum": 9007199254740991`, so nothing was actually capped before.
- `src/zod/common/meta.ts`: an optional attribution block on all three targets,
  recording publication kind, source, authors, page and licence.
- `src/zod/common/danger.ts`: the danger level, declared once instead of twice.
- An inferred TypeScript type exported beside every schema.
- `tools/audit-schemas.ts` and the `audit` script: draft-7 meta-schema validity,
  Ajv compilation, `$id` presence, description coverage, numeric bounds, plus a
  source walk banning `.refine()` and `.default()`.
- `tests/temoins/` (3 documents that must validate) and `tests/refus/`
  (23 documents that must not), replayed by the audit. They live outside
  `examples/` because `validate-examples.ts` would fail on the refusal corpus.
- Versioned copies of every schema under `schemas/<game>/<version>/`, whose
  `$id` carries the version in its own path. The moving copy under
  `schemas/<game>/` still points at `main`; pin the frozen one if you need the
  document to stay put. Versioning goes through the path rather than a git tag,
  because the same file served from a tag would still declare `main`, and
  draft-7 admits a single `$id` per document.
- An audit check that the frozen copy exists, carries the expected versioned
  `$id`, and matches the current schema byte for byte apart from that `$id`, so
  a published version cannot drift unnoticed.
- Six decision records under `aidd_docs/memory/internal/decisions/`: the
  `adrenaline` common ground rather than a game folder, `.meta({ $id })` rather
  than `.meta({ id })` which Ajv ignores silently, versioning by path, three
  targets rather than one discriminated union, derived values stored as printed,
  and enums closed only on what the engine itself fixes.
- Prettier, with `format` and `format:check` scripts.

### Changed

- `npm run check` now chains typecheck, generation, validation and audit. It
  previously ran generation and validation only.
- Description coverage went from 61 % to 351/351 properties, and every field
  carries `examples`.
- One word per concept in the damage-threshold code: "seuil" throughout,
  "palier" dropped.
- The `total` of a skill is documented as unverified by the schema — draft-7
  cannot express a dependency on a value living in another block, so a consumer
  must recompute it rather than believe it.
