# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [3.3.0] - 2026-10-06

### Added

- The Adrenaline pack declares `--adrenaline-resume-accent` and
  `--adrenaline-resume-accent-ink` in both polarities: the dotted rule, the tab
  and the labels of the scenario "Résumé" card (garnet in light, yellow in
  dark). Both are required note tokens.

### Changed

- Dark `--adrenaline-note-surface` is `#3D3636` instead of `#2B1A16`.

## [3.2.0] - 2026-10-05

### Changed

- The Adrenaline pack declares `--adrenaline-h2-rule` as `transparent`: the
  booklet prints h2 without a rule. `--adrenaline-h3-rule` is the garnet of
  `--adrenaline-rule` (`#9D2416`) instead of the darker `#71170F`.

### Added

- `adrenaline-role` (alias `role`) in `ADRENALINE_VISUAL_CALLOUTS`: the role
  card of the scenario booklet, a display-font title on a garnet band over the
  rosy surface of the encart.

## [3.1.0] - 2026-10-05

### Added

- `ADRENALINE_VISUAL_CALLOUTS`, exported by the package root and by
  `schema-adrenaline/presentation`, names seven visual callouts read from the
  Zombiology booklet: `adrenaline-exemple` (aliases `exemple`, `example`),
  `adrenaline-description`, `adrenaline-encart`, `adrenaline-formation`
  (modifier `fond`),
  `adrenaline-action`, `adrenaline-roller` (alias `roller`) and
  `adrenaline-mention` (alias `mention`; modifiers `video`, `audio`, `livre`,
  `lien`), a one-line reference: icon, bold label, then the body on the same
  line. The pack declares its `--adrenaline-mention-*` tokens (surface, border, title
  and one icon per modifier). Each entry requires the `style:adrenaline`
  capability.
- Page styles of the Zombiology scenario booklet, as pack tokens: an
  `--adrenaline-h1-surface`, `--adrenaline-h1-frieze` and
  `--adrenaline-h1-rule` (the white h1 panel, its vertical garnet frieze and
  closing rule), `--adrenaline-h2-rule`, an `--adrenaline-h3-rule`,
  `--adrenaline-inline-code-*` (font, transform,
  weight, colour), `--adrenaline-description-*` (rule, label and the white
  `--adrenaline-description-surface`), `--adrenaline-note-*` (the
  handwritten sheet of the native `note` callout) and
  `--adrenaline-callout-tip` with its ink and border.
- `--adrenaline-callout-title-font` and `--adrenaline-callout-title-weight`:
  callout titles and the test line of an action are set in the bold body
  serif, which stays legible at that size, instead of the display face.
