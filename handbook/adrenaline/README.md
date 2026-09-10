# Adrenaline for Handbook

This directory is the declarative Adrenaline System game plugin for Handbook.
It contains no executable code: Handbook supplies the parsers, renderers and
structural styles that the manifest declares as requirements.

## Install

Copy this whole `adrenaline` directory to Handbook's persistent data folder:

```text
<vault>/<configDir>/handbook/packs/adrenaline
```

Restart Handbook, then choose **Adrenaline System** as the game mode. Remove
the copied directory and restart Handbook to uninstall it.

`configDir` is usually `.obsidian`, but Handbook reads the vault's actual
configuration directory. The manifest requires Handbook 2.7.0 or newer.

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
