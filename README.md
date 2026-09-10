# Schema Adrenaline

Open, versioned data schemas for the **Adrenaline System** — the d100 engine by
Damien Coltice behind _Zombiology_ — so VTTs, builders, and other digital tools
can **share the same data**.

The repository is the shared Adrenaline source for **Handbook** and **Lantern**:
they exchange structured JSON/TOML through the schemas below, while each tool
keeps its own declarative integration alongside them.

## Status

Early, but no longer empty. Three character schemas are published under the
`adrenaline` folder, each covered by two examples.

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
- `handbook/adrenaline/` is the versioned, declarative game plugin copied into
  Handbook; it contains no executable code

Lantern-specific integration files will live under `lantern/` when that
consumer needs them. Adrenaline remains one repository: neither consumer needs
a second per-game integration repository.

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
- **23 malformed documents are rejected and 3 legitimate ones accepted.**

What it does not prove: no schema can check that a skill's `total` equals its
percentage plus the characteristic it is rolled against — draft-7 cannot express
a dependency on a value living in another block. Recompute it, do not trust it.

## Provenance of a file

Every target carries an optional `meta` block recording where the record came
from: `typeDePublication` (`officiel`, `tiers`, `communautaire`, `maison`),
`source`, `auteurs`, `page` and `licence`. It describes the file. Do not confuse
it with `parametresDuJeu`, which describes a table's session.

## Using the schemas in your tool

### Use Zod directly (TS apps)

If you use TypeScript and Zod parsing, you can copy/paste the provided Zod schemas:

```ts
import { PersonnageJoueur } from "./src/zod/adrenaline/pj";
const parsed = PersonnageJoueur.parse(userInputJson);
```

### Validate data (language-agnostic)

Use any JSON Schema validator (AJV, Python jsonschema, Rust jsonschema). Example with AJV:

```ts
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schema = JSON.parse(fs.readFileSync("schemas/adrenaline/pj.schema.json", "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync("path/to/data.json", "utf8"));
if (!validate(data)) console.error(validate.errors);
```

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
