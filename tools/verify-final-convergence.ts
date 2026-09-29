import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Candidate } from "./assert-release-train.js";
import {
  finalArtifact,
  readCandidateManifest,
  verifyFinalRelease,
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
  artifact: Omit<FinalArtifact, "provider">;
  consumer: FinalConsumer;
  lock: { file: string; releaseUrl: string; integrity: string };
  journey: { id: string; status: "passed"; checks: string[] };
};

const COMMIT = /^[a-f0-9]{40}$/;
const REPOSITORIES = {
  lantern: "RebelliousSmile/lantern",
  handbook: "RebelliousSmile/obsidian-handbook",
} as const;
const PACK = "schema-adrenaline";

function evidenceArtifact(artifact: FinalArtifact): FinalEvidence["artifact"] {
  const { releaseUrl, sha256, integrity, version } = artifact;
  return { releaseUrl, sha256, integrity, version };
}

function ghJson(endpoint: string): unknown {
  const result = spawnSync("gh", ["api", endpoint], { encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(`GitHub API ${endpoint} failed: ${result.stderr ?? result.error?.message}`);
  return JSON.parse(result.stdout) as unknown;
}

function remoteFile(consumer: FinalConsumer, file: string): string {
  const response = object(
    ghJson(`repos/${consumer.repository}/contents/${file}?ref=${consumer.ref}`),
    `${consumer.role} ${file}`,
  );
  assert.equal(response.type, "file", `${consumer.role} ${file} is not a file`);
  assert.equal(response.encoding, "base64", `${consumer.role} ${file} encoding differs`);
  assert.equal(typeof response.content, "string");
  return Buffer.from(response.content as string, "base64").toString("utf8");
}

export function assertConsumerPins(
  consumer: FinalConsumer,
  artifact: FinalArtifact,
  files: Record<string, string>,
): void {
  const required =
    consumer.role === "lantern"
      ? ["package.json", "package-lock.json", "pnpm-lock.yaml"]
      : ["package.json", "pnpm-lock.yaml"];
  for (const file of required) {
    const content = files[file];
    assert.equal(typeof content, "string", `${consumer.role} ${file} missing`);
    assert.ok(content.includes(artifact.releaseUrl), `${consumer.role} ${file} lacks final URL`);
  }
  const packageJson = JSON.parse(files["package.json"]) as Record<string, unknown>;
  const dependencies = object(packageJson.dependencies, `${consumer.role} dependencies`);
  assert.equal(dependencies[PACK], artifact.releaseUrl, `${consumer.role} package pin differs`);
  const pnpmEntry = files["pnpm-lock.yaml"].split(`${PACK}@${artifact.releaseUrl}:`)[1];
  assert.ok(pnpmEntry, `${consumer.role} pnpm package entry differs`);
  assert.ok(
    pnpmEntry.split(/\n\S/)[0].includes(artifact.integrity),
    `${consumer.role} pnpm SRI differs`,
  );
  if (consumer.role === "lantern") {
    const npmLock = JSON.parse(files["package-lock.json"]) as Record<string, unknown>;
    const packages = object(npmLock.packages, "lantern npm packages");
    const entry = object(packages[`node_modules/${PACK}`], "lantern npm pack entry");
    assert.equal(entry.resolved, artifact.releaseUrl, "lantern npm resolved URL differs");
    assert.equal(entry.integrity, artifact.integrity, "lantern npm SRI differs");
  }
}

export function verifyRemotePins(train: FinalTrain): void {
  for (const consumer of train.consumers) {
    const comparison = object(
      ghJson(`repos/${consumer.repository}/compare/${consumer.ref}...main`),
      `${consumer.role} main ancestry`,
    );
    assert.ok(
      comparison.status === "ahead" || comparison.status === "identical",
      `${consumer.role} ref is not on main`,
    );
    const names =
      consumer.role === "lantern"
        ? ["package.json", "package-lock.json", "pnpm-lock.yaml"]
        : ["package.json", "pnpm-lock.yaml"];
    assertConsumerPins(
      consumer,
      train.artifact,
      Object.fromEntries(names.map((file) => [file, remoteFile(consumer, file)])),
    );
  }
}

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
  const artifact = object(raw.artifact, `${role} artifact`);
  exactKeys(artifact, ["releaseUrl", "sha256", "integrity", "version"], `${role} artifact`);
  assert.deepEqual(
    artifact,
    evidenceArtifact(train.artifact),
    `${role} resolved a different artifact`,
  );
  const expectedConsumer = train.consumers.find((consumer) => consumer.role === role);
  assert.ok(expectedConsumer, `${role} absent from final train`);
  const consumer = object(raw.consumer, `${role} consumer`);
  exactKeys(consumer, ["role", "repository", "ref"], `${role} consumer`);
  assert.deepEqual(consumer, expectedConsumer, `${role} commit differs from final train`);
  const lock = object(raw.lock, `${role} lock`);
  exactKeys(lock, ["file", "releaseUrl", "integrity"], `${role} lock`);
  assert.equal(lock.file, "pnpm-lock.yaml", `${role} proof must name its lockfile`);
  assert.equal(lock.releaseUrl, train.artifact.releaseUrl, `${role} lockfile URL differs`);
  assert.equal(lock.integrity, train.artifact.integrity, `${role} lockfile SRI differs`);
  const journey = object(raw.journey, `${role} journey`);
  exactKeys(journey, ["id", "status", "checks"], `${role} journey`);
  assert.equal(journey.status, "passed", `${role} journey did not pass`);
  assert.ok(typeof journey.id === "string" && journey.id.length > 0, `${role} journey id missing`);
  assert.ok(
    Array.isArray(journey.checks) && journey.checks.length > 0,
    `${role} journey checks missing`,
  );
  for (const check of journey.checks)
    assert.ok(typeof check === "string" && check.length > 0, `${role} check must be text`);
  return raw as FinalEvidence;
}

export async function verifyFinalConvergence(
  file: string,
  lanternProof?: string,
  handbookProof?: string,
): Promise<Record<string, unknown>> {
  const train = readFinalTrain(file);
  const candidatePath = path.join(
    path.dirname(file),
    `schema-adrenaline-v${train.artifact.version}.json`,
  );
  const provenance = await verifyFinalRelease(candidatePath);
  assert.deepEqual(provenance.artifact, train.artifact);
  verifyRemotePins(train);
  const proofs =
    lanternProof && handbookProof
      ? {
          lantern: parseFinalEvidence(
            JSON.parse(fs.readFileSync(lanternProof, "utf8")),
            train,
            "lantern",
          ),
          handbook: parseFinalEvidence(
            JSON.parse(fs.readFileSync(handbookProof, "utf8")),
            train,
            "handbook",
          ),
        }
      : undefined;
  return {
    protocol: 2,
    status: proofs ? "passed" : "pins-passed",
    ...provenance,
    consumers: train.consumers,
    ...(proofs ? { proofs } : {}),
  };
}

function committedFinalRecords(): string[] {
  return fs
    .readdirSync("release-train")
    .filter((name) => /^schema-adrenaline-v\d+\.\d+\.\d+-final\.json$/.test(name))
    .map((name) => path.join("release-train", name));
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
    artifact: evidenceArtifact(train.artifact),
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
  assert.throws(
    () =>
      parseFinalEvidence(
        { ...evidence, artifact: { ...evidence.artifact, integrity: "wrong" } },
        train,
        "lantern",
      ),
    /different artifact/,
  );
  assert.throws(
    () =>
      parseFinalEvidence(
        { ...evidence, consumer: { ...evidence.consumer, ref: "e".repeat(40) } },
        train,
        "lantern",
      ),
    /commit differs/,
  );
  assert.throws(
    () => parseFinalEvidence({ ...evidence, extra: true }, train, "lantern"),
    /unknown or missing fields/,
  );
  const files = {
    "package.json": JSON.stringify({ dependencies: { [PACK]: train.artifact.releaseUrl } }),
    "pnpm-lock.yaml": `${PACK}@${train.artifact.releaseUrl}:\n    resolution: {integrity: ${train.artifact.integrity}}\n`,
    "package-lock.json": JSON.stringify({
      packages: {
        [`node_modules/${PACK}`]: {
          resolved: train.artifact.releaseUrl,
          integrity: train.artifact.integrity,
        },
      },
    }),
  };
  assertConsumerPins(train.consumers[0], train.artifact, files);
  assertConsumerPins(train.consumers[1], train.artifact, files);
  parseFinalEvidence({ ...evidence, consumer: train.consumers[1] }, train, "handbook");
  assert.throws(
    () => parseFinalEvidence({ ...evidence, artifact: train.artifact }, train, "lantern"),
    /unknown or missing fields/,
  );
  assert.throws(
    () =>
      assertConsumerPins(train.consumers[0], train.artifact, {
        ...files,
        "package.json": files["package.json"].replace(
          train.artifact.releaseUrl,
          candidate.releaseUrl,
        ),
      }),
    /final URL/,
  );
  assert.throws(
    () =>
      assertConsumerPins(train.consumers[0], train.artifact, {
        ...files,
        "pnpm-lock.yaml": files["pnpm-lock.yaml"].replace(train.artifact.integrity, "wrong"),
      }),
    /pnpm SRI/,
  );
  console.log("✓ final convergence protocol-2 self-tests passed");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [file, lanternProof, handbookProof] = process.argv.slice(2);
  if (file === "--self-test") selfTest();
  else if (file === "--if-present") {
    const records = committedFinalRecords();
    for (const record of records) console.log(JSON.stringify(await verifyFinalConvergence(record)));
    if (records.length === 0) console.log("No committed final convergence records yet");
  } else {
    if (!file || Boolean(lanternProof) !== Boolean(handbookProof))
      throw new Error(
        "usage: verify-final-convergence <final-record> [lantern-proof handbook-proof]",
      );
    console.log(JSON.stringify(await verifyFinalConvergence(file, lanternProof, handbookProof)));
  }
}
