# Release train manifests

Commit one `protocol: 1` JSON manifest named `schema-adrenaline-vX.Y.Z.json` before promoting a release. Its `candidate` records the `schema-adrenaline` release URL, SHA-256, npm SHA-512 SRI, final version, RC tag, final tag and full provider commit. Its `consumers` array contains exactly Lantern and Handbook, each with its canonical repository and a full commit SHA.

The only accepted local runner entry point is:

```sh
npm run release-train:assert -- release-train/schema-adrenaline-vX.Y.Z.json
```

The release-train workflow keeps its root checkout at the commit carrying that manifest and its provider-side verifier. It copies the same committed JSON as `release-train.json` into each consumer checkout. Separately, it checks out `schema-adrenaline` at `candidate.providerCommit` with its full history and tags, then exposes only that directory to consumer proofs as `SCHEMA_ADRENALINE_ROOT`. This lets Handbook prove both the candidate checkout's `HEAD` and its `stagingTag` without treating the manifest checkout as candidate data.

Each consumer owns its `release-train:assert` implementation and writes `release-train.json.evidence.json`; the supplier checks the two evidence files against the candidate and their pinned consumer identities. The candidate checkout is derived from the existing protocol-1 field; it is not an additional manifest field or a consumer-local fallback.

The manifest admits no commands, branches, tags, short commits, local paths, query strings or unknown fields. The stable workflow downloads the RC archive, checks its SHA-256 and publishes those same bytes only after an approved train.
