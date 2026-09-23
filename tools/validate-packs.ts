import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ADRENALINE_CONTRACT_VERSION } from "../src/contract-version.js";

type Provider = {
  providerVersion?: unknown;
  contractVersion?: unknown;
  corpus?: unknown;
  packManifest?: unknown;
  commands?: { validatePack?: unknown };
};

const root = process.cwd();
const providerPath = path.join(root, "cross-tool-provider.json");

function safeFilePath(value: unknown, field: string): string {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  assert.ok(value.length > 0, `${field} must not be empty`);
  assert.ok(!path.isAbsolute(value), `${field} must be relative`);
  assert.ok(!value.split(/[\\/]/).includes(".."), `${field} must not escape the repository`);
  const resolved = path.resolve(root, value);
  assert.ok(resolved.startsWith(`${root}${path.sep}`), `${field} must stay within the repository`);
  assert.ok(fs.existsSync(resolved), `${field} does not exist: ${value}`);
  assert.ok(fs.statSync(resolved).isFile(), `${field} must name a file: ${value}`);
  return resolved;
}

function validateProvider(candidate: Provider): {
  command: string[];
  directory: string;
  manifestName: string;
} {
  assert.equal(candidate.providerVersion, 1, "unsupported cross-tool provider");
  assert.equal(
    candidate.contractVersion,
    ADRENALINE_CONTRACT_VERSION,
    "provider contractVersion must match the published contract",
  );
  const corpusPath = safeFilePath(candidate.corpus, "corpus");
  const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8")) as {
    manifestVersion?: unknown;
    tomlVersion?: unknown;
    cases?: unknown;
  };
  assert.equal(corpus.manifestVersion, 1, "corpus manifestVersion must be 1");
  assert.equal(typeof corpus.tomlVersion, "string", "corpus tomlVersion must be a string");
  assert.ok(Array.isArray(corpus.cases), "corpus cases must be an array");

  const command = candidate.commands?.validatePack;
  assert.ok(
    Array.isArray(command) && command.every((part) => typeof part === "string"),
    "missing validatePack command",
  );

  /* The descriptor owns the layout: reading it here keeps this loop and the cross-tool matrix on the same paths. */
  const declared = candidate.packManifest;
  assert.ok(typeof declared === "string", "provider declares no packManifest");
  const [directory, manifestName, ...rest] = declared.split("/*/");
  assert.ok(
    directory && manifestName && rest.length === 0,
    `packManifest must read <directory>/*/<file>: ${declared}`,
  );
  return { command, directory, manifestName };
}

function refused(name: string, run: () => void): void {
  try {
    run();
  } catch {
    return;
  }
  throw new Error(`validation did not refuse ${name}`);
}

const provider = JSON.parse(fs.readFileSync(providerPath, "utf8")) as Provider;
const { command, directory, manifestName } = validateProvider(provider);

refused("the historical corpus path", () =>
  validateProvider({ ...provider, corpus: "corpus/contract/cases.json" }),
);

let validated = 0;
for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifest = path.join(directory, entry.name, manifestName);
  if (!fs.existsSync(path.join(root, manifest))) continue;
  execFileSync(command[0], [...command.slice(1), manifest], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  validated += 1;
}

/* A run that matched no manifest proves nothing, so it must not exit green. */
assert.ok(validated > 0, `packManifest ${provider.packManifest} matched no manifest`);
console.log(`✓ ${validated} pack manifest${validated === 1 ? "" : "s"} validated.`);
