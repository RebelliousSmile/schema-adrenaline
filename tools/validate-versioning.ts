import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ADRENALINE_SCHEMA_VERSION } from "../src/contract-version.js";

const root = process.cwd();
const schemaRoot = path.join("schemas", "adrenaline");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  version: string;
};
const catalogue = JSON.parse(fs.readFileSync(path.join(root, "handbook.json"), "utf8")) as {
  packs: Array<{ id: string; version: string; path: string }>;
};

type Release = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  immutable: boolean;
  assets: Array<{ name: string; digest?: string }>;
};

// v2.5.0 was published immutable before the workflow adopted canonical asset names.
const legacyReleaseAssets = new Map([
  ["v2.5.0", { archive: "candidate.tgz", checksum: "candidate.tgz.sha256" }],
]);

for (const entry of catalogue.packs) {
  const pack = JSON.parse(fs.readFileSync(path.join(root, entry.path), "utf8")) as {
    version: string;
    pack: { id: string };
  };
  assert.equal(entry.version, pack.version, `${entry.id}: catalogue and pack versions differ`);
  assert.equal(entry.id, pack.pack.id, `${entry.id}: catalogue and pack ids differ`);
}

function git(args: string[], allowFailure = false): string | null {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    if (allowFailure) return null;
    throw new Error(`git ${args.join(" ")} failed\n${result.stderr ?? ""}`);
  }
  return result.stdout;
}

function normalizeLineEndings(value: string): string {
  return value.replaceAll("\r\n", "\n");
}

function releases(): Release[] {
  const fixture = process.env.SCHEMA_ADRENALINE_RELEASES_JSON;
  const raw = fixture
    ? fs.readFileSync(path.resolve(root, fixture), "utf8")
    : (() => {
        const result = spawnSync(
          "gh",
          ["api", "repos/RebelliousSmile/schema-adrenaline/releases?per_page=100"],
          { cwd: root, encoding: "utf8", env: process.env },
        );
        if (result.status !== 0) {
          throw new Error(
            `cannot list GitHub releases: ${result.stderr ?? result.error?.message ?? ""}`,
          );
        }
        return result.stdout;
      })();
  const value = JSON.parse(raw) as unknown;
  assert.ok(Array.isArray(value), "GitHub releases response must be an array");
  return value.map((candidate): Release => {
    assert.ok(candidate && typeof candidate === "object", "GitHub release must be an object");
    const release = candidate as Record<string, unknown>;
    assert.equal(typeof release.tag_name, "string", "GitHub release tag_name must be text");
    assert.equal(typeof release.draft, "boolean", "GitHub release draft must be boolean");
    assert.equal(typeof release.prerelease, "boolean", "GitHub release prerelease must be boolean");
    assert.equal(typeof release.immutable, "boolean", "GitHub release immutable must be boolean");
    assert.ok(Array.isArray(release.assets), "GitHub release assets must be an array");
    return {
      tag_name: release.tag_name as string,
      draft: release.draft as boolean,
      prerelease: release.prerelease as boolean,
      immutable: release.immutable as boolean,
      assets: release.assets.map((asset) => {
        assert.ok(asset && typeof asset === "object", "GitHub release asset must be an object");
        const value = asset as Record<string, unknown>;
        assert.equal(typeof value.name, "string", "GitHub release asset name must be text");
        if (value.digest !== undefined)
          assert.equal(typeof value.digest, "string", "GitHub release asset digest must be text");
        return { name: value.name as string, digest: value.digest as string | undefined };
      }),
    };
  });
}

