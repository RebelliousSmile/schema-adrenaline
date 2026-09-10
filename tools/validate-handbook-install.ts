import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type StoredValue = string | ArrayBuffer;

interface ResolvedSource {
  revision: string;
  readText(file: string): Promise<string>;
  readBinary(file: string): Promise<ArrayBuffer>;
}

interface SourceInstallerModule {
  installResolvedSchemaSource(
    plugin: unknown,
    source: unknown,
    resolved: ResolvedSource,
  ): Promise<void>;
}

const handbookRoot = process.env.HANDBOOK_ROOT;
if (!handbookRoot) throw new Error("HANDBOOK_ROOT is required");

const projectRoot = process.cwd();
const handbookPackage = JSON.parse(
  fs.readFileSync(path.join(handbookRoot, "package.json"), "utf8"),
) as { version: string };
const sourceInstallerUrl = pathToFileURL(
  path.join(handbookRoot, "src", "games", "sourceInstaller.ts"),
).href;
const { installResolvedSchemaSource } = (await import(sourceInstallerUrl)) as SourceInstallerModule;

const files = new Map<string, StoredValue>();
const folders = new Set<string>([".obsidian/handbook/sources"]);
const adapter = {
  exists: async (candidate: string) => files.has(candidate) || folders.has(candidate),
  mkdir: async (candidate: string) => {
    folders.add(candidate);
  },
  rmdir: async (candidate: string) => {
    for (const file of [...files.keys()]) {
      if (file === candidate || file.startsWith(`${candidate}/`)) files.delete(file);
    }
    for (const folder of [...folders]) {
      if (folder === candidate || folder.startsWith(`${candidate}/`)) folders.delete(folder);
    }
  },
  rename: async (from: string, to: string) => {
    for (const [file, value] of [...files]) {
      if (file === from || file.startsWith(`${from}/`)) {
        files.delete(file);
        files.set(`${to}${file.slice(from.length)}`, value);
      }
    }
    for (const folder of [...folders]) {
      if (folder === from || folder.startsWith(`${from}/`)) {
        folders.delete(folder);
        folders.add(`${to}${folder.slice(from.length)}`);
      }
    }
  },
  write: async (file: string, value: string) => {
    files.set(file, value);
  },
  writeBinary: async (file: string, value: ArrayBuffer) => {
    files.set(file, value);
  },
};
const plugin = {
  manifest: { version: handbookPackage.version },
  app: { vault: { configDir: ".obsidian", adapter } },
};
const source = {
  id: "rebellioussmile--schema-adrenaline",
  repository: "RebelliousSmile/schema-adrenaline",
  reference: { kind: "branch", value: "main" },
};

function localPath(relative: string): string {
  const resolved = path.resolve(projectRoot, relative);
  const relation = path.relative(projectRoot, resolved);
  if (relation.startsWith("..") || path.isAbsolute(relation)) {
    throw new Error(`source path escapes the repository: ${relative}`);
  }
  return resolved;
}

function arrayBuffer(buffer: Buffer, marker: number): ArrayBuffer {
  const bytes = new Uint8Array(buffer.byteLength + 1);
  bytes.set(buffer);
  bytes[bytes.length - 1] = marker;
  return bytes.buffer;
}

function resolvedSource(revision: string, marker: number, failAssets = false): ResolvedSource {
  return {
    revision,
    readText: async (file) => fs.readFileSync(localPath(file), "utf8"),
    readBinary: async (file) => {
      if (failAssets) throw new Error("simulated asset download failure");
      return arrayBuffer(fs.readFileSync(localPath(file)), marker);
    },
  };
}

const installationRoot = ".obsidian/handbook/sources/rebellioussmile--schema-adrenaline";
const assetFiles = [
  "paper-grain.webp",
  "dark-organic.webp",
  "warning-stripe.webp",
  "fonts/adrenaline-body.woff2",
  "fonts/adrenaline-display.woff2",
];

await installResolvedSchemaSource(plugin, source, resolvedSource("a".repeat(40), 1));
assert.ok(files.has(`${installationRoot}/handbook.json`), "catalogue was not installed");
assert.ok(files.has(`${installationRoot}/packs/adrenaline/pack.json`), "pack was not installed");
for (const asset of assetFiles) {
  assert.ok(files.has(`${installationRoot}/packs/adrenaline/assets/${asset}`), `${asset} missing`);
}

await installResolvedSchemaSource(plugin, source, resolvedSource("b".repeat(40), 2));
for (const asset of assetFiles) {
  const value = files.get(`${installationRoot}/packs/adrenaline/assets/${asset}`);
  assert.ok(value instanceof ArrayBuffer, `${asset} is not binary`);
  assert.equal(new Uint8Array(value).at(-1), 2, `${asset} was not updated`);
}
const updatedSource = files.get(`${installationRoot}/source.json`);
if (typeof updatedSource !== "string") throw new Error("installed source metadata is missing");
assert.equal(JSON.parse(updatedSource).revision, "b".repeat(40));

const snapshot = new Map(files);
await assert.rejects(
  installResolvedSchemaSource(plugin, source, resolvedSource("c".repeat(40), 3, true)),
  /simulated asset download failure/,
);
assert.deepEqual(files, snapshot, "a failed update changed the installed source");

console.log(
  `Handbook ${handbookPackage.version} source install: green (1 pack, ${assetFiles.length} assets)`,
);
