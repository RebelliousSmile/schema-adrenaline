import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ADRENALINE_SCHEMA_VERSION } from "../src/contract-version.js";

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
        file.startsWith(`schemas/adrenaline/${ADRENALINE_SCHEMA_VERSION}/`) ||
        file.startsWith("corpus/") ||
        file.startsWith("examples/") ||
        file === "cross-tool-provider.json" ||
        file === "handbook.json" ||
        file.startsWith("handbook/"),
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
  PNJ_PRESENTATION,
  parsePnjToml,
} from "schema-adrenaline";
import { PNJ_PRESENTATION as PNJ_PRESENTATION_SUBPATH } from "schema-adrenaline/presentation";

assert.equal(ADRENALINE_CONTRACT_VERSION, 2);
assert.equal(ADRENALINE_TOML_VERSION, "1.0.0");
assert.deepEqual(Object.keys(ADRENALINE_DOCUMENT_CODECS).sort(), ["monstre", "pj", "pnj"]);

const schema = JSON.parse(fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/schemas/pnj.schema.json")), "utf8"));
assert.match(
  schema.$id,
  new RegExp("/schemas/adrenaline/${ADRENALINE_SCHEMA_VERSION.replaceAll(".", "\\\\.")}/pnj\\.schema\\.json$"),
);
assert.deepEqual(schema["x-adrenaline-presentation"], PNJ_PRESENTATION);
assert.deepEqual(PNJ_PRESENTATION_SUBPATH, PNJ_PRESENTATION);
assert.equal(PNJ_PRESENTATION.capability, "block:adrenaline-pnj");
const provider = JSON.parse(fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/cross-tool-provider.json")), "utf8"));
assert.equal(provider.contractVersion, ADRENALINE_CONTRACT_VERSION);
const cases = JSON.parse(fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/" + provider.corpus)), "utf8"));
for (const testCase of cases.cases) {
  const specifier = "schema-adrenaline/" + testCase.path;
  assert.ok(fs.statSync(new URL(import.meta.resolve(specifier))).isFile(), "missing packaged case: " + testCase.path);
}
const catalogue = JSON.parse(fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/handbook.json")), "utf8"));
const cataloguePack = catalogue.packs.find((entry) => entry.id === "adrenaline");
assert.ok(cataloguePack, "Adrenaline pack is missing from the published catalogue");
const pack = JSON.parse(
  fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/" + cataloguePack.path)), "utf8"),
);
assert.equal(pack.pack.id, cataloguePack.id);
assert.equal(pack.version, cataloguePack.version);
const packDirectory = cataloguePack.path.slice(0, cataloguePack.path.lastIndexOf("/"));
const assetRoot = pack.pack.assets.root ?? "assets";
const assetFiles = [
  ...Object.values(pack.pack.assets.images),
  ...Object.values(pack.pack.assets.fonts).map((asset) =>
    typeof asset === "string" ? asset : asset.file,
  ),
];
for (const asset of assetFiles) {
  assert.ok(
    fs.statSync(
      new URL(import.meta.resolve("schema-adrenaline/" + packDirectory + "/" + assetRoot + "/" + asset)),
    ).isFile(),
    "missing packaged Handbook asset: " + asset,
  );
}
const source = fs.readFileSync(new URL(import.meta.resolve("schema-adrenaline/examples/adrenaline/pnj/pnj-secondaire.toml")), "utf8");
assert.equal(parsePnjToml(source).nom, "Le veilleur de nuit");
await assert.rejects(import("schema-adrenaline/codecs/documents.js"), (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED");
await assert.rejects(import("schema-adrenaline/tools/validate-package.ts"), (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED");
`;
  fs.writeFileSync(path.join(consumerRoot, "check.mjs"), checkSource);
  run(process.execPath, ["check.mjs"], consumerRoot);
  console.log("✓ schema-adrenaline tarball installs with its public ESM contract");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
