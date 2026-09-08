# Schema Adrenaline

Open, versioned data schemas for the **Adrenaline System** — the d100 engine by
Damien Coltice behind *Zombiology* — so VTTs, builders, and other digital tools
can **share the same data**.

The aim is an ecosystem of interoperable digital tools where they can exchange
structured JSON/TOML, validate it via schemas (e.g., using Zod), and leverage it
for their specific needs.

## Status

Early, but no longer empty. Three character schemas are published under the
`adrenaline` folder, each covered by two examples.

## Published schemas

They live under `adrenaline` rather than under a game folder because they
describe the engine itself: every game running on the Adrenaline System shares
them, and a game folder holds only what is specific to it.

| Schema | Covers |
| ------ | ------ |
| `schemas/adrenaline/pj.schema.json` | A player character sheet: identity, the eight characteristics, physical and mental damage thresholds, protections, trainings and gear. |
| `schemas/adrenaline/pnj.schema.json` | A non-player character record: identity only is required, everything else optional, from a named walk-on to a fully statted major character. |
| `schemas/adrenaline/monstre.schema.json` | A creature record: name and the four physical characteristics required, mental ones optional, with an alternate state, a generic contagion block and a narrative block. |

**These schemas describe the shape of a record, not its content.** They enumerate
no training, no skill, no weapon, no character trait and no creature. Every such
name is a free string, because those catalogues belong to each game and to its
publisher — not to the engine. What is closed is what the engine itself fixes:
the eight characteristics, the twelve hit locations, the four damage thresholds.

## What's in here

- `src/zod/` contains the source Zod v4 definitions
- `schemas/` contains the generated JSON Schemas
- `examples/` contains JSON/TOML examples per schema
- `tools/` provides generation and validation scripts

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

const schema = JSON.parse(
  fs.readFileSync("schemas/adrenaline/pj.schema.json", "utf8")
);

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
  and *Zombiology* are the work of Damien Coltice; any adaptation of a
  third-party setting (such as the d100 Wheel of Time adaptation) carries its own
  constraints. Fill this in with the actual terms before publishing.
