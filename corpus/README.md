# The corpus

Documents that prove something. Two halves, and neither proves anything alone.

## Why both halves

> "Without the witness, a series of refusals proves nothing — a schema that
> rejects everything would pass all of them."
>
> — `tools/audit-schemas.ts`

A corpus with only refusals would certify a broken schema just as well as a
sound one. A corpus with only witnesses would measure no bound at all.

## `temoins/`

One **complete** document per target: every field filled in, including the
ones this repository owns and no upstream game text describes yet.

A witness also serves as a rendering reference: if it stops rendering in
full, a downstream parser has regressed.

## `refus/`

**One file per real defect**, named after the defect it carries — never by a
number. Defects come from what actually happens when someone types up a
document by hand: a required field missing, a wrong type, an array written as
a table, a value outside its enum.

A refusal is read without opening the harness: the filename says what it is
wrong about (`nom-vide.json`, `caracteristique-hors-borne.json`,
`type-de-publication-inconnu.json`...).

## Shared structure across the schema repositories

This layout — `corpus/refus/`, `corpus/temoins/`, one file per defect, named
by the defect — is shared across the three schema repositories
(`schema-pbta`, `schema-adrenaline`, `schema-in-the-mist`), following the
precedent set by `obsidian-handbook`'s own `corpus/`. The two camps that read
it don't do the same work: a schema **rejects**, a consumer **degrades**. The
same corpus feeds both assertions, because deriving one camp's fixtures from
the other's would let them drift apart.

## Running

```bash
npm run audit
```

`tools/audit-schemas.ts` reads `corpus/temoins/<target>/` (must validate) and
`corpus/refus/<target>/` (must be rejected) for every target declared in
`src/zod/constants.ts`.
