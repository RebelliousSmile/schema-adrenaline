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
manifest, three backgrounds and two fonts atomically, so no manual directory
copy or restart is required.

## Visual package

The package owns Adrenaline's values and static files: a restrained paper
texture for light pages, a charcoal/organic texture for dark pages, a warning
stripe, and two locally loaded typefaces. Handbook owns their selectors,
layout and fallbacks; Lantern may consume the same source files independently.

The three textures are original generated assets, not scans or fragments of a
published book. Their generation prompts and provenance are recorded in
`../../LICENSES/ADRENALINE-ASSETS.md`. Font licenses are stored beside the
repository licenses. The current asset payload is reported by
`npm run validate:handbook`.

## Pack tokens vs. host selectors

`pack.json` is the single source of truth for every Zombiology-aligned visual
value: colors, weights, capitalization, decoration keywords and the list
marker glyph, declared once in `style.base` (polarity-independent) and once
per polarity in `style.light`/`style.dark`. Handbook only owns the CSS
selectors that read these custom properties — it must never hardcode a
Zombiology value, so another Adrenaline pack can restyle the same structural
selectors without touching Handbook's code.

Token groups introduced for the Zombiology alignment:

- `--h4-*` (font, transform, weight, style, decoration, color): the red,
  underlined, italic fourth heading level.
- `--adrenaline-emphasis-*` (style, color): italic red narrative emphasis
  used in example/callout body text.
- `--adrenaline-list-marker-glyph`: the triangular bullet character; the
  existing `--list-marker-color` still drives its color.
- `--adrenaline-status-yellow-bg`/`-ink` and `--adrenaline-status-red-bg`/`-ink`:
  filled status badges (e.g. malus severity), distinct from the plain
  `--color-yellow`/`--color-red` text colors and from the pre-existing
  `--adrenaline-signal`/`-ink` pair, which `--adrenaline-status-yellow-*`
  reuses by value since both represent the same amber severity marker.
- `--adrenaline-table-header-bg`/`-ink` and `--adrenaline-table-border`/
  `--adrenaline-table-stripe`: table header band and row treatment.
- `--adrenaline-callout-cartouche-bg`/`-ink`: the dark banner used for
  labelled callout headers (e.g. "EXEMPLE"), reusing the `--adrenaline-cartouche`
  pair's values under a callout-scoped name.

If a future pack omits one of these tokens, Handbook's structural selectors
must fall back to a neutral value (inherited color, no decoration, disc
marker) rather than fail: the pack declares intent, it never becomes a hard
dependency of the host renderer.
