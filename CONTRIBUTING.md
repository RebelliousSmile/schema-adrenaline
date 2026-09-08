# Contributing

Thanks for helping make Adrenaline System tools interoperate!

## How to propose a change

1. **Open an issue** describing the change (new field, new schema, clarification).
2. **Discuss** design/compat with maintainers and other tool authors.
3. **Submit a PR** that includes:

   - Zod v4 source updates in `src/zod/...`
   - A game entry in `GAMES` (`src/zod/constants.ts`) if the game is not declared yet
   - New target in `src/zod/constants.ts` like:

     ```ts
     {
        zod: PersonnageJoueur,
        game: GAMES.adrenaline,
        name: "pj",
     }
     ```

   - Re-generated JSON Schema in `schemas/...`
     ```sh
        npm run gen
     ```
   - At least **one example** in `examples/<game>/<object>/...`, directly in that
     directory: the validator lists one level and skips subdirectories silently.
   - Passing validation
     ```sh
       npm run check
     ```

## Where a new field goes

`adrenaline` is not a game: it is the engine, and it holds what every game
running on it shares — the eight characteristics, the twelve hit locations, the
four damage thresholds, the symmetry between physical and mental conflict. The
other `GAMES` entries hold only what belongs to one game.

Before adding a field, ask which of the two it is:

- **Systemic** — it would still make sense in another game on the same engine.
  It goes under `src/zod/common/`, and reaches the targets that need it. A new
  kind of protection or a new derived threshold is systemic.
- **Specific to one game** — it names something the engine knows nothing about.
  It goes under that game's own folder, in its own target. A setting's factions,
  its currency, its named locations are specific.

And when in doubt about _closing_ a field: close what the engine fixes, leave
open what a publisher writes. A characteristic key is closed; a training name, a
skill name, a weapon name, a character trait are free strings. Enumerating a
catalogue would both freeze it and reproduce editorial content.

## Ground rules

- **Canonical source is Zod** (we generate JSON Schema from it).
- **Backward compatibility:** try as much as possible to avoid breaking changes.
- **Metadata:** add concise descriptions and examples to your fields. With Zod, make use of `.meta({ description, examples })`
- **`.default()` vs `.optional()`:** generation runs in the _output_ view, so a
  field carrying `.default()` lands in the schema's `required` list — exactly like
  a bare field. Use `.optional()` for a genuinely optional field, and reach for
  `.default()` only when the value it invents is the only one it could be.
- **Never `.refine()` on an object bound for `TARGETS`:** the constraint vanishes
  silently from the generated JSON Schema, and nothing catches it — under Zod 4 a
  refined object is still a `ZodObject`, so `SchemaTarget` accepts it and `tsc`
  is happy. Write the constraint into `.meta({ description })` instead, and treat
  it as documented rather than enforced.
- **Composition:** compose objects with `A.extend(B.shape)`, never with
  `A.and(B)` — an intersection generates an `allOf` of two objects each carrying
  `additionalProperties: false`, which no document can satisfy.
- **Numbers go through `src/zod/common/primitives.ts`:** `Pourcentage`, `Points`,
  `Compte` and `Cumul` each carry a lower _and_ an upper bound. A bare `z.int()`
  emits `"maximum": 9007199254740991`, which is no ceiling at all — a sheet with
  a characteristic of one hundred thousand would validate. Reach for the
  primitive that names the quantity rather than writing `z.int().min(0)` again.
  Note that `Pourcentage` stops at 200, not at 100: the engine lets a percentage
  pass 100 %, and the excess buys automatic success and quality.
- **Attribution goes in the `meta` block** (`src/zod/common/meta.ts`), never in
  `parametresDuJeu`: the first describes the file and where it comes from, the
  second describes a table's session.

## Quality gate

`npm run check` chains four steps, and each one can fail the build:

| Step        | What it proves                                       |
| ----------- | ---------------------------------------------------- |
| `typecheck` | The Zod sources compile under `--strict`.            |
| `gen`       | Every target produces a JSON Schema.                 |
| `validate`  | Every file in `examples/` is accepted by its schema. |
| `audit`     | The schemas are worth trusting — see below.          |

`npm run audit` (`tools/audit-schemas.ts`) is the one that measures rather than
asserts. On the sources it forbids `.refine()` and `.default()`. On each
generated schema it checks draft-7 validity against the meta-schema, an Ajv
compile (an unsatisfiable schema passes the meta-schema but not this), the
presence of an `$id`, a description on every single property, and that no
numeric bound was left at `MAX_SAFE_INTEGER`. Then it replays two corpora:

- `tests/temoins/<target>/` — legitimate documents that **must be accepted**.
  Without them, a schema that rejected everything would pass every refusal case.
- `tests/refus/<target>/` — malformed documents that **must be rejected**, one
  defect each, the filename naming the defect.

Both live outside `examples/` on purpose: `validate-examples.ts` would choke on
the refusal corpus, and it does not recurse into subdirectories anyway.

Adding a field means adding its refusal case. A constraint no test exercises is
a constraint nobody will notice losing.

## Publishing a version

The version in `package.json` drives the frozen copies under
`schemas/<game>/<version>/`. Bumping it makes `npm run gen` write a new frozen
directory beside the previous ones.

A frozen directory that has been published must never be regenerated or edited
by hand: someone may already be pinning it. The audit checks that each frozen
copy matches the current schema byte for byte apart from its `$id`, so bumping
the version is the only correct way to change a published shape.

## Dev commands

```bash
npm ci
npm run gen            # generate JSON Schemas
npm run validate       # validate example files
npm run audit          # measure schema quality, replay the test corpora
npm run typecheck      # tsc --noEmit
npm run format         # Prettier, in place
npm run format:check   # Prettier, read-only
npm run check          # typecheck + gen + validate + audit
```
