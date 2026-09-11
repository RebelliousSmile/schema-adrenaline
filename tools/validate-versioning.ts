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

assert.equal(
  packageJson.version,
  ADRENALINE_SCHEMA_VERSION,
  "package and schema baseline versions must match",
);
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

const versionDirectories = fs
  .readdirSync(schemaRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+\.\d+\.\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();
assert.ok(
  versionDirectories.includes(packageJson.version),
  `missing schema baseline ${packageJson.version}`,
);

for (const version of versionDirectories) {
  const tag = `v${version}`;
  const publishedCommit = git(["rev-parse", "--verify", `${tag}^{commit}`], true);
  if (publishedCommit === null) {
    assert.equal(version, packageJson.version, `${version}: untagged historical schema directory`);
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

console.log("\n✅ Contract, schema, catalogue and pack versions are coherent.");
