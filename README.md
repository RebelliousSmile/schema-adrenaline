# Schema Adrenaline

Open, versioned data schemas for the **Adrenaline System** — the d100 engine by
Damien Coltice behind _Zombiology_ — so VTTs, builders, and other digital tools
can **share the same data**.

The repository is the shared Adrenaline source for **Handbook** and **Lantern**:
they exchange structured JSON/TOML through the schemas below, while each tool
keeps its own declarative integration alongside them.

## Status

The stable contract is `schema-adrenaline@1.0.0`. Three character schemas are
published under the `adrenaline` folder, each covered by JSON and TOML examples
and a shared conformance corpus.

## Published schemas

They live under `adrenaline` rather than under a game folder because they
describe the engine itself: every game running on the Adrenaline System shares
them, and a game folder holds only what is specific to it.

| Schema                                   | Covers                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemas/adrenaline/pj.schema.json`      | A player character sheet, following the printed one block for block: name, the eight characteristics, the four physical and four mental damage thresholds each with its covered value, protections, trainings with their skills, gear and game parameters. |
| `schemas/adrenaline/pnj.schema.json`     | A non-player character record: only the name is required, everything else optional, from a named walk-on with a danger level and one italic line to a fully statted major character.                                                                       |
| `schemas/adrenaline/monstre.schema.json` | A creature record: name and the four physical characteristics required, mental ones optional, with an alternate state, a generic contagion block and a narrative block.                                                                                    |

### What they do not carry

A sheet records a character, not the state of a session. The printed page also
holds stress dice, malus tracks, sustained wounds with their location and
duration, and an "Actuel" column beside each characteristic: all of these are
filled in during play and none of them is stored here.

Threshold values are stored as read, never recomputed. The engine derives them
(light = base + the tens digit of two characteristics, serious = light + 5, deep
= light + 10), but two published sheets differ from that derivation by one point,
so the schema records what the sheet prints.

**These schemas describe the shape of a record, not its content.** They enumerate
no training, no skill, no weapon, no character trait and no creature. Every such
name is a free string, because those catalogues belong to each game and to its
publisher — not to the engine. What is closed is what the engine itself fixes:
the eight characteristics, the twelve hit locations, the four damage thresholds.

## What's in here

- `src/zod/` contains the source Zod v4 definitions, each exporting its inferred
  TypeScript type beside the schema
- `schemas/` contains the generated JSON Schemas
- `examples/` contains JSON/TOML examples per schema
- `corpus/temoins/` holds one legitimate document per schema, which must validate
- `corpus/refus/` holds one malformed document per defect, each of which must be
  rejected
- `tools/` provides generation, validation and audit scripts
- `handbook.json` publishes the repository as a versioned Handbook catalogue
- `handbook/adrenaline/` is the versioned, declarative game plugin copied into
  Handbook from that catalogue; version 0.2.0 adds the licensed fonts and
  original light/dark textures while containing no executable code or external
  stylesheet

Lantern-specific integration files will live under `lantern/` when that
consumer needs them. Adrenaline remains one repository: neither consumer needs
a second per-game integration repository.

### Installing in Handbook

Handbook 2.7.0 or newer can install this repository directly. Open
**Settings → Handbook → Schema sources**, choose **Add source**, enter
`RebelliousSmile/schema-adrenaline`, select the release, tag or branch to
follow, then choose **Save and check**. Handbook reads `handbook.json` and
installs Adrenaline with its declared backgrounds and fonts.

Use **Check** on the same source to update it. Handbook downloads the catalogue,
pack and declared assets together, then replaces the installed source
atomically; no manual pack copy is required.

## Pinning a version

`npm run gen` writes each schema twice:

- `schemas/adrenaline/<target>.schema.json` — the latest version. Its `$id`
  points at `main`, and its content changes whenever the sources do.
- `schemas/adrenaline/<version>/<target>.schema.json` — a frozen copy, whose
  `$id` carries the version number in its own path.

Point your tool at the frozen copy if you need the document to stay put. An
`$id` under `main` changes content without changing identity, which is fine to
follow but not to depend on.

Versioning goes through the path, never through a git tag: the same file served
from a tag would still declare `main` as its `$id`, so its identity would not
match the URL serving it.

### Coordinating Handbook compatibility

The Handbook package declares one minimum host in
`handbook/adrenaline/pack.json`. CI derives the immutable Handbook tag directly
from `minimumHandbookVersion`; schema-adrenaline therefore needs no reciprocal
SHA file. Handbook, conversely, pins the full schema-adrenaline commit it tests
in `compat/schema-adrenaline.ref`.

Publish a compatibility change sequentially:

1. release the new Handbook host first, while it still accepts the last
   published Adrenaline package through its flat-colour and system-font
   fallbacks;
2. set the package's `minimumHandbookVersion` to that exact release, validate
   both repositories, and publish schema-adrenaline;
3. update Handbook's single schema-adrenaline SHA, run its full check, then
   publish any follow-up Handbook release.

This order avoids a circular pair of mutable references: the package tests a
released host tag, and the host tests one exact package commit.

## How far to trust these schemas

Claims about a schema are cheap, so `npm run audit` measures them instead. It
currently reports, and enforces:

- **351 of 351 properties carry a description** — a tool reading only
  `schemas/` never meets an unexplained field.
- **Every numeric value is bounded on both sides.** A bare `z.int()` compiles to
  `"maximum": 9007199254740991`; the four named primitives in
  `src/zod/common/primitives.ts` set real ceilings. Percentages stop at 200
  rather than 100, because the engine lets them pass 100 % — beyond it the roll
  succeeds automatically and gains quality.
- **Each schema is a valid draft-7 and compiles under Ajv,** which an
  unsatisfiable schema would not.
- **24 malformed documents are rejected and 3 legitimate JSON witnesses accepted,**
  alongside the TOML conformance cases indexed by `corpus/cases.json`.

What it does not prove: no schema can check that a skill's `total` equals its
percentage plus the characteristic it is rolled against — draft-7 cannot express
a dependency on a value living in another block. Recompute it, do not trust it.

## Provenance of a file

Every target carries an optional `meta` block recording where the record came
from: `typeDePublication` (`officiel`, `tiers`, `communautaire`, `maison`),
`source`, `auteurs`, `page` and `licence`. It describes the file. Do not confuse
it with `parametresDuJeu`, which describes a table's session.

## Using the contract in your tool

Install the immutable GitHub Release asset directly. npm records this complete
URL and its SHA-512 SRI integrity in the consumer lockfile:

```sh
npm install https://github.com/RebelliousSmile/schema-adrenaline/releases/download/v1.0.0/schema-adrenaline-1.0.0.tgz
```

### Types and codecs (TypeScript apps)

Import the public contract; do not copy the Zod sources into a consumer:

```ts
import {
  ADRENALINE_DOCUMENT_CODECS,
  PersonnageJoueur,
  parsePnjToml,
  type PersonnageJoueurValeur,
} from "schema-adrenaline";

