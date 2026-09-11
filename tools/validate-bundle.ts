import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";

const root = process.cwd();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "schema-adrenaline-bundle-"));
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
  const output = run(process.execPath, [
    npmCli,
    "pack",
    "--json",
    "--silent",
    "--pack-destination",
    temporaryRoot,
  ]);
  const jsonStart = output.lastIndexOf("\n[");
  const [{ filename }] = JSON.parse(
    jsonStart === -1 ? output : output.slice(jsonStart + 1),
  ) as Array<{ filename: string }>;
  const consumerRoot = path.join(temporaryRoot, "consumer");
  fs.mkdirSync(consumerRoot);
  fs.writeFileSync(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run(
    process.execPath,
    [
      npmCli,
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      path.join(temporaryRoot, filename),
    ],
    consumerRoot,
  );
  fs.writeFileSync(
    path.join(consumerRoot, "entry.js"),
    `import assert from "node:assert/strict";\nimport { ADRENALINE_DOCUMENT_CODECS, PersonnageNonJoue, parsePnjToml } from "schema-adrenaline";\nassert.equal(ADRENALINE_DOCUMENT_CODECS.pnj.schema, PersonnageNonJoue);\nassert.equal(parsePnjToml('nom = "Bundled"').nom, "Bundled");\n`,
  );
  const bundle = path.join(consumerRoot, "bundle.mjs");
  await build({
    absWorkingDir: consumerRoot,
    entryPoints: ["entry.js"],
    outfile: bundle,
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  assert.ok(fs.statSync(bundle).size > 0, "bundle is empty");
  run(process.execPath, [bundle], consumerRoot);
  console.log("✓ installed contract bundles and executes through esbuild");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
