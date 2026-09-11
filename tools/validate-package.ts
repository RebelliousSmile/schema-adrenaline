import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "schema-adrenaline-package-"));
const npmCli =
  process.env.npm_execpath ??
  path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

function run(command: string, args: string[], cwd = root): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.error?.message ?? ""}\n${result.stdout ?? ""}${result.stderr ?? ""}`,
    );
  return result.stdout;
}

try {
  const packOutput = run(process.execPath, [
    npmCli,
    "pack",
    "--json",
    "--silent",
    "--pack-destination",
    temporaryRoot,
  ]);
  const jsonStart = packOutput.lastIndexOf("\n[");
  const packed = JSON.parse(
    jsonStart === -1 ? packOutput : packOutput.slice(jsonStart + 1),
  ) as Array<{ filename: string; files: Array<{ path: string }> }>;
  assert.equal(packed.length, 1, "npm pack must produce exactly one tarball");
  for (const file of packed[0].files.map(({ path: filePath }) => filePath)) {
    assert.ok(
      file === "LICENSE" ||
        file === "README.md" ||
        file === "package.json" ||
        file.startsWith("dist/") ||
        file.startsWith("schemas/adrenaline/1.0.0/") ||
        file.startsWith("corpus/") ||
        file.startsWith("examples/"),
      `unexpected packaged file: ${file}`,
    );
  }

  const tarball = path.join(temporaryRoot, packed[0].filename);
  const consumerRoot = path.join(temporaryRoot, "consumer");
  fs.mkdirSync(consumerRoot);
  fs.writeFileSync(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run(
    process.execPath,
    [npmCli, "install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
    consumerRoot,
  );

  const checkSource = `
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ADRENALINE_CONTRACT_VERSION,
  ADRENALINE_DOCUMENT_CODECS,
  ADRENALINE_SCHEMA_VERSION,
  ADRENALINE_TOML_VERSION,
  parsePnjToml,
} from "schema-adrenaline";

assert.equal(ADRENALINE_CONTRACT_VERSION, 1);
assert.equal(ADRENALINE_SCHEMA_VERSION, "1.0.0");
assert.equal(ADRENALINE_TOML_VERSION, "1.0.0");
assert.deepEqual(Object.keys(ADRENALINE_DOCUMENT_CODECS).sort(), ["monstre", "pj", "pnj"]);

const schema = JSON.parse(fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/schemas/pnj.schema.json")), "utf8"));
assert.match(schema.$id, /\\/schemas\\/adrenaline\\/1\\.0\\.0\\/pnj\\.schema\\.json$/);
const cases = JSON.parse(fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/corpus/cases.json")), "utf8"));
for (const testCase of cases.cases) {
  const specifier = "schema-adrenaline/" + testCase.path;
  assert.ok(fs.statSync(new URL(import.meta.resolve(specifier))).isFile(), "missing packaged case: " + testCase.path);
}
const source = fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/examples/adrenaline/pnj/pnj-secondaire.toml")), "utf8");
assert.equal(parsePnjToml(source).nom, "Le veilleur de nuit");
await assert.rejects(import("schema-adrenaline/codecs/documents.js"), (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED");
`;
  fs.writeFileSync(path.join(consumerRoot, "check.mjs"), checkSource);
  run(process.execPath, ["check.mjs"], consumerRoot);
  console.log("✓ schema-adrenaline@1.0.0 tarball installs with its public ESM contract");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
