import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { finalArtifact, readCandidateManifest } from "./assert-final-release.js";
import type { Consumer, Train } from "./assert-release-train.js";
import { parseFinalTrain, type FinalTrain } from "./verify-final-convergence.js";

/* Writes the two records of a train from what is published, so no workstation types them:
   the protocol-1 manifest once both consumers pin the candidate on `main`, and the protocol-2
   final record once both pin the final. It only records facts; `release-train:assert`,
   `release-train.yml` and `final-convergence.yml` remain the judges of those facts. */

const PROVIDER = "schema-adrenaline";
const DIRECTORY = "release-train";
const CONSUMERS = [
  { role: "handbook", repository: "RebelliousSmile/obsidian-handbook" },
  { role: "lantern", repository: "RebelliousSmile/lantern" },
] as const;
const STAGING_TAG = /^v(\d+\.\d+\.\d+)-rc\.\d+$/;
const FINAL_TAG = /^v(\d+\.\d+\.\d+)$/;
const COMMIT = /^[a-f0-9]{40}$/;

type Refs = Record<(typeof CONSUMERS)[number]["role"], string>;

function assetUrl(tag: string, version: string): string {
  return `https://github.com/RebelliousSmile/${PROVIDER}/releases/download/${tag}/${PROVIDER}-${version}.tgz`;
}

function consumers(refs: Refs): Consumer[] {
  return CONSUMERS.map(({ role, repository }) => ({ role, repository, ref: refs[role] }));
}

export function candidatePath(version: string): string {
  return path.join(DIRECTORY, `${PROVIDER}-v${version}.json`);
}

export function finalPath(version: string): string {
  return path.join(DIRECTORY, `${PROVIDER}-v${version}-final.json`);
}

/** The protocol-1 manifest of the candidate `stagingTag`, whose archive is `bytes`. */
export function candidateTrain(
  stagingTag: string,
  bytes: Uint8Array,
  providerCommit: string,
  refs: Refs,
): Train {
  const version = STAGING_TAG.exec(stagingTag)?.[1];
  assert.ok(version, `candidate tag must be vX.Y.Z-rc.N, found ${stagingTag}`);
  return {
    protocol: 1,
    candidate: {
      provider: PROVIDER,
      releaseUrl: assetUrl(stagingTag, version),
      sha256: createHash("sha256").update(bytes).digest("hex"),
      integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
      version,
      stagingTag,
      finalTag: `v${version}`,
      providerCommit,
    },
    consumers: consumers(refs),
  };
}

/** The protocol-2 record of the final promoted from `candidate`. */
export function finalTrain(candidate: Train["candidate"], refs: Refs): FinalTrain {
  return parseFinalTrain(
    { protocol: 2, artifact: finalArtifact(candidate), consumers: consumers(refs) },
    candidate,
  );
}

function serialize(record: Train | FinalTrain): string {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** Writes `record` once: a committed train record is never rewritten with other facts. */
export function writeOnce(file: string, record: Train | FinalTrain): void {
  const text = serialize(record);
  if (fs.existsSync(file)) {
    const committed = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
    assert.equal(committed, text, `${file} already records other facts`);
    return;
  }
  fs.writeFileSync(file, text);
}

function git(args: string[]): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr ?? result.error?.message}`);
  return result.stdout.trim();
}

/** The commit of each consumer's `main`, provided its package.json pins exactly `url`. */
async function pinningRefs(url: string): Promise<Refs | string> {
  const refs: Partial<Refs> = {};
  for (const { role, repository } of CONSUMERS) {
    const ref = git(["ls-remote", `https://github.com/${repository}.git`, "refs/heads/main"]).split(
      /\s+/,
    )[0];
    assert.match(ref ?? "", COMMIT, `${repository} has no main`);
    const response = await fetch(
      `https://raw.githubusercontent.com/${repository}/${ref}/package.json`,
    );
    if (!response.ok) throw new Error(`${repository} package.json: ${response.status}`);
    const manifest = (await response.json()) as { dependencies?: Record<string, unknown> };
    const pinned = manifest.dependencies?.[PROVIDER];
    if (pinned !== url) return `${repository} main pins ${String(pinned)}, not ${url}`;
    refs[role] = ref;
  }
  return refs as Refs;
}

async function awaitedRefs(url: string, minutes: number): Promise<Refs> {
  for (let waited = 0; ; waited++) {
    const refs = await pinningRefs(url);
    if (typeof refs !== "string") return refs;
    if (waited >= minutes) throw new Error(refs);
    console.error(`${refs}; checking again in a minute (${waited + 1}/${minutes})`);
    await new Promise((resolve) => setTimeout(resolve, 60_000));
  }
}

/** `ready` once both consumers pin the candidate `stagingTag` on `main`, else what is missing. */
async function candidateReadiness(stagingTag: string): Promise<string> {
  const version = STAGING_TAG.exec(stagingTag)?.[1];
  assert.ok(version, `candidate tag must be vX.Y.Z-rc.N, found ${stagingTag}`);
  const refs = await pinningRefs(assetUrl(stagingTag, version));
  return typeof refs === "string" ? refs : "ready";
}

