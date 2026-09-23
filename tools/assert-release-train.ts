import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";

type Consumer = {
  repository: "RebelliousSmile/lantern" | "RebelliousSmile/obsidian-handbook";
  commit: string;
};
type Train = {
  manifestVersion: 1;
  provider: {
    repository: "RebelliousSmile/schema-adrenaline";
    commit: string;
    finalTag: string;
    archiveUrl: string;
    sha256: string;
  };
  consumers: { lantern: Consumer; handbook: Consumer };
};

const SHA = /^[a-f0-9]{64}$/;
const SEMVER_TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const COMMIT = /^[a-f0-9]{40}$/;

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
  if (typeof value !== "string") fail(`${label} must be a string`);
  return value;
}

function parseTrain(rawValue: unknown): Train {
  const raw = object(rawValue, "root");
  exactKeys(raw, ["manifestVersion", "provider", "consumers"], "root");
  if (raw.manifestVersion !== 1) fail("manifestVersion must be 1");
  const provider = object(raw.provider, "provider");
  exactKeys(provider, ["repository", "commit", "finalTag", "archiveUrl", "sha256"], "provider");
  if (provider.repository !== "RebelliousSmile/schema-adrenaline")
    fail("provider.repository is not schema-adrenaline");
  if (!COMMIT.test(text(provider.commit, "provider.commit")))
    fail("provider.commit must be a lowercase full Git commit");
  if (!SHA.test(text(provider.sha256, "provider.sha256")))
    fail("provider.sha256 must be a lowercase full SHA-256");
  const tag = text(provider.finalTag, "provider.finalTag");
  if (!SEMVER_TAG.test(tag)) fail("provider.finalTag must be a final SemVer tag");
  const url = text(provider.archiveUrl, "provider.archiveUrl");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.hash)
    fail("provider.archiveUrl must be a plain HTTPS URL");
  if (!parsed.pathname.endsWith(`schema-adrenaline-${tag.slice(1)}.tgz`))
    fail("provider.archiveUrl must name the final-version archive");
  const consumers = object(raw.consumers, "consumers");
  exactKeys(consumers, ["lantern", "handbook"], "consumers");
  const consumer = (name: "lantern" | "handbook", repository: Consumer["repository"]): Consumer => {
    const entry = object(consumers[name], `consumers.${name}`);
    exactKeys(entry, ["repository", "commit"], `consumers.${name}`);
    if (entry.repository !== repository) fail(`consumers.${name}.repository is incorrect`);
    const commit = text(entry.commit, `consumers.${name}.commit`);
    if (!COMMIT.test(commit)) fail(`consumers.${name}.commit must be a lowercase full Git commit`);
    return { repository, commit };
  };
  return {
    manifestVersion: 1,
    provider: {
      repository: "RebelliousSmile/schema-adrenaline",
      commit: text(provider.commit, "provider.commit"),
      finalTag: tag,
      archiveUrl: url,
      sha256: text(provider.sha256, "provider.sha256"),
    },
    consumers: {
      lantern: consumer("lantern", "RebelliousSmile/lantern"),
      handbook: consumer("handbook", "RebelliousSmile/obsidian-handbook"),
    },
  };
}

export function readTrain(file: string): Train {
  return parseTrain(JSON.parse(fs.readFileSync(file, "utf8")));
}

function selfTest(): void {
  const valid = {
    manifestVersion: 1,
    provider: {
      repository: "RebelliousSmile/schema-adrenaline",
      commit: "a".repeat(40),
      finalTag: "v2.3.4",
      archiveUrl: "https://example.test/schema-adrenaline-2.3.4.tgz",
      sha256: "b".repeat(64),
    },
    consumers: {
      lantern: { repository: "RebelliousSmile/lantern", commit: "c".repeat(40) },
      handbook: { repository: "RebelliousSmile/obsidian-handbook", commit: "d".repeat(40) },
    },
  };
  assert.equal(parseTrain(valid).provider.finalTag, "v2.3.4");
  for (const mutation of [
    { ...valid, extra: true },
    { ...valid, provider: { ...valid.provider, commit: "main" } },
    {
      ...valid,
      provider: { ...valid.provider, archiveUrl: "file:///tmp/schema-adrenaline-2.3.4.tgz" },
    },
    { ...valid, provider: { ...valid.provider, command: "echo unsafe" } },
  ])
    assert.throws(() => parseTrain(mutation), /release-train manifest/);
  console.log("✓ release-train manifest self-test passed");
}

async function main(): Promise<void> {
  if (process.argv.includes("--self-test")) return selfTest();
  const file = process.argv[2];
  if (!file) fail("usage: npm run release-train:assert -- <manifest>");
  const train = readTrain(file);
  const response = await fetch(train.provider.archiveUrl);
  if (!response.ok) fail(`candidate download failed (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    train.provider.sha256,
    "candidate bytes do not match provider.sha256",
  );
  console.log(
    JSON.stringify({
      status: "passed",
      archiveUrl: train.provider.archiveUrl,
      sha256: train.provider.sha256,
      finalTag: train.provider.finalTag,
    }),
  );
}
void main();
