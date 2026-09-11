import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import IarnaToml from "@iarna/toml";
import { parse as parseSmolToml } from "smol-toml";
import {
  ADRENALINE_DOCUMENT_CODECS,
  type AdrenalineDocumentTarget,
} from "../src/codecs/documents.js";
import { ADRENALINE_TOML_VERSION } from "../src/contract-version.js";

type ContractFormat = "json" | "toml";
type ContractExpectation = "accept" | "reject";
interface ContractCase {
  path: string;
  target: AdrenalineDocumentTarget;
  format: ContractFormat;
  expect: ContractExpectation;
}
interface ContractManifest {
  manifestVersion: number;
  tomlVersion: string;
  cases: ContractCase[];
}

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "corpus", "cases.json"), "utf8"),
) as ContractManifest;
const targets = Object.keys(ADRENALINE_DOCUMENT_CODECS) as AdrenalineDocumentTarget[];

assert.equal(manifest.manifestVersion, 1, "contract manifest version must be 1");
assert.equal(
  manifest.tomlVersion,
  ADRENALINE_TOML_VERSION,
  "manifest TOML version differs from the public contract",
);
assert.ok(Array.isArray(manifest.cases), "contract manifest cases must be an array");

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, normalize(child)]),
    );
  }
  return value;
}

function safeFile(relative: string): string {
  assert.ok(
    relative.length > 0 && !path.isAbsolute(relative) && !relative.split(/[\\/]/).includes(".."),
    `unsafe contract path: ${relative}`,
  );
  const resolved = path.resolve(root, relative);
  assert.ok(
    resolved.startsWith(`${root}${path.sep}`),
    `contract path escapes package root: ${relative}`,
  );
  assert.ok(fs.statSync(resolved).isFile(), `contract case does not exist: ${relative}`);
  return resolved;
}

function listFiles(directory: string, extension: ".json" | ".toml"): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) =>
      path.relative(root, path.join(entry.parentPath, entry.name)).replaceAll(path.sep, "/"),
    );
}

const expectedPaths = [
  ...listFiles(path.join(root, "corpus", "temoins"), ".json"),
  ...listFiles(path.join(root, "corpus", "refus"), ".json"),
  ...listFiles(path.join(root, "examples", "adrenaline"), ".toml"),
  ...listFiles(path.join(root, "corpus", "contract"), ".toml"),
].sort();
const indexedPaths = manifest.cases.map((testCase) => testCase.path).sort();
assert.deepEqual(
  indexedPaths,
  expectedPaths,
  "contract manifest must index every JSON corpus and TOML document exactly once",
);

const seenPaths = new Set<string>();
const expectations = new Map<AdrenalineDocumentTarget, Set<ContractExpectation>>(
  targets.map((target) => [target, new Set<ContractExpectation>()]),
);
const tomlWitnesses = new Set<AdrenalineDocumentTarget>();

for (const testCase of manifest.cases) {
  assert.ok(targets.includes(testCase.target), `${testCase.path}: unknown target`);
  assert.ok(
    testCase.format === "json" || testCase.format === "toml",
    `${testCase.path}: invalid format`,
  );
  assert.ok(
    testCase.expect === "accept" || testCase.expect === "reject",
    `${testCase.path}: invalid expectation`,
  );
  assert.ok(!seenPaths.has(testCase.path), `${testCase.path}: duplicate contract path`);
  seenPaths.add(testCase.path);
  expectations.get(testCase.target)?.add(testCase.expect);

  const source = fs.readFileSync(safeFile(testCase.path), "utf8");
  const codec = ADRENALINE_DOCUMENT_CODECS[testCase.target];
  const parse = testCase.format === "json" ? codec.parseJson : codec.parseToml;
  const stringify = testCase.format === "json" ? codec.stringifyJson : codec.stringifyToml;
  const label = `${testCase.path} [${testCase.target}/${testCase.format}]`;

  if (testCase.expect === "reject") {
    assert.throws(() => parse(source), `${label}: invalid fixture was accepted`);
    console.log(`✓ contract rejection: ${label}`);
    continue;
  }

  if (testCase.format === "toml") {
    tomlWitnesses.add(testCase.target);
    assert.deepEqual(
      normalize(parseSmolToml(source)),
      normalize(IarnaToml.parse(source)),
      `${label}: runtime and reference TOML parsers disagree`,
    );
  }
  const canonical = parse(source);
  const reparsed = parse(stringify(canonical));
  assert.deepEqual(
    normalize(reparsed),
    normalize(canonical),
    `${label}: round-trip changed the normalized value`,
  );
  if (testCase.path.endsWith("pnj-syntax-edge-values.toml")) {
    const edge = canonical as {
      niveauDeDanger?: number;
      formations?: unknown[];
      competences?: unknown[];
    };
    assert.equal(edge.niveauDeDanger, 0);
    assert.deepEqual(edge.formations, []);
    assert.deepEqual(edge.competences, []);
  }
  console.log(`✓ contract witness: ${label}`);
}

for (const target of targets) {
  assert.deepEqual(
    [...(expectations.get(target) ?? [])].sort(),
    ["accept", "reject"],
    `${target}: corpus must contain accepted and rejected cases`,
  );
  assert.ok(tomlWitnesses.has(target), `${target}: corpus must contain an accepted TOML case`);
}

console.log("\n✅ Canonical Adrenaline JSON/TOML contract passed all document targets.");
