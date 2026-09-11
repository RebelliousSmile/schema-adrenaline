import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

type PackResult = { filename: string };
const root = process.cwd();
const verify = process.argv.includes("--verify");
const npmCli =
  process.env.npm_execpath ??
  path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

function argumentValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value) throw new Error(`${name} requires a value`);
  return value;
}

function run(command: string, args: string[], cwd = root): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.error?.message ?? ""}\n${result.stdout ?? ""}${result.stderr ?? ""}`,
    );
  return result.stdout;
}

function sha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function pack(destination: string): string {
  fs.mkdirSync(destination, { recursive: true });
  const output = run(process.execPath, [
    npmCli,
    "pack",
    "--json",
    "--silent",
    "--pack-destination",
    destination,
  ]);
  const jsonStart = output.lastIndexOf("\n[");
  const packed = JSON.parse(
    jsonStart === -1 ? output : output.slice(jsonStart + 1),
  ) as PackResult[];
  assert.equal(packed.length, 1, "npm pack must produce exactly one tarball");
  return path.join(destination, packed[0].filename);
}

function listFiles(directory: string, relative = ""): string[] {
  return fs
    .readdirSync(path.join(directory, relative), { withFileTypes: true })
    .flatMap((entry) => {
      const child = path.join(relative, entry.name);
      return entry.isDirectory() ? listFiles(directory, child) : [child];
    });
}

function canonicalContents(tarball: string): Record<string, string> {
  const extracted = fs.mkdtempSync(path.join(os.tmpdir(), "schema-adrenaline-unpack-"));
  try {
    run("tar", ["-xzf", tarball, "-C", extracted]);
    return Object.fromEntries(
      listFiles(extracted)
        .sort()
        .map((relative) => [relative, sha256(path.join(extracted, relative))]),
    );
  } finally {
    fs.rmSync(extracted, { recursive: true, force: true });
  }
}

if (verify) {
  const firstRoot = fs.mkdtempSync(path.join(os.tmpdir(), "schema-adrenaline-release-a-"));
  const secondRoot = fs.mkdtempSync(path.join(os.tmpdir(), "schema-adrenaline-release-b-"));
  try {
    assert.deepEqual(
      canonicalContents(pack(firstRoot)),
      canonicalContents(pack(secondRoot)),
      "two packages from the same source must have identical canonical contents",
    );
    console.log("✓ release preparation is reproducible by canonical package contents");
  } finally {
    fs.rmSync(firstRoot, { recursive: true, force: true });
    fs.rmSync(secondRoot, { recursive: true, force: true });
  }
} else {
  const requestedOutput = argumentValue("--output");
  const outputRoot = requestedOutput
    ? path.resolve(requestedOutput)
    : fs.mkdtempSync(path.join(os.tmpdir(), "schema-adrenaline-release-"));
  const tarball = pack(outputRoot);
  const digest = sha256(tarball);
  const checksum = `${tarball}.sha256`;
  fs.writeFileSync(checksum, `${digest}  ${path.basename(tarball)}\n`);
  console.log(JSON.stringify({ tarball, checksum, sha256: digest }));
}
