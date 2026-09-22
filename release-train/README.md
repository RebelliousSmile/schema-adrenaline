# Release train manifests

Commit one JSON manifest named `schema-adrenaline-vX.Y.Z.json` before promoting a release. It records the final tag, staged final-version archive URL and SHA-256, plus the full immutable provider, Lantern and Handbook commits. The only accepted runner entry point is:

```sh
npm run release-train:assert -- release-train/schema-adrenaline-vX.Y.Z.json
```

The manifest admits no commands, branches, tags, short commits or local URLs. Consumer assertions remain owned by their repositories.