function validatePublishedReleases(
  tags: string[],
  published: Release[],
  pendingTag?: string,
): void {
  for (const tag of tags) {
    if (tag === pendingTag) continue;
    const release = published.find((candidate) => candidate.tag_name === tag);
    assert.ok(release, `${tag}: tag has no GitHub release`);
    assert.equal(release.draft, false, `${tag}: release is still a draft`);
    assert.equal(release.prerelease, false, `${tag}: release is a prerelease`);
    assert.equal(release.immutable, true, `${tag}: release is not immutable`);
    const canonicalArchive = `schema-adrenaline-${tag.slice(1)}.tgz`;
    const expectedAssets = legacyReleaseAssets.get(tag) ?? {
      archive: canonicalArchive,
      checksum: `${canonicalArchive}.sha256`,
    };
    const archive = release.assets.find((asset) => asset.name === expectedAssets.archive);
    assert.ok(archive, `${tag}: release lacks ${expectedAssets.archive}`);
    assert.ok(archive.digest?.startsWith("sha256:"), `${tag}: archive lacks a SHA-256 digest`);
    assert.ok(
      release.assets.some((asset) => asset.name === expectedAssets.checksum),
      `${tag}: release lacks ${expectedAssets.checksum}`,
    );
  }
}

function validatePendingRelease(
  pendingTag: string | undefined,
  packageVersion: string,
  tags: string[],
  published: Release[],
  isAncestor: (tag: string) => boolean,
): string | undefined {
  if (pendingTag === undefined) return undefined;
  assert.match(pendingTag, /^v\d+\.\d+\.\d+$/, "pending release tag must be stable SemVer");
  assert.equal(
    pendingTag,
    `v${packageVersion}`,
    "pending release tag must match the package version",
  );
  assert.ok(tags.includes(pendingTag), `${pendingTag}: pending release tag does not exist`);
  assert.ok(
    isAncestor(pendingTag),
    `${pendingTag}: pending release tag is not an ancestor of HEAD`,
  );
  const release = published.find((candidate) => candidate.tag_name === pendingTag);
  assert.ok(!release || release.draft, `${pendingTag}: pending release must be absent or draft`);
  if (release)
    assert.equal(release.prerelease, false, `${pendingTag}: pending release is prerelease`);
  return pendingTag;
}

function selfTest(): void {
  const valid: Release = {
    tag_name: "v2.3.0",
    draft: false,
    prerelease: false,
    immutable: true,
    assets: [
      { name: "schema-adrenaline-2.3.0.tgz", digest: `sha256:${"a".repeat(64)}` },
      { name: "schema-adrenaline-2.3.0.tgz.sha256" },
    ],
  };
  validatePublishedReleases(["v2.3.0"], [valid]);
  const legacyValid: Release = {
    ...valid,
    tag_name: "v2.5.0",
    assets: [
      { name: "candidate.tgz", digest: `sha256:${"b".repeat(64)}` },
      { name: "candidate.tgz.sha256" },
    ],
  };
  validatePublishedReleases(["v2.5.0"], [legacyValid]);
  assert.throws(
    () => validatePublishedReleases(["v2.4.0"], [{ ...legacyValid, tag_name: "v2.4.0" }]),
    /lacks schema-adrenaline-2\.4\.0\.tgz/,
  );
  assert.throws(
    () =>
      validatePublishedReleases(
        ["v2.5.0"],
        [{ ...legacyValid, assets: legacyValid.assets.slice(0, 1) }],
      ),
    /lacks candidate\.tgz\.sha256/,
  );
  assert.throws(
    () => validatePublishedReleases(["v2.3.0"], [{ ...valid, assets: [] }]),
    /lacks schema-adrenaline-2\.3\.0\.tgz/,
  );
  assert.throws(() => validatePublishedReleases(["v2.3.1"], [valid]), /tag has no GitHub release/);
  const pending = validatePendingRelease(
    "v2.3.1",
    "2.3.1",
    ["v2.3.0", "v2.3.1"],
    [valid],
    () => true,
  );
  validatePublishedReleases(["v2.3.0", "v2.3.1"], [valid], pending);
  const draft = { ...valid, tag_name: "v2.3.1", draft: true, immutable: false, assets: [] };
  assert.equal(
    validatePendingRelease("v2.3.1", "2.3.1", ["v2.3.1"], [draft], () => true),
    "v2.3.1",
  );
  assert.throws(
    () => validatePendingRelease("v2.3.1", "2.3.0", ["v2.3.1"], [], () => true),
    /must match the package version/,
  );
  assert.throws(
    () => validatePendingRelease("v2.3.1", "2.3.1", ["v2.3.1"], [], () => false),
    /not an ancestor of HEAD/,
  );
  assert.throws(
    () => validatePendingRelease("v2.3.0", "2.3.0", ["v2.3.0"], [valid], () => true),
    /must be absent or draft/,
  );
  assert.throws(
    () => validatePublishedReleases(["v2.3.0", "v2.3.1"], [], "v2.3.1"),
    /v2\.3\.0: tag has no GitHub release/,
  );
  const releaseWorkflow = fs.readFileSync(
    path.join(root, ".github", "workflows", "release.yml"),
    "utf8",
  );
  assert.ok(
    releaseWorkflow.includes('archive="schema-adrenaline-${RELEASE_TAG#v}.tgz"'),
    "release workflow must derive the canonical archive name",
  );
  assert.ok(
    releaseWorkflow.includes(
      'gh release upload "$RELEASE_TAG" "$RELEASE_ARCHIVE" "$RELEASE_CHECKSUM" --clobber',
    ),
    "release workflow must upload the named archive and checksum outputs",
  );
  assert.ok(
    !releaseWorkflow.includes("--output candidate.tgz"),
    "release workflow must not publish the legacy candidate asset name",
  );
  console.log("✓ release completeness self-test passed");
}

