import fs from "node:fs";
import path from "node:path";

type RecordValue = Record<string, unknown>;

const PACK_PATH = path.join("handbook", "adrenaline", "pack.json");
const PACK_ROOT = path.dirname(PACK_PATH);
const TOKEN_PATTERN = /^--[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FORBIDDEN_VALUE = /[{};<>]/;
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);
const FONT_EXTENSIONS = new Set(["woff2", "woff", "ttf", "otf"]);

function record(value: unknown, where: string): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${where} must be an object`);
  }
  return value as RecordValue;
}

function text(value: unknown, where: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${where} must be text`);
  return value;
}

function safeRelative(file: string, where: string): string {
  const normalized = file.replace(/\\/g, "/");
  if (
    normalized.startsWith("/") ||
    normalized.split("/").some((part) => part === ".." || part === "")
  ) {
    throw new Error(`${where} must stay below assets/`);
  }
  return normalized;
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
    const resolved = path.join(PACK_ROOT, "assets", relative);
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

export function validateHandbookPack(source: unknown): void {
  const manifest = record(source, "manifest");
  if (manifest.manifestVersion !== 1) throw new Error("manifestVersion must be 1");
  if (text(manifest.version, "version") !== "0.2.0") throw new Error("version must be 0.2.0");
  if (text(manifest.minimumHandbookVersion, "minimumHandbookVersion") !== "2.7.0") {
    throw new Error("minimumHandbookVersion must be 2.7.0");
  }
  const pack = record(manifest.pack, "pack");
  if (text(pack.id, "pack.id") !== "adrenaline") throw new Error("pack.id must be adrenaline");
  const polarities = pack.polarities;
  if (!Array.isArray(polarities) || polarities.join(",") !== "light,dark") {
    throw new Error("pack.polarities must be light,dark");
  }
  const style = record(pack.style, "pack.style");
  validateTokens(style);
  const assets = record(pack.assets, "pack.assets");
  validateAssetMap(assets, "images", IMAGE_EXTENSIONS);
  validateAssetMap(assets, "fonts", FONT_EXTENSIONS);

  for (const polarity of ["light", "dark"]) {
    const layer = record(style[polarity], `style.${polarity}`);
    const note = record(layer.note, `style.${polarity}.note`);
    const workspace = record(layer.workspace, `style.${polarity}.workspace`);
    requireContrast(note, "--text-normal", "--background-primary");
    requireContrast(note, "--text-muted", "--background-primary");
    requireContrast(note, "--h1-color", "--background-primary", 3);
    requireContrast(note, "--interactive-accent", "--background-primary", 3);
    requireContrast(note, "--adrenaline-callout-ink", "--adrenaline-callout-surface");
    requireContrast(note, "--adrenaline-signal-ink", "--adrenaline-signal");
    requireContrast(workspace, "--text-normal", "--background-primary");
    requireContrast(workspace, "--interactive-accent", "--background-primary", 3);
  }

  for (const license of ["ADRENALINE-ASSETS.md", "FONT-BODY.txt", "FONT-DISPLAY.txt"]) {
    if (!fs.existsSync(path.join("LICENSES", license)))
      throw new Error(`missing license: ${license}`);
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function selfTest(source: unknown): void {
  const missing = clone(source) as RecordValue;
  const missingPack = record(missing.pack, "pack");
  const missingAssets = record(missingPack.assets, "assets");
  const missingImages = record(missingAssets.images, "images");
  missingImages.missing = "missing.webp";

  const unsafe = clone(source) as RecordValue;
  const unsafePack = record(unsafe.pack, "pack");
  const unsafeStyle = record(unsafePack.style, "style");
  const unsafeLight = record(unsafeStyle.light, "light");
  record(unsafeLight.note, "note")["--unsafe"] = "red; } body { color: red";

  const lowContrast = clone(source) as RecordValue;
  const contrastPack = record(lowContrast.pack, "pack");
  const contrastStyle = record(contrastPack.style, "style");
  const contrastLight = record(contrastStyle.light, "light");
  record(contrastLight.note, "note")["--text-normal"] = "#F4F0E8";

  for (const [name, fixture] of [
    ["missing asset", missing],
    ["unsafe token", unsafe],
    ["low contrast", lowContrast],
  ] as const) {
    let refused = false;
    try {
      validateHandbookPack(fixture);
    } catch {
      refused = true;
    }
    if (!refused) throw new Error(`self-test did not refuse ${name}`);
  }
}

const source = JSON.parse(fs.readFileSync(PACK_PATH, "utf8")) as unknown;
validateHandbookPack(source);
if (process.argv.includes("--self-test")) selfTest(source);

const files = fs
  .readdirSync(path.join(PACK_ROOT, "assets"), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.join(entry.parentPath, entry.name));
const bytes = files.reduce((total, file) => total + fs.statSync(file).size, 0);
console.log(`Handbook Adrenaline package: green (${files.length} assets, ${bytes} bytes)`);
