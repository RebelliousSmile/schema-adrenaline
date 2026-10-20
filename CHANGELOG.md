# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [6.2.0] - 2026-10-20

### Changed

- The Handbook pack (0.14.0) publishes static fonts only. A Chromium PDF
  export writes every weight of a variable font as Type3 glyph procedures, and
  some printers refuse the file (RebelliousSmile/obsidian-handbook#116).
  `Adrenaline Body` is now one EB Garamond file per weight
  (`fonts/adrenaline-body-400.woff2` to `-800.woff2`, Fontsource 5.3.0, latin
  subset, unmodified): `assets.fonts` keeps the 400 face, and
  `fonts/faces.css` declares 500 to 800 from `assets.resources`. Handbook below
  2.22.0 does not install these and keeps synthesising bold from the 400 face.
  `Adrenaline Handwriting` is the static Caveat Regular, same file path.
  `fonts/adrenaline-body.woff2` is removed: a consumer that imported it by path
  reads the per-weight files instead.
- `validate:handbook` refuses a variable font in `assets.fonts` or
  `assets.resources`, an unknown asset field, and a pack stylesheet that
  Handbook would drop (`@import`, a URL outside the declared files).

## [6.1.0] - 2026-10-15

### Changed

- The published JSON Schema for a creature now refuses `etatAlternatif` together
  with `etats` or `etatActif`, as the codec already did. Until now a JSON Schema
  validator accepted the mix that the codec rejected. The codec and the corpus
  are unchanged; only the published schema is stricter. Contract 6 is kept.

## [6.0.0] - 2026-10-15

### Breaking

- A PNJ or creature damage threshold (`base`, `couvert`) of zero is refused:
  the paper sheet never prints a zero threshold, so a `0 / 0 / 0 / 0` row was a
  blank field read as a value. The document is rejected, naming `base`, instead
  of printing `SP 0 / 0 / 0 / 0`. Procedure: enter the real threshold, or remove
  the `sante` block. The triplet keeps `minimum = 0`; its `current` must be at
  least 1. The PJ thresholds are unchanged.

## [5.0.0] - 2026-10-12

### Breaking

- The PJ shock box (`etatDePartie.malus.choc`) loses `heures`: the sheet prints only the five « round » circles, so the field had nothing to fill. A document that writes it is now refused; remove the key. The PNJ and creature shock keep it.

- The PJ loses `equipement.armesMentales`, with no replacement: no field takes
  its place. The social weapons are a reference table published by the
  presentation (block `armes-sociales`), not an entry. A PJ document that still
  enters `armesMentales` is rejected, naming the key. Procedure: remove the
  `[[equipement.armesMentales]]` tables from the PJ block. The example
  `survivante-complete.toml` drops them.
- The PJ loses `protections.physiques.solidite`, `protections.mentales.solidite`
  and both `bouclier` entries: the paper sheet prints neither. `protections`
  itself becomes optional on the PJ. A document that still enters one of those
  keys is rejected, naming the key. Procedure: remove `solidite` and `bouclier`
  from the PJ block. The PNJ abbreviated protections are unchanged.
- The PJ characteristics become plain numbers from 0 to 50, like the PJ
  formation and skill percentages: the paper sheet prints one value per
  characteristic. A PJ document that still enters `{ minimum, current,
maximum }` for a characteristic is rejected, naming the key. Procedure:
  replace each characteristic table by its `current` value (`for = 30`).
  `caracteristiqueDeCreationPj` is removed; `PJ_CARACTERISTIQUE_MAXIMUM` stays.
  The PNJ and creature characteristics are unchanged.
- The PJ physical weapon loses `type` (contact or distance), which the paper
  sheet does not print: `nature` (choquante, blessante) takes its place. Its
  `pourcentage` becomes a plain number. A PJ weapon that still enters `type`
  or a triplet is rejected, naming the key. Procedure: remove `type`, keep
  the `current` value. It also loses `notes`, which the sheet does not print.
  The PNJ and creature weapons are unchanged.
- The PJ thresholds (`base`, `couvert`) and the protection `points` become plain
  numbers: the sheet prints one value. A PJ threshold or protection that still
  enters a triplet is rejected, naming the key. Procedure: replace each table
  by its `current` value (`base = 6`). The PNJ and creature values are unchanged.
- The PJ skill loses `caracteristique`: the paper sheet prints only a name, a
  specialty and a percentage, the game master picking the characteristic at the
  table. A PJ skill that still enters it is rejected, naming the key.
  Procedure: remove the key. The PNJ and creature skills are unchanged.
- The social weapons print the condition of the 2d10 first, then the die:
  "sans issue (2d10)" instead of "2d10 si sans issue".
- The Choc circles print the sheet's word, "ROUND": a group of `circle-groups` carries
  its document `key` (`rounds`) apart from its printed `label`.
- The wound columns carry no label: the presentation publishes their keys only
  (`columns: [{ key }]`), the sheet prints none.
- The equipment prints five weapon lines (as many as the advantages) and four
  possessions lines (`minimumRows`).
- The PJ presentation changes (the creature and PNJ ones do not):
  - the thresholds are printed "Léger", "Modéré", "Grave", "Profond", by
    position (the key `superficiel` prints "Léger"), with a malus count from 1
    to 4;
  - the characteristics print the current value only (`rangeDisplay` is
    `["current"]`);
  - the shock is five round circles (`circle-groups`), the total goes from 1 to
    9 then "HS" (`scale`), the stress dice offer "+1d100" and "+2d100" on both
    sides (`dice-options`);
  - the `armes-mentales` block is gone, replaced by `armes-sociales`;
  - the identity section is last, foldable and closed by default, out of the
    `profil` row; the `caracteristique` section takes the freed width;
  - the stress dice (block `stress`) move from the `sante` section to the
    `caracteristique` section; the `divers` block goes from the `status-frames`
    form to `circle-row`; the protections blocks go from `protection-lines` to
    `location-grid`.
- The presentation decoration `protection-units` is removed from the closed
  list: no block of the PJ, PNJ or creature presentation uses it any more
  (the 4.0.0 PJ was the last to). A descriptor that still declares it is
  refused by `validate:presentation` ("decoration is unknown").
- `rangeDisplay` now admits `current` only: the PJ publishes `["current"]` on
  its characteristics and neither the PNJ nor the creature uses the property.
  The type no longer offers `minimum`.
- The PNJ and creature schemas change by two descriptions and one example list
  (the shared weapon text no longer mentions the mental weapon; the examples
  of the weapon `type` go from "Contact", "Sociale" to "Contact", "Distance",
  "Psychologique"). No key, bound or presentation entry moves.

### Added

- `subtitlePaths` is also accepted on a `game-parameters` block: those
  pointers are printed on one line under the sheet label and no longer in the
  rows. The PJ publishes `/parametresDuJeu/typeDeScenario` there; the header
  rows keep the player, the creation type and the scenario.
- The PJ armour holds one line, as on the sheet: `protections.physiques.armure`
  keeps `nom`, `points` and `localisations`; `protections.mentales.caractere`
  keeps `trait`, `points` and `localisations`. The dice, the coverage, the
  properties, the emotions and the reduction of the PJ armour are no longer
  declared and a document that enters them is rejected. PNJ and creature keep
  their detailed protections.
- The PJ `equipement.armesSocialesBarrees`: the social weapons the
  character does not use, among the seven names of the table. The sheet strikes
  them out in the table, which keeps its seven lines; the others stay normal.
  Optional; the block `armes-sociales` now reads this one path.
- The PJ `etatDePartie.blessures.<versant>.<colonne>.notes`: the free text
  written under a wound, as on the paper sheet, which ticks one duration per
  column (the consumers tick one; the contract does not enforce it).
- The PJ `etatDePartie.etats` is one free text (the « États » zone of the
  sheet), no longer a list; PNJ and creature keep their list. A PJ document
  that enters a list is rejected.

- PJ, all optional: `parametresDuJeu.scenario`; `identite.contraintes`
  (`professionnelles`, `familiales`, `engagementsExterieurs`),
  `identite.historique`, `identite.personnalite`;
  `etatDePartie.malus.diversCercles` (0..4, the `divers` text is still read);
  `etatDePartie.blessures.physiques` and `.mentales`, each with
  `premiereColonne` and `secondeColonne`, each column holding `heure`, `jour`,
  `semaine`, `mois`, each a ticked or unticked circle (boolean, the sheet prints
  one circle per duration); `equipement.avantagesEtImmunites` (list of texts);
  `equipement.armesPhysiques[].nature` (`choquante` or `blessante`).
  `choc.heures`, the "couvert" threshold and the characteristics triplet stay.
- Presentation forms `reference-table`, `location-grid`, `wound-circles` and
  `circle-row`; block properties `referenceTable`, `thresholdLevels` and
  `notes`; the fixed texts of the sheet ("-10 %" for a substitute skill,
  "Marcher / Courir", "1 malus = -10 %", the d10 ranges).
- Block property `minimumRows` (PJ only, on the `ruled-list` and `weapon-lines`
  forms): the number of ruled lines the sheet prints at least, an integer of 1
  or more. Lines the document enters beyond it are printed after them and none
  is cut: it is a placement of the sheet, not a bound of the document, whose
  lists stay unbounded. The PJ publishes 7 on `possessions` (as many as the
  seven lines of the neighbouring social weapons table), 4 on `armes-physiques`
  and 3 on `avantages-immunites`. `validate:presentation` refuses it outside
  the PJ and on another form, refuses a value that is not an integer of 1 or
  more, and requires it on every PJ block of those forms.
- Blocks `avantages-immunites`, `blessures-physiques`, `blessures-mentales`,
  `contraintes`, `historique`, `personnalite`; the protections blocks print the
  location grid (six locations, three boxes each, a listed location ticks the
  first box).
- Refusal corpus: `armesMentales` on a PJ, an unknown identity key, a number
  where a wound circle expects a boolean.
- Exports: `EtatDePartieDeJoueur` and `IdentiteDeJoueur`, with the types
  `EtatDePartieDeJoueurValeur` and `IdentiteDeJoueurValeur`.
- Pack 0.12.0. Schema baseline `5.0.0`; `schemas/adrenaline/4.0.0` stays intact.

### Changed

- `contractVersion` goes from 4 to 5.
- `validate:presentation` knows the new forms and fixed texts; each rule has a
  negative proof in its self-test, and every refusal of the self-test names
  the message of the rule it targets. The rules of the validator for the PJ
  presentation are:
  - the social weapons table is pinned text by text (note, column titles, the
    seven lines in order, legend), and the PJ prints one reference table only,
    block `armes-sociales`, labelled "Armes sociales" in the `equipement`
    section; the reference table is refused outside the PJ;
  - a wound or protection decoration must match the side of its block, and
    that side is judged before the other rules of the decoration; the blocks
    `blessures-*`, `protections-*` and `divers` read the paths of their side
    (`/etatDePartie/blessures/<side>`, `/protections/<side>`,
    `/etatDePartie/malus/divers` and `/etatDePartie/malus/diversCercles`);
  - the forms `location-grid`, `wound-circles` and `circle-row` take the
    decoration of the same name and no other block takes those decorations;
    the PJ must publish the decoration of `stress` (dice options), `divers`,
    the wounds and the protections. The PNJ and creature publish no new
    decoration;
  - the durations and the columns of the wound decoration are exactly those
    the PJ schema declares for the side, each duration being a boolean;
  - the labels "Blessures physiques", "Blessures mentales", "Contraintes" and
    the three labelled lines of `contraintes` are pinned, with the section of
    these blocks;
  - `thresholdLevels` and `notes` are refused outside the PJ, and the PJ must
    publish the threshold levels;
  - the PJ must publish `rangeDisplay`, the "Scénario" line (the fourth, right
    after the scenario format) and the stress dice with the characteristics;
  - `fieldRows` must name each field once: only on the PJ is a field read by a
    sibling block (`contraintes`, `historique`, `personnalite`) left out of
    the grid, the PNJ and creature keep the rule unchanged.
- The PJ `etatDePartie.malus.choc.heures` stays in the contract, but the sheet
  prints only the five "round" circles: its description says so.

### Migration

- Remove the `[[equipement.armesMentales]]` tables from the PJ block. Nothing
  replaces them.
- Every new field is optional: a PJ document that did not use `armesMentales`
  stays valid unchanged.

## [4.0.0] - 2026-10-11

### Breaking

- The creature no longer carries `log`, `vol` or `cha` in `/caracteristiques`
  (the contract rejects them, naming the key). `per` stays. The
  same three keys are rejected in `etats[].delta.caracteristiques` and in the
  legacy `etatAlternatif.caracteristiques`. The PJ and PNJ characteristics are
  unchanged: PNJ examples that enter `log`, `vol` and `cha` stay valid. The
  creature example `predateur-pensant.toml` drops those three tables.
- The equipment is split. The creature replaces `armesMentales` with
  `armesPsychologiques`; the PNJ loses the `armesMentales` field; the PJ keeps
  `armesMentales`. A creature or a PNJ that enters `armesMentales` is rejected,
  naming the key, also inside `etats[].delta.equipement`.
- The list of states is closed. A creature declares at most one state besides
  its base: `etats` holds zero or one element (zero is the single-card
  creature), and the legacy `etatAlternatif` counts as that one state. A
  document with two or more `etats` is rejected, naming `etats`, by Zod and by
  the generated JSON Schema (`maxItems: 1`). Before, the states past the first
  were accepted and never printed. Mixing `etatAlternatif` with `etats` was
  already rejected by the codec at 3.4.0 (also with an empty `etats`) and still
  is. The refusal lives in the codec alone: the schema generator does not emit
  that constraint without a `refine`, which this repository forbids on the
  objects bound to the targets, so the published draft-7 JSON Schema accepts
  the mix. The `etats` description says so, and `validate:contract` guards it:
  the two mix fixtures must be refused by the codec and accepted by the schema.
- The creature presentation no longer has the `detection` and `deplacement`
  blocks: `/zoneDeDetection` and `/deplacement` are printed by the
  characteristics block.
- The "Meneur" collapsible section is removed from the creature and PNJ
  presentations: the game master's material is printed openly. The creature
  prints `/comportement` and `/traitsSpeciaux` (block `traits`, "Traits
  spéciaux") in the `comportement` section, on the `principal` card only (blocks
  `cards`), then the ordinary sections `competences`, `contagion` and `notes`
  (`/narratif`) outside the cards; the PNJ prints `/narratif` in an ordinary
  `notes` section. A section whose blocks are all empty is not printed. No path
  is dropped. The `collapsible` capability and its rule stay in the contract
  for the player sheet; the `fallbackCard` negative proof now targets
  `contagion`.
- The creature and the PNJ accept two forms for every numeric value, including
  inside a state `delta`: a plain number (the form to write) or the
  `{minimum,current,maximum}` triplet (still read), with the same bounds. This
  includes the test percentage of an action and of an action suite (`test` is
  now the soft competence, also in a state `delta.actions`); the generated
  creature and PNJ schemas carry no strict triplet any more, and
  `validate:presentation` proves it. The
  `minimum <= current <= maximum` check stays for triplets. The player
  character keeps the triplet only. Creatures and PNJs gain no XP, so their
  scores do not evolve. Corpus: plain-number and triplet witnesses for both
  targets, a PNJ out-of-range number refusal, a PJ plain-number refusal; the
  former PNJ refusal `caracteristique-scalaire-heritee` is now the witness
  `corpus/temoins/pnj/valeurs-nombres.json`.

### Added

- Block property `pointerRows`: rows of pointers (`fieldRows` stays reserved
  for the identity). The creature characteristics print two rows, FOR CON DEX
  RAP, then "Zone de détection", PER, "Dépl.". A cell without an entered value
  is not printed.
- Decoration `state-badge` on the `etat` block: a marker before each trigger
  and the box of the current state (`/etatActif`) on the main card only. The
  pack declares `--adrenaline-card-badge` (cyan) in both polarities; Lantern
  must draw it (a published card token that is not read fails its guard).
- Block property `cards` (the `malus` and `protections` blocks are published on
  the main card only) and section property `joinedTo`, carried by the section that follows:
  on the secondary card, `comportement` is printed right after `sante` under the
  single title "Santé et comportement", health first, as the book prints the
  small card. The main card keeps its two sections.
- Section property `fallbackCard`: when none of the cards named by `cards` is
  printed (a creature without a second state has no `secondaire` card), the
  section is printed on this card, at its place of `order` among the sections of
  that card. The `equipement` section, printed on the `secondaire` card only,
  declares `fallbackCard: "principal"`. Nothing else changes for a creature
  with one card: the case of the current state follows `current.cards`, and
  `joinedTo` only applies on its own card. A section printed on the
  `secondaire` card only must declare a fallback.
- Descriptor property `cards` (creature only): the declaration of the cards,
  `[{ id: "principal" }, { id: "secondaire", existsWhenAny: ["/etats",
"/etatAlternatif"] }]`. A card with `existsWhenAny` exists when the document
  enters a value at one of its pointers (a list counts when it is not empty);
  with none entered it does not exist, and its sections follow their
  `fallbackCard`. `principal` is always printed and carries no condition.
  `validate:presentation` requires every card cited by a section, a block, a
  `fallbackCard`, a `joinedTo` or the badge to be declared, every pointer to
  exist in the contract, and refuses `cards` on the PJ and the PNJ; each rule
  has a negative proof in the self-test.
- Refusal corpus, one file per case: `log`, `vol` and `cha` in
  `etats[].delta.caracteristiques` and in `etatAlternatif.caracteristiques`;
  `armesMentales` in `etats[].delta.equipement`; `armesPsychologiques` on the
  PNJ and on the PJ (each refused as an unrecognized key).
- `validate:presentation` checks every pointer row (descends from a block path,
  exists in the contract, placed once, fits the columns, every field of the
  paths printed), every join (an existing section, printed on the same card, not
  itself joined, coming first in `order`, non-empty title), the block `cards`,
  the badge (its `current` path read by the block, its cards cards of the
  section) and `fallbackCard` (a known card, not already in `cards`, the
  principal card, creature only, required on a section printed on the
  `secondaire` card only). Each of these rules has a negative proof in the
  self-test, as do the creature-only `stateBadge` token and the stray keys of
  the descriptor, sections and blocks.
- Block property `subtitlePaths` (`name-card` only): the pointers printed on
  one line under the name. The creature banner reads `/instinct` and
  `/typeDeCorps` (the creature gets its own header paths; the PNJ banner is
  unchanged), printed as "Enragé Corps moyen". The `corps` section loses its
  `labelFrom` (`/typeDeCorps`, now in the banner), the `comportement` section
  loses its `labelFrom` (`/instinct`) and is titled "Comportement"; the `corps`
  section prints no title (`showTitle: false`).
- `state-badge` publishes `current.position: "end"`: the case of the current
  state sits at the right of the state title band. The `state-header` form
  (README) defines the band, the round arrow icon and the bare-text trigger;
  nothing else is published and no colour is added.
- The `combat` block publishes `rowLabels: ["Actions", "Défense"]`; the README
  defines the "/round" and "bonus" wording of the form. The README also states
  that a `pointerRows` cell with a `label` prints in regular weight and that
  `threshold-rows` prints "SP 7 / 14 / 19 / 24" on the compact cards.
- `validate:presentation` guards `subtitlePaths` (name card only, not empty, no
  repeat, existing pointers read by the block) and `current.position`, each
  with a negative proof; a path used both in the subtitle and as a section
  label is refused by the existing uniqueness rule, now proved for both.
- Pack 0.11.0. Schema baseline `4.0.0`; `schemas/adrenaline/3.2.0` stays intact.

### Changed

- `contractVersion` goes from 3 to 4 (`cross-tool-provider.json`,
  `ADRENALINE_CONTRACT_VERSION`); `validate:package` now reads the expected
  value from the major of `package.json` instead of a literal.
- Creature presentation: the `sante` section moves from a `stack` to a
  two-column grid, thresholds and permanent states on one row. The thresholds
  block is labelled "SP" on the creature card, as the book prints it (it was
  "Seuils"; the PNJ card keeps "Seuils"), and the second label is "État" (it was
  "États permanents").

### Migration

- `traitsSpeciaux = [ "État Insensible." ]` stays a special trait: nothing is
  converted. Re-enter it as `etatsPermanents` where the state is meant.

## [3.4.0] - 2026-10-09

### Added

- The Adrenaline pack declares `--adrenaline-card-ink` in both polarities: the
  text colour of the compact PNJ and creature cards (dark red in light, a pale
  red in dark). It is a required note token with a contrast check against the
  card surface.
- The creature presentation prints `/malusAvantHs` with the new `malus-circles`
  form: one empty circle per malus as entered, then `HS`. Nothing is derived.
- Schema baseline `3.2.0` (additive within contract 3): the presentation lists
  the new form, so a frozen `schemas/adrenaline/3.2.0` tree is published next
  to the immutable `3.1.0` one.

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
