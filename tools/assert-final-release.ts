import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Candidate } from "./assert-release-train.js";

type Asset = { name: string; digest: string; browser_download_url: string };
type Release = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  immutable: boolean;
  assets: Asset[];
};

export type FinalArtifact = {
  provider: "schema-adrenaline";
  releaseUrl: string;
  sha256: string;
  integrity: string;
  version: string;
};

export type FinalProvenance = {
  finalTag: string;
  tagCommit: string;
  candidateManifestSha256: string;
  artifact: FinalArtifact;
};

const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;

export function readCandidateManifest(file: string): Candidate {
  const train = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
  assert.deepEqual(Object.keys(train).sort(), ["protocol", "candidate", "consumers"].sort());
  assert.equal(train.protocol, 1, "candidate manifest protocol must be 1");
  assert.ok(
    train.candidate && typeof train.candidate === "object" && !Array.isArray(train.candidate),
  );
  const candidate = train.candidate as Candidate;
  assert.deepEqual(
    Object.keys(candidate).sort(),
    [
      "provider",
      "releaseUrl",
      "sha256",
      "integrity",
      "version",
      "stagingTag",
      "finalTag",
      "providerCommit",
    ].sort(),
    "candidate manifest has unknown or missing fields",
  );
  assert.equal(candidate.provider, "schema-adrenaline");
  assert.match(candidate.version, /^\d+\.\d+\.\d+$/, "candidate version must be stable SemVer");
  assert.equal(candidate.finalTag, `v${candidate.version}`);
  assert.match(
    candidate.stagingTag,
    new RegExp(`^v${candidate.version.replaceAll(".", "\\.")}-rc\\.\\d+$`),
  );
  assert.equal(
    candidate.releaseUrl,
    `https://github.com/RebelliousSmile/schema-adrenaline/releases/download/${candidate.stagingTag}/schema-adrenaline-${candidate.version}.tgz`,
    "candidate URL must be canonical",
  );
  assert.match(candidate.sha256, SHA256);
  assert.match(candidate.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/);
  assert.match(candidate.providerCommit, COMMIT);
  assert.ok(
    Array.isArray(train.consumers) && train.consumers.length === 2,
    "candidate manifest needs both consumers",
  );
  const roles = (train.consumers as Array<Record<string, unknown>>).map((consumer) => {
    assert.ok(consumer && typeof consumer === "object" && !Array.isArray(consumer));
    assert.deepEqual(Object.keys(consumer).sort(), ["role", "repository", "ref"].sort());
    assert.ok(consumer.role === "lantern" || consumer.role === "handbook");
    assert.equal(
      consumer.repository,
      consumer.role === "lantern" ? "RebelliousSmile/lantern" : "RebelliousSmile/obsidian-handbook",
    );
    assert.match(consumer.ref as string, COMMIT);
    return consumer.role;
  });
  assert.deepEqual(roles.sort(), ["handbook", "lantern"]);
  return candidate;
}

function hash(algorithm: "sha256" | "sha512", bytes: Buffer): string {
  return createHash(algorithm)
    .update(bytes)
    .digest(algorithm === "sha512" ? "base64" : "hex");
}

