import assert from "node:assert/strict";
import fs from "node:fs";
import { readTrain } from "./assert-release-train.js";

type Proof = { status: "passed"; version: string; archiveUrl: string; integrity: string; commit: string; path: string };
function proof(file: string): Proof {
  const value = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
  assert.deepEqual(Object.keys(value).sort(), ["archiveUrl", "commit", "integrity", "path", "status", "version"]);
  for (const key of ["version", "archiveUrl", "integrity", "commit", "path"] as const) assert.equal(typeof value[key], "string", `${file}: ${key} must be a string`);
  assert.equal(value.status, "passed", `${file}: consumer did not pass`);
  return value as Proof;
}
const [manifest, lanternFile, handbookFile] = process.argv.slice(2);
if (!manifest || !lanternFile || !handbookFile) throw new Error("usage: verify-release-train-proofs <manifest> <lantern-proof> <handbook-proof>");
const train = readTrain(manifest);
for (const [name, result, expectedCommit] of [["Lantern", proof(lanternFile), train.consumers.lantern.commit], ["Handbook", proof(handbookFile), train.consumers.handbook.commit]] as const) {
  assert.equal(result.archiveUrl, train.provider.archiveUrl, `${name}: archive URL differs from manifest`);
  assert.equal(result.integrity, `sha256-${train.provider.sha256}`, `${name}: integrity differs from manifest`);
  assert.equal(result.commit, expectedCommit, `${name}: commit differs from manifest`);
  assert.equal(result.version, train.provider.finalTag.slice(1), `${name}: resolved version differs from final tag`);
}
console.log("✓ Lantern and Handbook release-train proofs match the immutable candidate");
