# Adrenaline for Handbook

This directory is the declarative Adrenaline System game plugin for Handbook.
It contains no executable code: Handbook supplies the parsers, renderers and
structural styles that the manifest declares as requirements.

## Install

With Handbook 2.7.0 or newer, open **Settings → Handbook → Schema sources**,
choose **Add source**, enter `RebelliousSmile/schema-adrenaline`, then select the
release, tag or branch to follow. **Save and check** installs the Adrenaline
pack. Choose **Adrenaline System** as the game mode after installation.

Use **Check** on the source to update it. Handbook replaces the installed
manifest, three backgrounds and three fonts atomically, so no manual directory
copy or restart is required.

## Visual package

The package owns Adrenaline's values and static files: a restrained paper
texture for light pages, a charcoal/organic texture for dark pages, a warning
stripe, and three locally loaded typefaces. Handbook owns their selectors,
layout and fallbacks; Lantern may consume the same source files independently.

The three textures are original generated assets, not scans or fragments of a
published book. Their generation prompts and provenance are recorded in
`../../LICENSES/ADRENALINE-ASSETS.md`. Font licenses are stored beside the
repository licenses. The current asset payload is reported by
`npm run validate:handbook`.

The text and title faces are freely redistributable substitutes, taken
unmodified from Fontsource; they are not claimed to be the typefaces of the
original game. `Adrenaline Body` is EB Garamond (variable, weights 400 to 800,
`@fontsource-variable/eb-garamond@5.3.0`) and `Adrenaline Display` is Rubik
Dirt (`@fontsource/rubik-dirt@5.3.0`), both Latin subsets under the SIL Open
Font License 1.1, included at `assets/fonts/EBGaramond-OFL.txt` and
`assets/fonts/RubikDirt-OFL.txt`.

The handwriting face is [Caveat](https://github.com/googlefonts/caveat),
downloaded from commit `59745e818ef7973e11e70cb1358d0e902b56c5fc`.
Its unmodified font file is distributed under the SIL Open Font License 1.1,
included at `assets/fonts/Caveat-OFL.txt`.

## Pack tokens vs. host selectors

`pack.json` is the single source of truth for every Zombiology-aligned visual
value: colors, weights, capitalization, decoration keywords and the list
marker glyph, declared once in `style.base` (polarity-independent) and once
per polarity in `style.light`/`style.dark`. Handbook only owns the CSS
selectors that read these custom properties — it must never hardcode a
Zombiology value, so another Adrenaline pack can restyle the same structural
selectors without touching Handbook's code.

Token groups introduced for the Zombiology alignment:

- `--h3-*` and `--adrenaline-h3-rule`: the semibold garnet serif third
  heading level over a full-width garnet rule (the rule is a border, not a
  text underline).
- `--h4-*` (font, transform, weight, style, decoration, color) and `--h5-*`
  (font, transform, weight, style, color): the bold brown-garnet serif fourth
  and fifth levels, without a rule.
- `--adrenaline-emphasis-*` (style, color): italic red narrative emphasis
  used in example/callout body text.
- `--adrenaline-list-marker-glyph`: the triangular bullet character; the
  existing `--list-marker-color` still drives its color.
- `--adrenaline-status-yellow-bg`/`-ink` and `--adrenaline-status-red-bg`/`-ink`:
  filled status badges (e.g. malus severity), distinct from the plain
  `--color-yellow`/`--color-red` text colors and from the pre-existing
  `--adrenaline-signal`/`-ink` pair. A badge is measured ink against its own
  fill, so the yellow badge uses a vivid yellow with dark ink rather than the
  darkened signal amber, which is measured against the page.
- `--adrenaline-table-header-bg`/`-ink` and `--adrenaline-table-border`/
  `--adrenaline-table-stripe`: table header band and row treatment.
- `--adrenaline-callout-cartouche-bg`/`-ink`: the dark banner used for
  labelled callout headers (e.g. "EXEMPLE"), reusing the `--adrenaline-cartouche`
  pair's values under a callout-scoped name.

- `--adrenaline-keyword-*` (color, transform, weight): the bold capitalised
  keyword that opens a paragraph (`<span class="adrenaline-keyword">`).
- `--adrenaline-result-success-*`/`-failure-*`: square result badges of an
  action (`<mark class="adrenaline-result-…">`).
- `--adrenaline-example-rule`, `--adrenaline-formation-surface`,
  `--adrenaline-action-title-bg`/`-ink` and `--adrenaline-action-border`: the
  Zombiology callouts declared by `ADRENALINE_VISUAL_CALLOUTS`. Their syntax,
  modifiers and token map are in `callout-contract.md`; `callouts-example.md`
  is a note covering every callout, heading level and list.
- `--adrenaline-mention-border`, `--adrenaline-mention-title` and
  `--adrenaline-mention-icon` with one `--adrenaline-mention-icon-<modifier>`
  per modifier: the one-line `adrenaline-mention` callout. An icon token holds
  an Obsidian icon name (`lucide-…`).

If a future pack omits one of these tokens, Handbook's structural selectors
must fall back to a neutral value (inherited color, no decoration, disc
marker) rather than fail: the pack declares intent, it never becomes a hard
dependency of the host renderer.
