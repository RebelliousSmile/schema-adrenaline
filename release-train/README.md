# Release train manifests

Commit one `protocol: 1` JSON manifest named `schema-adrenaline-vX.Y.Z.json` before promoting a release. Its `candidate` records the `schema-adrenaline` release URL, SHA-256, npm SHA-512 SRI, final version, RC tag, final tag and full provider commit. Its `consumers` array contains exactly Lantern and Handbook, each with its canonical repository and a full commit SHA.

The only accepted local runner entry point is:

```sh
npm run release-train:assert -- release-train/schema-adrenaline-vX.Y.Z.json
```

The release-train workflow keeps its root checkout at the commit carrying that manifest and its provider-side verifier. It copies the same committed JSON as `release-train.json` into each consumer checkout. Separately, it checks out `schema-adrenaline` at `candidate.providerCommit` with its full history and tags, then exposes only that directory to consumer proofs as `SCHEMA_ADRENALINE_ROOT`. This lets Handbook prove both the candidate checkout's `HEAD` and its `stagingTag` without treating the manifest checkout as candidate data.

Each consumer owns its `release-train:assert` implementation and writes `release-train.json.evidence.json`; the supplier checks the two evidence files against the candidate and their pinned consumer identities. The candidate checkout is derived from the existing protocol-1 field; it is not an additional manifest field or a consumer-local fallback.

The manifest admits no commands, branches, tags, short commits, local paths, query strings or unknown fields. The stable workflow downloads the RC archive, checks its SHA-256 and publishes those same bytes only after an approved train.

After final publication, commit a separate `schema-adrenaline-vX.Y.Z-final.json` record. It uses the established protocol-2 envelope: `protocol: 2`, `artifact` (`provider`, canonical final `releaseUrl`, `sha256`, `integrity`, `version`), and exactly two `consumers` (`role`, canonical `repository`, full commit `ref`). Keep the protocol-1 candidate manifest and its prerelease consumer refs unchanged. The provider derives the final tag and its exact commit from the version, compares the candidate manifest at that tag with the committed manifest, and verifies that both the candidate and canonical final URLs download identical bytes with the declared SHA-256 and SHA-512 SRI. It verifies the final checksum asset and immutable release metadata as well.

Lantern and Handbook own their final lockfile and runtime proofs. Each proof must name the same final artifact and exact consumer commit, a `pnpm-lock.yaml` URL and SRI matching the final artifact, and a passing journey with concrete checks. The provider checks those proofs against the committed final record and emits evidence naming the final tag commit, the candidate-manifest digest, and both consumer commits. Final convergence is complete only after that gate passes; a published release alone does not close the handoff.

The immutable `v2.5.0` release has the historical `candidate.tgz` asset name and cannot gain a canonical asset. The canonical post-promotion handoff starts with `v2.6.0`, whose release already carries `schema-adrenaline-2.6.0.tgz` and its checksum.