async function writeCandidate(stagingTag: string, minutes: number): Promise<string> {
  const version = STAGING_TAG.exec(stagingTag)?.[1];
  assert.ok(version, `candidate tag must be vX.Y.Z-rc.N, found ${stagingTag}`);
  const url = assetUrl(stagingTag, version);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} is not published: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const providerCommit = git(["rev-parse", `refs/tags/${stagingTag}^{commit}`]);
  const refs = await awaitedRefs(url, minutes);
  const file = candidatePath(version);
  writeOnce(file, candidateTrain(stagingTag, bytes, providerCommit, refs));
  readCandidateManifest(file);
  return file;
}

async function writeFinal(finalTag: string, minutes: number): Promise<string> {
  const version = FINAL_TAG.exec(finalTag)?.[1];
  assert.ok(version, `final tag must be vX.Y.Z, found ${finalTag}`);
  const candidate = readCandidateManifest(candidatePath(version));
  const refs = await awaitedRefs(finalArtifact(candidate).releaseUrl, minutes);
  const file = finalPath(version);
  writeOnce(file, finalTrain(candidate, refs));
  return file;
}

export function selfTestWriter(): void {
  const bytes = new TextEncoder().encode("candidate archive");
  const refs: Refs = { handbook: "d".repeat(40), lantern: "c".repeat(40) };
  const train = candidateTrain("v2.5.0-rc.2", bytes, "b".repeat(40), refs);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "release-train-writer-"));
  try {
    const file = path.join(directory, `${PROVIDER}-v2.5.0.json`);
    writeOnce(file, train);
    assert.deepEqual(readCandidateManifest(file), train.candidate, "manifest must read back");
    assert.equal(
      train.candidate.releaseUrl,
      "https://github.com/RebelliousSmile/schema-adrenaline/releases/download/v2.5.0-rc.2/schema-adrenaline-2.5.0.tgz",
    );
    assert.equal(train.candidate.sha256, createHash("sha256").update(bytes).digest("hex"));
    assert.deepEqual(
      train.consumers.map(({ role, ref }) => `${role}=${ref}`),
      [`handbook=${refs.handbook}`, `lantern=${refs.lantern}`],
    );
    writeOnce(file, train);
    assert.throws(
      () => writeOnce(file, candidateTrain("v2.5.0-rc.3", bytes, "b".repeat(40), refs)),
      /already records other facts/,
      "a committed manifest must not be rewritten",
    );
    const final = finalTrain(train.candidate, refs);
    assert.equal(final.artifact.releaseUrl.includes("/v2.5.0/"), true);
    assert.equal(final.artifact.sha256, train.candidate.sha256);
    assert.throws(() => candidateTrain("v2.5.0", bytes, "b".repeat(40), refs), /vX\.Y\.Z-rc\.N/);
    assert.throws(
      () => finalTrain(train.candidate, { ...refs, lantern: "main" }),
      /full immutable commit/,
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }

  // Every committed record must be what this writer would write from the same facts.
  for (const name of fs.readdirSync(DIRECTORY)) {
    if (!/^schema-adrenaline-v\d+\.\d+\.\d+-final\.json$/.test(name)) continue;
    const file = path.join(DIRECTORY, name);
    const text = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
    const committed = JSON.parse(text) as FinalTrain;
    const candidate = readCandidateManifest(file.replace(/-final\.json$/, ".json"));
    const committedRefs = Object.fromEntries(
      committed.consumers.map(({ role, ref }) => [role, ref]),
    ) as Refs;
    // Records typed before this writer list the consumers in either order.
    const byRole = (record: FinalTrain): FinalTrain => ({
      ...record,
      consumers: [...record.consumers].sort((a, b) => a.role.localeCompare(b.role)),
    });
    assert.equal(
      serialize(byRole(finalTrain(candidate, committedRefs))),
      serialize(byRole(committed)),
      `${file} differs from the writer`,
    );
  }
  console.log("✓ release-train writer self-tests passed");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, tag, ...flags] = process.argv.slice(2);
  if (mode === "--self-test") selfTestWriter();
  else {
    const at = flags.indexOf("--wait-minutes");
    const minutes = at < 0 ? 0 : Number(flags[at + 1]);
    assert.ok(Number.isInteger(minutes) && minutes >= 0, "--wait-minutes takes a whole number");
    if (mode !== "candidate" && mode !== "final" && mode !== "ready")
      throw new Error(
        "usage: write-release-train <candidate|final|ready> <tag> [--wait-minutes N]",
      );
    assert.ok(tag, "a tag is required");
    if (mode === "ready") console.log(await candidateReadiness(tag));
    else console.log(await (mode === "candidate" ? writeCandidate : writeFinal)(tag, minutes));
  }
}