const pj: PersonnageJoueurValeur = PersonnageJoueur.parse(userInputJson);
const pnj = parsePnjToml(tomlSource);
const json = ADRENALINE_DOCUMENT_CODECS.monstre.parseJson(jsonSource);
```

The registry keys are `pj`, `pnj` and `monstre`. Every codec parses and
serializes JSON and TOML through the same strict Zod schema, so unknown keys are
rejected rather than silently removed.

### Validate data (language-agnostic)

Use the frozen JSON Schemas exported by the installed package with any JSON
Schema validator (AJV, Python jsonschema, Rust jsonschema):

```ts
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schemaUrl = import.meta.resolve("schema-adrenaline/schemas/pj.schema.json");
const schema = JSON.parse(fs.readFileSync(new URL(schemaUrl), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync("path/to/data.json", "utf8"));
if (!validate(data)) console.error(validate.errors);
```

### Run the shared conformance kit

`schema-adrenaline/corpus/cases.json` lists every accepted and rejected JSON or
TOML case. Each `path` resolves from the package name, for example:

```ts
const manifestUrl = import.meta.resolve("schema-adrenaline/corpus/cases.json");
const manifest = JSON.parse(fs.readFileSync(new URL(manifestUrl), "utf8"));
const firstCaseUrl = import.meta.resolve(`schema-adrenaline/${manifest.cases[0].path}`);
```

Paths beginning with `examples/` and `corpus/` are public package exports.

### Compatibility and versioning

The npm contract and frozen schema paths use Semantic Versioning. A breaking
API or document-shape change requires a new major contract version; a changed
shape always receives a new `schemas/adrenaline/<version>/` directory. Published
version directories, tags and release assets are immutable.

The Handbook catalogue and game pack have their own version (`0.2.0` here).
Their version changes only when the pack changes and is deliberately independent
from the `1.0.0` contract version.

### Editor autocomplete for JSON and TOML

Configure the schema in your editor's settings (`json.schemas` in VS Code,
`evenBetterToml.schema.associations` for TOML), matched on a file glob.

Do **not** add a `"$schema"` key inside a data file that lives in `examples/`:
the generated schemas carry `"additionalProperties": false` at the root, so that
key makes `npm run validate` fail on the file.

## Derived work

This repository is derived from
[4rtamis/schema-in-the-mist](https://github.com/4rtamis/schema-in-the-mist),
whose tooling (`tools/`, generation and validation pipeline) it reuses under the
MIT licence. The schemas here are its own; nothing from the Mist Engine schemas
was copied.

## License

- **Code & Schemas:** MIT (see [LICENSE](./LICENSE)). The notice carries two
  copyright lines: the original author of the build tooling, and this
  repository's own author.

- **Docs:** CC BY 4.0 (see [here](./LICENSES/DOCS-LICENSE.md))

- **Trademark / community content notice:** to be written. The Adrenaline System
  and _Zombiology_ are the work of Damien Coltice; any adaptation of a
  third-party setting (such as the d100 Wheel of Time adaptation) carries its own
  constraints. Fill this in with the actual terms before publishing.