if (process.argv.includes("--self-test")) {
  selfTest();
  process.exit(0);
}

const versionDirectories = fs
  .readdirSync(schemaRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+\.\d+\.\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();
const versionTags = (git(["tag", "--list", "v*.*.*"]) ?? "")
  .trim()
  .split("\n")
  .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag));
const publishedReleases = releases();
const pendingRelease = validatePendingRelease(
  process.env.SCHEMA_ADRENALINE_PENDING_RELEASE,
  packageJson.version,
  versionTags,
  publishedReleases,
  (tag) => git(["merge-base", "--is-ancestor", `${tag}^{commit}`, "HEAD"], true) !== null,
);
validatePublishedReleases(versionTags, publishedReleases, pendingRelease);
assert.ok(
  versionDirectories.includes(ADRENALINE_SCHEMA_VERSION),
  `missing schema baseline ${ADRENALINE_SCHEMA_VERSION}`,
);

for (const version of versionDirectories) {
  const tag = `v${version}`;
  const publishedCommit = git(["rev-parse", "--verify", `${tag}^{commit}`], true);
  if (publishedCommit === null) {
    assert.equal(
      version,
      ADRENALINE_SCHEMA_VERSION,
      `${version}: untagged historical schema directory`,
    );
    console.log(`✓ ${version} is the unpublished current candidate`);
    continue;
  }

  const relativeRoot = path.posix.join("schemas", "adrenaline", version);
  const publishedFiles = (git(["ls-tree", "-r", "--name-only", tag, relativeRoot]) ?? "")
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();
  const currentFiles = fs
    .readdirSync(path.join(root, relativeRoot))
    .filter((name) => name.endsWith(".schema.json"))
    .map((name) => path.posix.join(relativeRoot, name))
    .sort();
  assert.deepEqual(
    currentFiles,
    publishedFiles,
    `${relativeRoot}: file list differs from immutable ${tag}`,
  );
  for (const relative of currentFiles) {
    assert.equal(
      normalizeLineEndings(fs.readFileSync(path.join(root, relative), "utf8")),
      normalizeLineEndings(git(["show", `${tag}:${relative}`]) ?? ""),
      `${relative} differs from immutable ${tag}`,
    );
  }
  console.log(`✓ ${relativeRoot} matches ${tag} (${publishedCommit.trim()})`);
}

console.log(
  `\n✅ Package ${packageJson.version}, contract ${ADRENALINE_SCHEMA_VERSION}, schema, catalogue and pack versions are coherent.`,
);
