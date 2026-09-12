import fs from "node:fs";
import path from "node:path";

type RecordValue = Record<string, unknown>;

const CATALOGUE_PATH = "handbook.json";
const PACK_PATH = path.join("handbook", "adrenaline", "pack.json");
const CATALOGUE_FIELDS = [
  "manifestVersion",
  "repository",
  "name",
  "description",
  "author",
  "packs",
];
const CATALOGUE_PACK_FIELDS = ["id", "version", "path", "label", "description"];
const PACK_FIELDS = [
  "manifestVersion",
  "version",
  "minimumHandbookVersion",
  "requires",
  "variants",
  "defaultVariantId",
  "pack",
];
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_PATTERN = /^--[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FORBIDDEN_VALUE = /[{};<>]/;
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);
const FONT_EXTENSIONS = new Set(["woff2", "woff", "ttf", "otf"]);
const ADRENALINE_CAPABILITIES = [
  "block:adrenaline-pj",
  "block:adrenaline-pnj",
  "block:adrenaline-monstre",
  "style:adrenaline",
];

interface CataloguePack {
  id: string;
  version: string;
  path: string;
}

interface ValidatedPack {
  id: string;
  version: string;
}

function record(value: unknown, where: string): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${where} must be an object`);
  }
  return value as RecordValue;
}

function text(value: unknown, where: string): string {
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`${where} must be text`);
  return value.trim();
}

function knownFields(source: RecordValue, allowed: string[], where: string): void {
  const unknown = Object.keys(source).filter((field) => !allowed.includes(field));
  if (unknown.length > 0) throw new Error(`${where} has unknown fields: ${unknown.join(", ")}`);
}

function semver(value: unknown, where: string): string {
  const version = text(value, where);
  if (!SEMVER_PATTERN.test(version)) throw new Error(`${where} must be valid SemVer`);
  return version;
}

function safeRelative(file: string, where: string): string {
  const normalized = file.replace(/\\/g, "/");
  if (
    normalized.startsWith("/") ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized.split("/").some((part) => part === "." || part === ".." || part === "")
  ) {
    throw new Error(`${where} must be a safe relative path`);
  }
  return normalized;
}

function validateCatalogue(source: unknown): CataloguePack[] {
  const catalogue = record(source, "catalogue");
  knownFields(catalogue, CATALOGUE_FIELDS, "catalogue");
  if (catalogue.manifestVersion !== 1) throw new Error("catalogue.manifestVersion must be 1");
  if (text(catalogue.repository, "catalogue.repository") !== "RebelliousSmile/schema-adrenaline") {
    throw new Error("catalogue.repository must be RebelliousSmile/schema-adrenaline");
  }
  for (const field of ["name", "description", "author"]) {
    if (catalogue[field] !== undefined) text(catalogue[field], `catalogue.${field}`);
  }
  if (!Array.isArray(catalogue.packs) || catalogue.packs.length === 0) {
    throw new Error("catalogue.packs must be a non-empty list");
  }

  const packs = catalogue.packs.map((candidate, index): CataloguePack => {
    const entry = record(candidate, `catalogue.packs.${index}`);
    knownFields(entry, CATALOGUE_PACK_FIELDS, `catalogue.packs.${index}`);
    const id = text(entry.id, `catalogue.packs.${index}.id`);
    if (!ID_PATTERN.test(id)) throw new Error(`catalogue.packs.${index}.id is invalid`);
    const version = semver(entry.version, `catalogue.packs.${index}.version`);
    const manifestPath = safeRelative(
      text(entry.path, `catalogue.packs.${index}.path`),
      `catalogue.packs.${index}.path`,
    );
    for (const field of ["label", "description"]) {
      if (entry[field] !== undefined) text(entry[field], `catalogue.packs.${index}.${field}`);
    }
    return { id, version, path: manifestPath };
  });

  for (const [index, entry] of packs.entries()) {
    if (
      packs.some(
        (candidate, other) =>
          other < index && (candidate.id === entry.id || candidate.path === entry.path),
      )
    ) {
      throw new Error(`catalogue.packs.${index} duplicates an id or path`);
    }
  }
  return packs;
}

function extension(file: string): string {
  return file.slice(file.lastIndexOf(".") + 1).toLowerCase();
}

function validateTokens(style: RecordValue): void {
  for (const layerName of ["base", "light", "dark"]) {
    const layer = record(style[layerName], `style.${layerName}`);
    for (const slotName of ["note", "workspace"]) {
      const slot = record(layer[slotName], `style.${layerName}.${slotName}`);
      for (const [name, value] of Object.entries(slot)) {
        if (!TOKEN_PATTERN.test(name)) throw new Error(`unsafe token name: ${name}`);
        const declared = text(value, name);
        if (FORBIDDEN_VALUE.test(declared)) throw new Error(`unsafe token value: ${name}`);
      }
    }
  }
}

function validateAssetMap(
  assets: RecordValue,
  field: "images" | "fonts",
  extensions: Set<string>,
  packRoot: string,
  assetRoot: string,
): void {
  const declarations = record(assets[field], `assets.${field}`);
  for (const [role, declaration] of Object.entries(declarations)) {
    const file =
      typeof declaration === "string"
        ? declaration
        : text(record(declaration, `assets.${field}.${role}`).file, `assets.${field}.${role}.file`);
    const relative = safeRelative(file, `assets.${field}.${role}`);
    if (!extensions.has(extension(relative)))
      throw new Error(`unsupported ${field} extension: ${relative}`);
    const resolved = path.join(packRoot, assetRoot, relative);
    if (!fs.existsSync(resolved)) throw new Error(`missing asset: ${resolved}`);
  }
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string, background: string): number {
  const [bright, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (bright + 0.05) / (dark + 0.05);
}

function requireContrast(
  tokens: RecordValue,
  foreground: string,
  background: string,
  threshold = 4.5,
): void {
  const fg = text(tokens[foreground], foreground);
  const bg = text(tokens[background], background);
  if (!/^#[0-9A-Fa-f]{6}$/.test(fg) || !/^#[0-9A-Fa-f]{6}$/.test(bg)) {
    throw new Error(`contrast pair ${foreground}/${background} must use six-digit hex values`);
  }
  const ratio = contrast(fg, bg);
  if (ratio < threshold)
    throw new Error(`contrast ${foreground}/${background} is ${ratio.toFixed(2)}:1`);
}

export function validateHandbookPack(
  source: unknown,
  packRoot = path.dirname(PACK_PATH),
): ValidatedPack {
  const manifest = record(source, "manifest");
  knownFields(manifest, PACK_FIELDS, "manifest");
  if (manifest.manifestVersion !== 1) throw new Error("manifestVersion must be 1");
  const version = semver(manifest.version, "version");
  semver(manifest.minimumHandbookVersion, "minimumHandbookVersion");
  const requirements = manifest.requires;
  if (
    !Array.isArray(requirements) ||
    requirements.length !== ADRENALINE_CAPABILITIES.length ||
    ADRENALINE_CAPABILITIES.some((capability) => !requirements.includes(capability))
  ) {
    throw new Error("requires must declare every Adrenaline capability exactly once");
  }
  const pack = record(manifest.pack, "pack");
  const id = text(pack.id, "pack.id");
  if (id !== "adrenaline") throw new Error("pack.id must be adrenaline");
  const polarities = pack.polarities;
  if (!Array.isArray(polarities) || polarities.join(",") !== "light,dark") {
    throw new Error("pack.polarities must be light,dark");
  }
  const style = record(pack.style, "pack.style");
  validateTokens(style);
  const assets = record(pack.assets, "pack.assets");
  const assetRoot =
    assets.root === undefined
      ? "assets"
      : safeRelative(text(assets.root, "assets.root"), "assets.root");
  validateAssetMap(assets, "images", IMAGE_EXTENSIONS, packRoot, assetRoot);
  validateAssetMap(assets, "fonts", FONT_EXTENSIONS, packRoot, assetRoot);

  for (const polarity of ["light", "dark"]) {
    const layer = record(style[polarity], `style.${polarity}`);
    const note = record(layer.note, `style.${polarity}.note`);
    const workspace = record(layer.workspace, `style.${polarity}.workspace`);
    requireContrast(note, "--text-normal", "--background-primary");
    requireContrast(note, "--text-muted", "--background-primary");
    requireContrast(note, "--h1-color", "--background-primary", 3);
    requireContrast(note, "--interactive-accent", "--background-primary", 3);
    requireContrast(note, "--code-normal", "--code-background");
    requireContrast(note, "--adrenaline-callout-ink", "--adrenaline-callout-surface");
    for (const surface of [
      "--adrenaline-callout-info",
      "--adrenaline-callout-success",
      "--adrenaline-callout-question",
      "--adrenaline-callout-warning",
      "--adrenaline-callout-danger",
      "--adrenaline-callout-example",
      "--adrenaline-callout-quote",
    ]) {
      requireContrast(note, "--adrenaline-callout-ink", surface);
    }
    requireContrast(note, "--adrenaline-signal-ink", "--adrenaline-signal");
    // --color-yellow est consommé comme texte (seuil 4.5), --adrenaline-signal comme liseré de callout (seuil UI 3).
    requireContrast(note, "--color-yellow", "--background-primary");
    requireContrast(note, "--adrenaline-signal", "--background-primary", 3);
    requireContrast(workspace, "--text-normal", "--background-primary");
    requireContrast(workspace, "--interactive-accent", "--background-primary", 3);
  }

  for (const license of ["ADRENALINE-ASSETS.md", "FONT-BODY.txt", "FONT-DISPLAY.txt"]) {
    if (!fs.existsSync(path.join("LICENSES", license)))
      throw new Error(`missing license: ${license}`);
  }
  return { id, version };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function refused(name: string, run: () => void): void {
  try {
    run();
  } catch {
    return;
  }
  throw new Error(`self-test did not refuse ${name}`);
}

function selfTest(catalogueSource: unknown, packSource: unknown): void {
  const catalogueMismatch = clone(catalogueSource) as RecordValue;
  const cataloguePacks = catalogueMismatch.packs as RecordValue[];
  cataloguePacks[0].version = "0.2.1";

  const escapingPath = clone(catalogueSource) as RecordValue;
  const escapingPacks = escapingPath.packs as RecordValue[];
  escapingPacks[0].path = "../pack.json";

  const missingCapability = clone(packSource) as RecordValue;
  missingCapability.requires = ADRENALINE_CAPABILITIES.slice(0, -1);

  const missing = clone(packSource) as RecordValue;
  const missingPack = record(missing.pack, "pack");
  const missingAssets = record(missingPack.assets, "assets");
  const missingImages = record(missingAssets.images, "images");
  missingImages.missing = "missing.webp";

  const unsafe = clone(packSource) as RecordValue;
  const unsafePack = record(unsafe.pack, "pack");
  const unsafeStyle = record(unsafePack.style, "style");
  const unsafeLight = record(unsafeStyle.light, "light");
  record(unsafeLight.note, "note")["--unsafe"] = "red; } body { color: red";

  const lowContrast = clone(packSource) as RecordValue;
  const contrastPack = record(lowContrast.pack, "pack");
  const contrastStyle = record(contrastPack.style, "style");
  const contrastLight = record(contrastStyle.light, "light");
  record(contrastLight.note, "note")["--text-normal"] = "#F4F0E8";

  refused("catalogue version mismatch", () => {
    const [entry] = validateCatalogue(catalogueMismatch);
    const pack = validateHandbookPack(packSource);
    if (entry.id !== pack.id || entry.version !== pack.version) throw new Error("mismatch");
  });
  refused("escaping catalogue path", () => validateCatalogue(escapingPath));
  refused("missing capability", () => validateHandbookPack(missingCapability));
  refused("missing asset", () => validateHandbookPack(missing));
  refused("unsafe token", () => validateHandbookPack(unsafe));
  refused("low contrast", () => validateHandbookPack(lowContrast));
}

const catalogueSource = JSON.parse(fs.readFileSync(CATALOGUE_PATH, "utf8")) as unknown;
const entries = validateCatalogue(catalogueSource);
const loadedPacks = entries.map((entry) => {
  const source = JSON.parse(fs.readFileSync(entry.path, "utf8")) as unknown;
  const pack = validateHandbookPack(source, path.dirname(entry.path));
  if (entry.id !== pack.id || entry.version !== pack.version) {
    throw new Error(`${entry.path} does not match its catalogue entry`);
  }
  return source;
});
if (process.argv.includes("--self-test")) selfTest(catalogueSource, loadedPacks[0]);

const files = fs
  .readdirSync(path.join(path.dirname(PACK_PATH), "assets"), {
    recursive: true,
    withFileTypes: true,
  })
  .filter((entry) => entry.isFile())
  .map((entry) => path.join(entry.parentPath, entry.name));
const bytes = files.reduce((total, file) => total + fs.statSync(file).size, 0);
console.log(
  `Handbook catalogue: green (${entries.length} pack, ${files.length} assets, ${bytes} bytes)`,
);
