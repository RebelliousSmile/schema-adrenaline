import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Candidate } from "./assert-release-train.js";
import {
  finalArtifact,
  readCandidateManifest,
  type FinalArtifact,
} from "./assert-final-release.js";

export type FinalConsumer = {
  role: "lantern" | "handbook";
  repository: "RebelliousSmile/lantern" | "RebelliousSmile/obsidian-handbook";
  ref: string;
};
export type FinalTrain = { protocol: 2; artifact: FinalArtifact; consumers: FinalConsumer[] };
export type FinalEvidence = {
  protocol: 2;
  status: "passed";
  artifact: FinalArtifact;
  consumer: FinalConsumer;
  lock: { file: string; releaseUrl: string; integrity: string };
  journey: { id: string; status: "passed"; checks: string[] };
};

const COMMIT = /^[a-f0-9]{40}$/;
const REPOSITORIES = {
  lantern: "RebelliousSmile/lantern",
  handbook: "RebelliousSmile/obsidian-handbook",
} as const;

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

export function parseFinalTrain(value: unknown, candidate: Candidate): FinalTrain {
  const raw = object(value, "final train");
  exactKeys(raw, ["protocol", "artifact", "consumers"], "final train");
  assert.equal(raw.protocol, 2, "final train protocol must be 2");
  const artifact = object(raw.artifact, "artifact");
  exactKeys(artifact, ["provider", "releaseUrl", "sha256", "integrity", "version"], "artifact");
  assert.deepEqual(
    artifact,
    finalArtifact(candidate),
    "final artifact differs from candidate provenance",
  );
  assert.ok(
    Array.isArray(raw.consumers) && raw.consumers.length === 2,
    "final train needs both consumers",
  );
  const consumers = raw.consumers.map((value, index): FinalConsumer => {
    const consumer = object(value, `consumers[${index}]`);
    exactKeys(consumer, ["role", "repository", "ref"], `consumers[${index}]`);
    assert.ok(consumer.role === "lantern" || consumer.role === "handbook", "unknown consumer role");
    const role = consumer.role;
    assert.equal(consumer.repository, REPOSITORIES[role], `${role} repository differs`);
    assert.match(consumer.ref as string, COMMIT, `${role} ref must be a full immutable commit`);
    return { role, repository: REPOSITORIES[role], ref: consumer.ref as string };
  });
  assert.deepEqual(consumers.map(({ role }) => role).sort(), ["handbook", "lantern"]);
  return { protocol: 2, artifact: artifact as FinalArtifact, consumers };
}

export function readFinalTrain(file: string): FinalTrain {
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
  const record = object(raw, "final train");
  const artifact = object(record.artifact, "artifact");
  const version = artifact.version;
  if (typeof version !== "string") throw new Error("artifact version must be text");
  assert.match(version, /^\d+\.\d+\.\d+$/, "artifact version must be stable SemVer");
  const expectedFile = `schema-adrenaline-v${version}-final.json`;
  assert.equal(
    path.basename(file),
    expectedFile,
    "final record filename differs from artifact version",
  );
  const candidate = readCandidateManifest(
    path.join(path.dirname(file), `schema-adrenaline-v${version}.json`),
  );
  return parseFinalTrain(raw, candidate);
}

export function parseFinalEvidence(
  value: unknown,
  train: FinalTrain,
  role: FinalConsumer["role"],
): FinalEvidence {
  const raw = object(value, `${role} evidence`);
  exactKeys(
    raw,
    ["protocol", "status", "artifact", "consumer", "lock", "journey"],
    `${role} evidence`,
  );
  assert.equal(raw.protocol, 2, `${role} evidence protocol differs`);
  assert.equal(raw.status, "passed", `${role} did not pass`);
  assert.deepEqual(raw.artifact, train.artifact, `${role} resolved a different artifact`);
  const expectedConsumer = train.consumers.find((consumer) => consumer.role === role);
  assert.ok(expectedConsumer, `${role} absent from final train`);
  assert.deepEqual(raw.consumer, expectedConsumer, `${role} commit differs from final train`);
  const lock = object(raw.lock, `${role} lock`);
  exactKeys(lock, ["file", "releaseUrl", "integrity"], `${role} lock`);
  assert.equal(lock.file, "pnpm-lock.yaml", `${role} proof must name its lockfile`);
  assert.equal(lock.releaseUrl, train.artifact.releaseUrl, `${role} lockfile URL differs`);
  assert.equal(lock.integrity, train.artifact.integrity, `${role} lockfile SRI differs`);
  const journey = object(raw.journey, `${role} journey`);
  exactKeys(journey, ["id", "status", "checks"], `${role} journey`);
  assert.equal(journey.status, "passed", `${role} journey did not pass`);
  assert.equal(typeof journey.id, "string", `${role} journey id missing`);
  assert.ok(
    Array.isArray(journey.checks) && journey.checks.length > 0,
    `${role} journey checks missing`,
  );
  for (const check of journey.checks)
    assert.equal(typeof check, "string", `${role} check must be text`);
  return raw as FinalEvidence;
}

export function selfTest(): void {
  const candidate: Candidate = {
    provider: "schema-adrenaline",
    releaseUrl:
      "https://github.com/RebelliousSmile/schema-adrenaline/releases/download/v2.6.0-rc.1/schema-adrenaline-2.6.0.tgz",
    sha256: "a".repeat(64),
    integrity: `sha512-${"A".repeat(86)}==`,
    version: "2.6.0",
    stagingTag: "v2.6.0-rc.1",
    finalTag: "v2.6.0",
    providerCommit: "b".repeat(40),
  };
  const valid = {
    protocol: 2,
    artifact: finalArtifact(candidate),
    consumers: [
      { role: "lantern", repository: REPOSITORIES.lantern, ref: "c".repeat(40) },
      { role: "handbook", repository: REPOSITORIES.handbook, ref: "d".repeat(40) },
    ],
  };
  const train = parseFinalTrain(valid, candidate);
  assert.throws(
    () => parseFinalTrain({ ...valid, consumers: valid.consumers.slice(0, 1) }, candidate),
    /both consumers/,
  );
  assert.throws(
    () =>
      parseFinalTrain(
        { ...valid, consumers: [{ ...valid.consumers[0], ref: "main" }, valid.consumers[1]] },
        candidate,
      ),
    /full immutable commit/,
  );
  assert.throws(
    () =>
      parseFinalTrain(
        { ...valid, artifact: { ...valid.artifact, sha256: "e".repeat(64) } },
        candidate,
      ),
    /candidate provenance/,
  );
  assert.throws(
    () => parseFinalTrain({ ...valid, extra: true }, candidate),
    /unknown or missing fields/,
  );
  const evidence = {
    protocol: 2,
    status: "passed",
    artifact: train.artifact,
    consumer: train.consumers[0],
    lock: {
      file: "pnpm-lock.yaml",
      releaseUrl: train.artifact.releaseUrl,
      integrity: train.artifact.integrity,
    },
    journey: { id: "adrenaline-contract-vite-build", status: "passed", checks: ["vite-build"] },
  };
  parseFinalEvidence(evidence, train, "lantern");
  assert.throws(
    () =>
      parseFinalEvidence(
        { ...evidence, lock: { ...evidence.lock, releaseUrl: candidate.releaseUrl } },
        train,
        "lantern",
      ),
    /lockfile URL differs/,
  );
  console.log("✓ final convergence protocol-2 self-tests passed");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--self-test")) selfTest();
  else {
    const file = process.argv[2];
    if (!file) throw new Error("usage: verify-final-convergence <final-record>");
    console.log(JSON.stringify(readFinalTrain(file)));
  }
}
