# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
