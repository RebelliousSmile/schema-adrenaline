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
