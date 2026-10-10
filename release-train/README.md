# Release train manifests

Commit one `protocol: 1` JSON manifest named `schema-adrenaline-vX.Y.Z.json` before promoting a release. Its `candidate` records the `schema-adrenaline` release URL, SHA-256, npm SHA-512 SRI, final version, RC tag, final tag and full provider commit. Its `consumers` array contains exactly Lantern and Handbook, each with its canonical repository and a full commit SHA.

Neither record is typed by hand. `.github/workflows/promote.yml`, dispatched with the candidate tag once both consumers have merged its bump, writes the protocol-1 manifest from the published candidate and the `main` commits that pin it, commits it, tags the final on that commit and dispatches the release. The `converge` job of `.github/workflows/release.yml` writes the protocol-2 record once both `main` branches pin the final, then dispatches final convergence. Both use `tools/write-release-train.ts`, which only records facts and never rewrites a committed record with other ones; the gates described below judge them.

The only accepted local runner entry point is:

```sh
npm run release-train:assert -- release-train/schema-adrenaline-vX.Y.Z.json
```

The consumers are proven against the provider before the train leaves (the presentation of the supervisor); no workflow replays those proofs on the candidate manifest. Each consumer still owns its `release-train:assert` implementation and writes `release-train.json.evidence.json`; final convergence runs it on the final record.

The manifest admits no commands, branches, tags, short commits, local paths, query strings or unknown fields. The stable workflow downloads the RC archive, checks its SHA-256 and publishes those same bytes only from a commit that carries the manifest and descends from `candidate.providerCommit`.

After final publication, commit a separate `schema-adrenaline-vX.Y.Z-final.json` record. It uses the established protocol-2 envelope: `protocol: 2`, `artifact` (`provider`, canonical final `releaseUrl`, `sha256`, `integrity`, `version`), and exactly two `consumers` (`role`, canonical `repository`, full commit `ref`). Keep the protocol-1 candidate manifest and its prerelease consumer refs unchanged. The provider derives the final tag and its exact commit from the version, compares the candidate manifest at that tag with the committed manifest, and verifies that both the candidate and canonical final URLs download identical bytes with the declared SHA-256 and SHA-512 SRI. It verifies the final checksum asset and immutable release metadata as well.

Lantern and Handbook own their final lockfile and runtime proofs. Each proof must name the same final artifact and exact consumer commit, a `pnpm-lock.yaml` URL and SRI matching the final artifact, and a passing journey with concrete checks. The provider checks those proofs against the committed final record and emits evidence naming the final tag commit, the candidate-manifest digest, and both consumer commits. Final convergence is complete only after that gate passes; a published release alone does not close the handoff.

Run `npm run release-train:verify-final` to validate any committed final records against the published release and the exact remote consumer lockfiles. The ordinary `npm run check` includes this command, and skips it while no final record exists. Once consumer owners provide full commits on `main`, commit the final record and dispatch `.github/workflows/final-convergence.yml` with its path. The workflow checks out those commits, runs each consumer's own `release-train:assert`, then uploads `final-convergence.json` with both proof files. Consumer migrations and proof implementation are tracked in [issue #36](https://github.com/RebelliousSmile/schema-adrenaline/issues/36); this repository only validates their published results.

The immutable `v2.5.0` release has the historical `candidate.tgz` asset name and cannot gain a canonical asset. The canonical post-promotion handoff starts with `v2.6.0`, whose release already carries `schema-adrenaline-2.6.0.tgz` and its checksum.
