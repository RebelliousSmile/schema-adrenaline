import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";

export type ConsumerRole = "lantern" | "handbook";
export type Candidate = {
  provider: "schema-adrenaline";
  releaseUrl: string;
  sha256: string;
  integrity: string;
  version: string;
  stagingTag: string;
  finalTag: string;
  providerCommit: string;
};
export type Consumer = {
  role: ConsumerRole;
  repository: "RebelliousSmile/lantern" | "RebelliousSmile/obsidian-handbook";
  ref: string;
};
export type Train = { protocol: 1; candidate: Candidate; consumers: Consumer[] };

const SHA256 = /^[a-f0-9]{64}$/;
const SHA512_SRI = /^sha512-[A-Za-z0-9+/]+={0,2}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const REPOSITORIES = {
  lantern: "RebelliousSmile/lantern",
  handbook: "RebelliousSmile/obsidian-handbook",
} as const;

function fail(message: string): never {
  throw new Error(`release-train manifest: ${message}`);
}
function exactKeys(value: Record<string, unknown>, keys: string[], label: string): void {
  const actual = Object.keys(value).sort();
  if (actual.join("\0") !== [...keys].sort().join("\0"))
    fail(`${label} has unknown or missing fields`);
}
function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`${label} must be an object`);
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${label} must be non-empty text`);
  return value;
}

function parseCandidate(rawValue: unknown): Candidate {
  const raw = object(rawValue, "candidate");
  exactKeys(
    raw,
    [
      "provider",
      "releaseUrl",
      "sha256",
      "integrity",
      "version",
      "stagingTag",
      "finalTag",
      "providerCommit",
    ],
    "candidate",
  );
  if (raw.provider !== "schema-adrenaline") fail("candidate.provider must be schema-adrenaline");
  const version = text(raw.version, "candidate.version");
  if (!VERSION.test(version)) fail("candidate.version must be a final SemVer version");
  const stagingTag = text(raw.stagingTag, "candidate.stagingTag");
  if (!new RegExp(`^v${version.replaceAll(".", "\\.")}-rc\\.\\d+$`).test(stagingTag))
    fail("candidate.stagingTag must name the versioned RC");
  const finalTag = text(raw.finalTag, "candidate.finalTag");
  if (finalTag !== `v${version}`) fail("candidate.finalTag must match candidate.version");
  const releaseUrl = text(raw.releaseUrl, "candidate.releaseUrl");
  const parsed = new URL(releaseUrl);
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "github.com" ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !==
      `/RebelliousSmile/schema-adrenaline/releases/download/${stagingTag}/schema-adrenaline-${version}.tgz`
  )
    fail("candidate.releaseUrl must name the immutable GitHub candidate archive");
  const sha256 = text(raw.sha256, "candidate.sha256");
  if (!SHA256.test(sha256)) fail("candidate.sha256 must be a lowercase full SHA-256");
  const integrity = text(raw.integrity, "candidate.integrity");
  if (!SHA512_SRI.test(integrity)) fail("candidate.integrity must be an npm SHA-512 SRI value");
  const providerCommit = text(raw.providerCommit, "candidate.providerCommit");
  if (!COMMIT.test(providerCommit))
    fail("candidate.providerCommit must be a lowercase full Git commit");
  return {
    provider: "schema-adrenaline",
    releaseUrl,
    sha256,
    integrity,
    version,
    stagingTag,
    finalTag,
    providerCommit,
  };
}

function parseConsumer(rawValue: unknown, index: number): Consumer {
  const raw = object(rawValue, `consumers[${index}]`);
  exactKeys(raw, ["role", "repository", "ref"], `consumers[${index}]`);
  const role = text(raw.role, `consumers[${index}].role`);
  if (role !== "lantern" && role !== "handbook") fail(`consumers[${index}].role is invalid`);
  if (raw.repository !== REPOSITORIES[role]) fail(`consumers[${index}].repository is incorrect`);
  const ref = text(raw.ref, `consumers[${index}].ref`);
  if (!COMMIT.test(ref)) fail(`consumers[${index}].ref must be a lowercase full Git commit`);
  return { role, repository: REPOSITORIES[role], ref };
}

export function parseTrain(rawValue: unknown): Train {
  const raw = object(rawValue, "root");
  exactKeys(raw, ["protocol", "candidate", "consumers"], "root");
  if (raw.protocol !== 1) fail("protocol must be 1");
  if (!Array.isArray(raw.consumers) || raw.consumers.length !== 2)
    fail("consumers must name Lantern and Handbook exactly once");
  const consumers = raw.consumers.map(parseConsumer);
  if (
    consumers
      .map(({ role }) => role)
      .sort()
      .join(",") !== "handbook,lantern"
  )
    fail("consumers must name Lantern and Handbook exactly once");
  return { protocol: 1, candidate: parseCandidate(raw.candidate), consumers };
}

export function readTrain(file: string): Train {
  return parseTrain(JSON.parse(fs.readFileSync(file, "utf8")));
}

export async function assertCandidateArchive(candidate: Candidate): Promise<void> {
  const response = await fetch(candidate.releaseUrl);
  if (!response.ok) fail(`candidate download failed (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    candidate.sha256,
    "candidate bytes do not match candidate.sha256",
  );
  assert.equal(
    `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
    candidate.integrity,
    "candidate bytes do not match candidate.integrity",
  );
}

export async function selfTest(): Promise<void> {
  const valid = {
    protocol: 1,
    candidate: {
      provider: "schema-adrenaline",
      releaseUrl:
        "https://github.com/RebelliousSmile/schema-adrenaline/releases/download/v2.5.0-rc.2/schema-adrenaline-2.5.0.tgz",
      sha256: "a".repeat(64),
      integrity: `sha512-${"A".repeat(86)}==`,
      version: "2.5.0",
      stagingTag: "v2.5.0-rc.2",
      finalTag: "v2.5.0",
      providerCommit: "b".repeat(40),
    },
    consumers: [
      { role: "lantern", repository: REPOSITORIES.lantern, ref: "c".repeat(40) },
      { role: "handbook", repository: REPOSITORIES.handbook, ref: "d".repeat(40) },
    ],
  };
  assert.deepEqual(parseTrain(valid), valid);
  for (const mutation of [
    { ...valid, protocol: 2 },
    { ...valid, command: "echo unsafe" },
    { ...valid, candidate: { ...valid.candidate, releaseUrl: "file:///tmp/candidate.tgz" } },
    { ...valid, candidate: { ...valid.candidate, integrity: "sha256-deadbeef" } },
    { ...valid, consumers: [valid.consumers[0], { ...valid.consumers[1], ref: "main" }] },
  ])
    assert.throws(() => parseTrain(mutation), /release-train manifest/);
  const { selfTestProofs } = await import("./verify-release-train-proofs.js");
  selfTestProofs();
  console.log("✓ release-train protocol-1 self-tests passed");
}

async function main(): Promise<void> {
  if (process.argv.includes("--self-test")) return selfTest();
  const file = process.argv[2];
  if (!file) fail("usage: npm run release-train:assert -- <manifest>");
  const train = readTrain(file);
  await assertCandidateArchive(train.candidate);
  console.log(JSON.stringify({ status: "passed", candidate: train.candidate }));
}
void main();
