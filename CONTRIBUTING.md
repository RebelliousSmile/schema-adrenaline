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

And when in doubt about *closing* a field: close what the engine fixes, leave
open what a publisher writes. A characteristic key is closed; a training name, a
skill name, a weapon name, a character trait are free strings. Enumerating a
catalogue would both freeze it and reproduce editorial content.

## Ground rules

- **Canonical source is Zod** (we generate JSON Schema from it).
- **Backward compatibility:** try as much as possible to avoid breaking changes.
- **Metadata:** add concise descriptions and examples to your fields. With Zod, make use of `.meta({ description, examples })`
- **`.default()` vs `.optional()`:** generation runs in the *output* view, so a
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

## Dev commands

```bash
npm ci
npm run gen            # generate JSON Schemas
npm run validate       # validate example files
npm run check          # generate + validate
```