- Schema baseline `3.1.0` (additive within contract 3): the compact PNJ and
  creature cards of the Zombiology _Livret PNJ et animaux_ (#41, #42). Every
  printed value is entered as printed; nothing is derived from a rule.
  - `Degats` (`versant`, `profils[{des, nature, condition}]`, `liant`,
    `proprietes`, `munitions`, `portee`) on a `Competence` and on a creature
    action; `Competence.action` for a free action line.
  - `categorie` (free text), `niveauDeDangerAlternatif` and
    `niveauDeDangerNote` on PNJ and creatures.
  - `ProtectionsAbregees`, used by PNJ and creatures: each side and each field
    optional, while the PJ keeps its required `solidite`. Armour gains `nom`,
    `des`, `couverture`, `proprietes` and `reduction {contre, valeur}`;
    character gains `des`, `emotions`, `proprietes` and `reduction`.
  - PNJ `pistes {stress, malusChoquants, malusBlessants}`: bold circles, as
    entered.
  - Creature `etatsPermanents`, `malusAvantHs`, `etatDeBase {nom,
declencheurs}` and `etatPrincipal` (the state printed on the large card);
    the state delta accepts the first two. Actions gain `test`, `degats` and
    one level of `suites`; `defense.niveau` (`oui`, `expose`, `non`).
- Presentation: a `compact-card` appearance beside `paper-sheet`, with ten
  more tokens and figures flush right (`values.align: "end"`); the forms `state-header`, `malus-tracks`, `inline-list`,
  `skill-lines` and `action-lines`; sections may be `collapsible`, take their
  title from a value (`labelFrom`) or sit on the creature's `principal` and
  `secondaire` cards (`cards`); descriptors may map `categorie` to a banner
  variant and icon (`categories`). `validate:presentation` checks each of
  them, with new self-tests.
- The Handbook pack declares `--adrenaline-banner-*`, `--adrenaline-trigger-*`
  and `--adrenaline-dice-badge-*` in both layers; `validate:pack` measures
  their contrast. It also declares `--adrenaline-malus-shock` (yellow) and
  `--adrenaline-malus-wound` (red), the colours of the two malus tracks.
- Examples `pnj/agent-de-securite.toml` and `monstre/infecte-zy-2.toml`, copied
  from the booklet; the legacy `etatAlternatif` form stays covered by
  `corpus/contract/valid/monstre-etat-alternatif-historique.toml`.
- `handbook/adrenaline/callout-contract.md` documents each callout, its
  modifiers, the inline marks and the tokens it reads;
  `handbook/adrenaline/callouts-example.md` is a note that renders all of them.
- The Handbook pack `0.7.0` adds the tokens behind them, in light and dark
  layers: `--h5-*`, `--adrenaline-keyword-*`,
  `--adrenaline-result-success-*`, `--adrenaline-result-failure-*`,
  `--adrenaline-example-rule`, `--adrenaline-formation-surface`,
  `--adrenaline-action-title-*` and `--adrenaline-action-border`.
- `validate:pack` checks every new ink/background pair (4.5:1) and every new
  rule or border (3:1); `validate:presentation` checks that each callout, alias
  and modifier is documented in the contract and rendered in the example.

### Changed

- The pack follows the scenario booklet: h1 and h2 are printed in the text
  ink instead of garnet; h3 leaves the display face for the semibold garnet
  body serif in normal case, over `--adrenaline-h3-rule`; `--bold-color` and
  `--list-marker-color` are the text ink.
- The pack's h4 is upright and bold, without a rule, instead of italic.
- The pack's typefaces are closer to the booklet: `Adrenaline Display` is now
  Rubik Dirt (eroded capitals) instead of Roboto Condensed, and
  `Adrenaline Body` is the variable EB Garamond (weights 400 to 800, so bold is
  no longer synthesised) instead of Noto Serif. Family names and file paths are
  unchanged; both are SIL OFL 1.1 substitutes from Fontsource, with their
  licence beside the files, and are not the typefaces of the original game.
- `examples/adrenaline/monstre/infecte-rodeur.toml` uses `etats` and
  `defense.niveau` instead of the legacy `etatAlternatif` and `defense.active`,
  both still accepted.
- `defense.active`, `desDeDegats` and `modificateurDeDegats` are documented as
  legacy forms; prefer `defense.niveau` and `degats`.
- The status badges are bright yellow and red, as in the booklet; their ink is
  measured against their own background.

## [3.0.0] - 2026-10-02

### Added

- The Handbook pack `0.6.0` adds six colour tokens for the Zombiology PJ
  sheet, in light and dark layers: `--adrenaline-field-border`,
  `--adrenaline-track-mark`, `--adrenaline-fatigue`,
  `--adrenaline-fatigue-ink`, `--adrenaline-condition` and
  `--adrenaline-condition-border`.
- `PJ_CARACTERISTIQUE_MAXIMUM` (50) and `caracteristiqueDeCreationPj(valeur)`
  publish how a PJ characteristic leaves character creation: the creation
  value is both its floor and its current value, and its upper bound is 50.
  The PJ schema describes that rule, and the PJ examples and witness follow
  it instead of `0 ≤ n ≤ n`.
- The presentation contract gains two optional fields. A section `row`
  (`{ id, span }`) sets neighbouring sections side by side, `span` in thirds of
  the sheet: the PJ Identité (one third) and Caractéristique (two thirds) share
  the `profil` row, as on the paper sheet. A block `fieldRows` publishes the
  printed rows of a field grid: the PJ identity reads Nationalité | Genre,
  Cheveux | Âge, Yeux | Taille, Peau | Poids, then Signes particuliers across.
- A `formation-columns` block may publish `formationTypes`, the printed
  columns in sheet order. The PJ block names Classe sociale, Professionnelle
  and Personnelle, so a consumer prints all three even when the document
  leaves one empty; the validator holds it equal to the formation type enum.
- A PJ competence prints its characteristic: `formationFields.competence` is
  now `nom`, `specialite`, `caracteristique`, `pourcentage`, and the PJ sheet
  reads « Tir (DEX) … 45 % ». The characteristic is no longer left to the roll.

### Changed

- A PJ holds at most three formations, one per type, and each names its type
  (`FormationJoueur`): the sheet always prints the three columns, and only
  their title is written. Two refusal witnesses prove it
  (`formation-en-trop`, `formation-sans-type`). PNJ formations are unchanged.
- **Breaking:** `etatDePartie.malus` follows the Malus block of the paper PJ
  sheet. `malus.physique` and `malus.mental`, two percentages the sheet never
  prints, are removed, and so is `etatDePartie.fatigue`, which was the Choc
  box under another name. `malus` now holds `choc` (`rounds` and `heures`,
  five circles each), `divers` (free text) and `total` (0 to 10; 10 malus is
  the HS state). The PJ presentation prints, in sheet order, the blocks
  `choc` (form `shock-circles`, replacing `fatigue-circles`), `divers`,
  `etats-encaisses` (now labelled « États ») and `total-malus` (new form
  `malus-scale`, decoration `{ kind: "scale", from: 1, to: 10 }`). Two refusal
  witnesses prove it (`malus-physique`, `total-des-malus-au-dela-de-hs`).

## [2.6.0] - 2026-09-26

### Added

- Schema baseline `2.2.0` adds `x-adrenaline-presentation` for PJ, PNJ and
  monster sheets, with `block:*` capabilities, ordered sections and blocks,
  JSON Pointer field membership, visual forms, tokens and font references.
- PJ characteristics are capped at 50 % without lowering PNJ or monster
  bounds; optional fatigue records rounds and hours in two five-circle groups.
- The Handbook pack includes the OFL-licensed Caveat handwriting face and
  card/ink tokens for the Zombiology presentation.
- Presentation validation checks root-property coverage and refuses unknown
  capabilities, paths and duplicate references.
- Playable ranges reserve `maximum` for editing; `minimum` appears only in the
  PJ characteristic creation column, while other ranges render `current`.
  Scalar editor bounds come from JSON Schema.

### Fixed

- Schema baseline immutability now resolves the first published package tag
  carrying each baseline, so baseline `2.1.0` is correctly attributed to
  package `v2.5.0`.
- Candidate workflow and release-train self-tests now participate in the
  ordinary provider release gate.

## [2.5.0] - 2026-09-24

### Added

- Schema baseline `2.1.0`: optional state-of-play counters for stress, malus
  and localized physical, mental or general temporary states on PJ, PNJ and
  creatures.
- Structured creature defense and actions, named creature states, and a public
  resolver that applies a complete state delta without consumer-local merging.

### Changed

- The historical singular `etatAlternatif` remains readable and is normalized
  to an identified state by the canonical Monster codec. New documents use
  `etats` and optional `etatActif`.

### Fixed

- The release train now consumes the shared protocol-1 manifest and evidence
  files, and gives Handbook a dedicated provider checkout at the immutable
  candidate commit while retaining the manifest checkout for supplier checks.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2026-09-23

### Added

- A release-train contract that verifies the same published package archive in
  Lantern and Handbook before it can be promoted to a final immutable release.
- Release validation now refuses tags without a complete immutable GitHub
  release, including the package tarball and its SHA-256 digest.

### Fixed

- The schema audit uses the declared Adrenaline schema baseline rather than the
  npm package version, and the CI provides the GitHub token required to inspect
  release metadata.
- Handbook link hover tokens must be stronger than the resting link contrast in
  both supported polarities.

## [2.3.0] - 2026-09-22

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
  `assert:adrenaline-contract`, which runs against the **published** package -
  and Handbook still pins `schema-adrenaline` to the v1.0.0 tarball while this
  repository is at 2.2.0, so that gate is green on a stale contract. Same shape
  as obsidian-handbook#36, which fixed it for `schema-pbta` by moving the pin.
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
