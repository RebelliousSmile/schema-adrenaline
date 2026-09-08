# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Three character schemas for the Adrenaline System common ground, under
  `schemas/adrenaline/`: `pj` (player character), `pnj` (non-player character)
  and `monstre` (creature). Each comes with two examples exercising opposite
  ends of its range.
- Common Zod subschemas under `src/zod/common/`: characteristics, hit locations,
  damage thresholds, protections, gear, trainings, identity, narrative block and
  a contagion block kept generic enough for something other than a virus.
- Repository skeleton: Zod → JSON Schema generation, example validation and a
  TOML-to-JSON helper, derived from `4rtamis/schema-in-the-mist` under MIT.
