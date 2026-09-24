import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Candidate, type Consumer, readTrain } from "./assert-release-train.js";

type Evidence = {
  protocol: 1;
  status: "passed";
  candidate: Candidate;
  consumer: Consumer & {
    resolved: { version: string; releaseUrl: string; integrity: string };
  };
  lock: { file: string; releaseUrl: string; integrity: string };
  journey: { id: string; status: "passed"; checks: string[] };
};

function object(value: unknown, label: string): Record<string, unknown> {
  assert.ok(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`,
  );
  return value as Record<string, unknown>;
}
function exactKeys(value: Record<string, unknown>, keys: string[], label: string): void {
  assert.deepEqual(
    Object.keys(value).sort(),
    [...keys].sort(),
    `${label} has unknown or missing fields`,
  );
}
function text(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0)
    throw new Error(`${label} must be non-empty text`);
  return value;
}
function candidate(value: unknown, label: string): Candidate {
  const raw = object(value, label);
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
    label,
  );
  return raw as Candidate;
}

export function readEvidence(file: string): Evidence {
  const raw = object(JSON.parse(fs.readFileSync(file, "utf8")), file);
  exactKeys(raw, ["protocol", "status", "candidate", "consumer", "lock", "journey"], file);
  assert.equal(raw.protocol, 1, `${file}: protocol must be 1`);
  assert.equal(raw.status, "passed", `${file}: consumer did not pass`);
  const consumer = object(raw.consumer, `${file}.consumer`);
  exactKeys(consumer, ["role", "repository", "ref", "resolved"], `${file}.consumer`);
  const resolved = object(consumer.resolved, `${file}.consumer.resolved`);
  exactKeys(resolved, ["version", "releaseUrl", "integrity"], `${file}.consumer.resolved`);
  const lock = object(raw.lock, `${file}.lock`);
  exactKeys(lock, ["file", "releaseUrl", "integrity"], `${file}.lock`);
  const journey = object(raw.journey, `${file}.journey`);
  exactKeys(journey, ["id", "status", "checks"], `${file}.journey`);
  assert.equal(journey.status, "passed", `${file}: journey did not pass`);
  assert.ok(
    Array.isArray(journey.checks) && journey.checks.length > 0,
    `${file}: journey checks are empty`,
  );
  for (const check of journey.checks) text(check, `${file}.journey.checks`);
  return {
    protocol: 1,
    status: "passed",
    candidate: candidate(raw.candidate, `${file}.candidate`),
    consumer: {
      role: text(consumer.role, `${file}.consumer.role`) as Consumer["role"],
      repository: text(
        consumer.repository,
        `${file}.consumer.repository`,
      ) as Consumer["repository"],
      ref: text(consumer.ref, `${file}.consumer.ref`),
      resolved: {
        version: text(resolved.version, `${file}.consumer.resolved.version`),
        releaseUrl: text(resolved.releaseUrl, `${file}.consumer.resolved.releaseUrl`),
        integrity: text(resolved.integrity, `${file}.consumer.resolved.integrity`),
      },
    },
    lock: {
      file: text(lock.file, `${file}.lock.file`),
      releaseUrl: text(lock.releaseUrl, `${file}.lock.releaseUrl`),
      integrity: text(lock.integrity, `${file}.lock.integrity`),
    },
    journey: {
      id: text(journey.id, `${file}.journey.id`),
      status: "passed",
      checks: journey.checks as string[],
    },
  };
}

export function assertEvidence(
  evidence: Evidence,
  expected: Candidate & { consumer: Consumer },
): void {
  const { consumer, ...candidate } = expected;
  assert.deepEqual(evidence.candidate, candidate, "consumer candidate differs from manifest");
  assert.deepEqual(
    {
      role: evidence.consumer.role,
      repository: evidence.consumer.repository,
      ref: evidence.consumer.ref,
    },
    consumer,
    "consumer identity differs from manifest",
  );
  assert.deepEqual(evidence.consumer.resolved, {
    version: expected.version,
    releaseUrl: expected.releaseUrl,
    integrity: expected.integrity,
  });
  assert.equal(evidence.lock.releaseUrl, expected.releaseUrl, "lockfile URL differs from manifest");
  assert.equal(
    evidence.lock.integrity,
    expected.integrity,
    "lockfile integrity differs from manifest",
  );
}

export function selfTestProofs(): void {
  const candidate: Candidate = {
    provider: "schema-adrenaline",
    releaseUrl:
      "https://github.com/RebelliousSmile/schema-adrenaline/releases/download/v2.5.0-rc.2/schema-adrenaline-2.5.0.tgz",
    sha256: "a".repeat(64),
    integrity: `sha512-${"A".repeat(86)}==`,
    version: "2.5.0",
    stagingTag: "v2.5.0-rc.2",
    finalTag: "v2.5.0",
    providerCommit: "b".repeat(40),
  };
  const consumer: Consumer = {
    role: "lantern",
    repository: "RebelliousSmile/lantern",
    ref: "c".repeat(40),
  };
  const evidence: Evidence = {
    protocol: 1,
    status: "passed",
    candidate,
    consumer: {
      ...consumer,
      resolved: {
        version: candidate.version,
        releaseUrl: candidate.releaseUrl,
        integrity: candidate.integrity,
      },
    },
    lock: {
      file: "pnpm-lock.yaml",
      releaseUrl: candidate.releaseUrl,
      integrity: candidate.integrity,
    },
    journey: { id: "adrenaline-contract-vite-build", status: "passed", checks: ["lockfile"] },
  };
  assertEvidence(evidence, { ...candidate, consumer });
  assert.throws(
    () =>
      assertEvidence(
        { ...evidence, lock: { ...evidence.lock, integrity: "sha512-other" } },
        { ...candidate, consumer },
      ),
    /lockfile integrity differs/,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [manifest, lanternFile, handbookFile] = process.argv.slice(2);
  if (!manifest || !lanternFile || !handbookFile)
    throw new Error(
      "usage: verify-release-train-proofs <manifest> <lantern-proof> <handbook-proof>",
    );
  const train = readTrain(manifest);
  for (const [role, file] of [
    ["lantern", lanternFile],
    ["handbook", handbookFile],
  ] as const) {
    const consumer = train.consumers.find((entry) => entry.role === role);
    assert.ok(consumer, `manifest does not identify ${role}`);
    assertEvidence(readEvidence(file), { ...train.candidate, consumer });
  }
  console.log("✓ Lantern and Handbook protocol-1 evidence files match the immutable candidate");
}