function git(args: string[]): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr ?? result.error?.message}`);
  return result.stdout.trim();
}

function gitFileAtTag(tag: string, file: string): Buffer {
  const result = spawnSync("git", ["show", `${tag}:${file}`]);
  if (result.status !== 0)
    throw new Error(
      `cannot read ${file} at ${tag}: ${result.stderr?.toString() ?? result.error?.message}`,
    );
  return result.stdout;
}

function githubRelease(tag: string): Release {
  const result = spawnSync(
    "gh",
    [
      "api",
      "-H",
      "X-GitHub-Api-Version: 2026-03-10",
      `repos/RebelliousSmile/schema-adrenaline/releases/tags/${tag}`,
    ],
    { encoding: "utf8", env: process.env },
  );
  if (result.status !== 0)
    throw new Error(`cannot read ${tag} release: ${result.stderr ?? result.error?.message}`);
  return JSON.parse(result.stdout) as Release;
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  assert.ok(response.ok, `${url}: download failed (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

export function finalArtifact(candidate: Candidate): FinalArtifact {
  return {
    provider: "schema-adrenaline",
    releaseUrl: `https://github.com/RebelliousSmile/schema-adrenaline/releases/download/${candidate.finalTag}/schema-adrenaline-${candidate.version}.tgz`,
    sha256: candidate.sha256,
    integrity: candidate.integrity,
    version: candidate.version,
  };
}

export function assertFinalReleaseFacts(
  candidate: Candidate,
  release: Release,
  finalBytes: Buffer,
  candidateBytes: Buffer,
  checksumBytes: Buffer,
): FinalArtifact {
  const artifact = finalArtifact(candidate);
  const archiveName = `schema-adrenaline-${candidate.version}.tgz`;
  const checksumName = `${archiveName}.sha256`;
  assert.equal(release.tag_name, candidate.finalTag, "release tag differs from manifest");
  assert.equal(release.draft, false, "final release is draft");
  assert.equal(release.prerelease, false, "final release is prerelease");
  assert.equal(release.immutable, true, "final release is not immutable");
  assert.deepEqual(
    release.assets.map(({ name }) => name).sort(),
    [archiveName, checksumName].sort(),
    "final release must contain only the canonical archive and checksum",
  );
  const archive = release.assets.find(({ name }) => name === archiveName);
  const checksum = release.assets.find(({ name }) => name === checksumName);
  assert.ok(archive && checksum, "canonical assets are missing");
  assert.equal(archive.browser_download_url, artifact.releaseUrl, "archive URL is not canonical");
  assert.equal(
    checksum.browser_download_url,
    `${artifact.releaseUrl}.sha256`,
    "checksum URL is not canonical",
  );
  assert.match(candidate.sha256, SHA256);
  assert.equal(archive.digest, `sha256:${candidate.sha256}`, "release asset digest differs");
  assert.equal(hash("sha256", finalBytes), candidate.sha256, "final archive SHA-256 differs");
  assert.equal(hash("sha256", candidateBytes), candidate.sha256, "candidate SHA-256 differs");
  assert.ok(
    finalBytes.equals(candidateBytes),
    "final archive differs byte-for-byte from candidate",
  );
  assert.equal(
    `sha512-${hash("sha512", finalBytes)}`,
    candidate.integrity,
    "final archive SRI differs",
  );
  assert.equal(
    checksumBytes.toString("utf8"),
    `${candidate.sha256}  ${archiveName}\n`,
    "published checksum does not name and hash the canonical archive",
  );
  assert.equal(
    checksum.digest,
    `sha256:${hash("sha256", checksumBytes)}`,
    "checksum asset digest differs",
  );
  return artifact;
}

export async function verifyFinalRelease(manifestPath: string): Promise<FinalProvenance> {
  const candidate = readCandidateManifest(manifestPath);
  const manifestName = path.posix.join(
    "release-train",
    `schema-adrenaline-${candidate.finalTag}.json`,
  );
  assert.equal(
    path.relative(process.cwd(), path.resolve(manifestPath)).replaceAll("\\", "/"),
    manifestName,
    "candidate manifest path does not match its final tag",
  );
  const tagCommit = git(["rev-parse", "--verify", `${candidate.finalTag}^{commit}`]);
  assert.match(tagCommit, /^[a-f0-9]{40}$/, "final tag must resolve to a full commit");
  const remoteRefs = git([
    "ls-remote",
    "origin",
    `refs/tags/${candidate.finalTag}`,
    `refs/tags/${candidate.finalTag}^{}`,
  ]);
  const remoteTagCommit =
    remoteRefs
      .split("\n")
      .find((line) => line.endsWith(`refs/tags/${candidate.finalTag}^{}`))
      ?.split(/\s+/)[0] ?? remoteRefs.split(/\s+/)[0];
  assert.equal(remoteTagCommit, tagCommit, "local final tag differs from published provider tag");
  const taggedManifest = gitFileAtTag(candidate.finalTag, manifestName);
  assert.deepEqual(
    JSON.parse(taggedManifest.toString("utf8")),
    JSON.parse(fs.readFileSync(manifestPath, "utf8")),
    "candidate manifest differs from the exact final tag",
  );
  const release = githubRelease(candidate.finalTag);
  const artifact = finalArtifact(candidate);
  const [finalBytes, candidateBytes, checksumBytes] = await Promise.all([
    download(artifact.releaseUrl),
    download(candidate.releaseUrl),
    download(`${artifact.releaseUrl}.sha256`),
  ]);
  assertFinalReleaseFacts(candidate, release, finalBytes, candidateBytes, checksumBytes);
  return {
    finalTag: candidate.finalTag,
    tagCommit,
    candidateManifestSha256: hash("sha256", taggedManifest),
    artifact,
  };
}

function selfTest(): void {
  const bytes = Buffer.from("proven candidate bytes");
  const digest = hash("sha256", bytes);
  const candidate: Candidate = {
    provider: "schema-adrenaline",
    releaseUrl:
      "https://github.com/RebelliousSmile/schema-adrenaline/releases/download/v2.6.0-rc.1/schema-adrenaline-2.6.0.tgz",
    sha256: digest,
    integrity: `sha512-${hash("sha512", bytes)}`,
    version: "2.6.0",
    stagingTag: "v2.6.0-rc.1",
    finalTag: "v2.6.0",
    providerCommit: "a".repeat(40),
  };
  const archive = finalArtifact(candidate).releaseUrl;
  const checksumBytes = Buffer.from(`${digest}  schema-adrenaline-2.6.0.tgz\n`);
  const release: Release = {
    tag_name: "v2.6.0",
    draft: false,
    prerelease: false,
    immutable: true,
    assets: [
      {
        name: "schema-adrenaline-2.6.0.tgz",
        browser_download_url: archive,
        digest: `sha256:${digest}`,
      },
      {
        name: "schema-adrenaline-2.6.0.tgz.sha256",
        browser_download_url: `${archive}.sha256`,
        digest: `sha256:${hash("sha256", checksumBytes)}`,
      },
    ],
  };
  assert.deepEqual(
    assertFinalReleaseFacts(candidate, release, bytes, bytes, checksumBytes),
    finalArtifact(candidate),
  );
  assert.throws(
    () =>
      assertFinalReleaseFacts(
        candidate,
        { ...release, tag_name: "v2.5.0" },
        bytes,
        bytes,
        checksumBytes,
      ),
    /release tag differs/,
  );
  assert.throws(
    () =>
      assertFinalReleaseFacts(
        candidate,
        { ...release, assets: release.assets.slice(1) },
        bytes,
        bytes,
        checksumBytes,
      ),
    /canonical archive/,
  );
  assert.throws(
    () => assertFinalReleaseFacts(candidate, release, Buffer.from("wrong"), bytes, checksumBytes),
    /SHA-256 differs/,
  );
  assert.throws(
    () => assertFinalReleaseFacts(candidate, release, bytes, bytes, Buffer.from("wrong")),
    /published checksum/,
  );
  assert.throws(
    () =>
      assertFinalReleaseFacts(
        { ...candidate, integrity: "sha512-wrong" },
        release,
        bytes,
        bytes,
        checksumBytes,
      ),
    /SRI differs/,
  );
  console.log("✓ canonical final release provenance self-test passed");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--self-test")) selfTest();
  else {
    const manifest = process.argv[2];
    if (!manifest) throw new Error("usage: assert-final-release <candidate-manifest>");
    console.log(JSON.stringify(await verifyFinalRelease(manifest)));
  }
}
