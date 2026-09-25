import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

type Obj = Record<string, unknown>;
type Target = "pj" | "pnj" | "monstre";
const TARGETS: Target[] = ["pj", "pnj", "monstre"];
const EXTENSION = "x-adrenaline-presentation";
const LAYOUTS = new Set(["banner", "columns", "grid", "stack"]);
const FORMS = new Set([
  "name-card",
  "game-parameters",
  "formation-columns",
  "identity-fields",
  "characteristic-rows",
  "ruled-list",
  "weapon-lines",
  "protection-lines",
  "stress-dice",
  "threshold-rows",
  "status-frames",
  "fatigue-circles",
  "narrative",
  "compact-rows",
  "combat",
  "state-card",
]);
const PACK = JSON.parse(
  fs.readFileSync(path.join("handbook", "adrenaline", "pack.json"), "utf8"),
) as Obj;

function obj(value: unknown, where: string): Obj {
  assert.ok(
    value && typeof value === "object" && !Array.isArray(value),
    `${where} must be an object`,
  );
  return value as Obj;
}

function keys(value: Obj, expected: string[], where: string): void {
  assert.deepEqual(Object.keys(value).sort(), expected.sort(), `${where} fields differ`);
}

function entries(value: unknown, where: string): Obj[] {
  assert.ok(Array.isArray(value) && value.length > 0, `${where} must not be empty`);
  const items = value.map((item, i) => obj(item, `${where}.${i}`));
  const ids = items.map((item) => item.id);
  const orders = items.map((item) => item.order);
  assert.ok(
    ids.every((id) => typeof id === "string" && id.length > 0),
    `${where} ids must be text`,
  );
  assert.ok(
    orders.every((order) => Number.isInteger(order) && Number(order) > 0),
    `${where} orders must be positive`,
  );
  assert.equal(new Set(ids).size, ids.length, `${where} ids must be unique`);
  assert.equal(new Set(orders).size, orders.length, `${where} orders must be unique`);
  assert.deepEqual(
    orders,
    [...orders].sort((a, b) => Number(a) - Number(b)),
    `${where} must be ordered`,
  );
  return items;
}

function layout(item: Obj, where: string): void {
  assert.ok(LAYOUTS.has(item.layout as string), `${where}.layout is unknown`);
  if (item.columns !== undefined) {
    assert.ok(
      Number.isInteger(item.columns) && Number(item.columns) >= 1 && Number(item.columns) <= 4,
      `${where}.columns must be 1..4`,
    );
  }
}

function nodeAt(schema: Obj, raw: unknown, where: string): { root: string; node: Obj } {
  assert.ok(
    typeof raw === "string" && /^\/(?:[A-Za-z][A-Za-z0-9]*)(?:\/[A-Za-z][A-Za-z0-9]*)*$/.test(raw),
    `${where} must be a property JSON Pointer`,
  );
  const segments = (raw as string).slice(1).split("/");
  let node = schema;
  for (const segment of segments) {
    const properties = obj(node.properties, `${where}.properties`);
    assert.ok(
      Object.hasOwn(properties, segment),
      `${where} references unknown property ${segment}`,
    );
    node = obj(properties[segment], `${where}/${segment}`);
  }
  return { root: segments[0], node };
}

function appearance(value: unknown, where: string): void {
  const visual = obj(value, where);
  keys(
    visual,
    ["variant", "surface", "outerRule", "fonts", "tokens", "sectionTitles", "values"],
    where,
  );
  assert.equal(visual.variant, "zombiology");
  assert.ok(["paper-sheet", "compact-card"].includes(visual.surface as string));
  assert.equal(visual.outerRule, true);
  const fonts = obj(visual.fonts, `${where}.fonts`);
  keys(fonts, ["body", "heading", "handwritten"], `${where}.fonts`);
  assert.deepEqual(fonts, {
    body: "Adrenaline Body",
    heading: "Adrenaline Display",
    handwritten: "Adrenaline Handwriting",
  });
  const pack = obj(PACK.pack, "pack.pack");
  const assets = obj(pack.assets, "pack.assets");
  const declaredFonts = obj(assets.fonts, "pack.assets.fonts");
  for (const font of Object.values(fonts))
    assert.ok(
      Object.hasOwn(declaredFonts, font as string),
      `${where} font ${font} is absent from the pack`,
    );
  const tokens = obj(visual.tokens, `${where}.tokens`);
  keys(
    tokens,
    [
      "paper",
      "card",
      "ink",
      "band",
      "bandInk",
      "sectionBand",
      "rule",
      "handwrittenInk",
      "statusYellowBg",
      "statusYellowInk",
      "statusRedBg",
      "statusRedInk",
    ],
    `${where}.tokens`,
  );
  const style = obj(pack.style, "pack.style");
  for (const token of Object.values(tokens)) {
    assert.match(token as string, /^--[a-z0-9-]+$/, `${where} token is unsafe`);
    for (const layerName of ["base", "light", "dark"]) {
      const layer = obj(style[layerName], `style.${layerName}`);
      const note = obj(layer.note, `style.${layerName}.note`);
      if (layerName !== "base")
        assert.ok(
          Object.hasOwn(note, token as string) ||
            Object.hasOwn(
              obj(obj(style.base, "style.base").note, "style.base.note"),
              token as string,
            ),
          `${where} token ${token} missing in ${layerName}`,
        );
    }
  }
  assert.deepEqual(visual.sectionTitles, { align: "center", font: "heading" });
  assert.deepEqual(visual.values, {
    align: "end",
    font: "handwritten",
    color: "handwrittenInk",
    renderMaximum: false,
  });
}

function decoration(value: unknown, where: string): void {
  const rule = obj(value, where);
  switch (rule.kind) {
    case "dice-options":
      keys(rule, ["kind", "favorable", "defavorable"], where);
      assert.deepEqual(rule.favorable, ["+1d100", "+2d100"]);
      assert.deepEqual(rule.defavorable, ["-1d100", "-2d100"]);
      break;
    case "circle-groups":
      keys(rule, ["kind", "groups"], where);
      assert.deepEqual(rule.groups, [
        { label: "rounds", count: 5 },
        { label: "heures", count: 5 },
      ]);
      break;
    case "weapon-die":
      keys(rule, ["kind", "label"], where);
      assert.equal(rule.label, "d10");
      break;
    case "protection-units":
      keys(rule, ["kind", "physical", "mental"], where);
      assert.equal(rule.physical, "PP");
      assert.equal(rule.mental, "PM");
      break;
    default:
      assert.fail(`${where} decoration is unknown`);
  }
}

function numericBounds(value: unknown, where: string): void {
  if (Array.isArray(value)) return value.forEach((item, i) => numericBounds(item, `${where}.${i}`));
  if (!value || typeof value !== "object") return;
  const node = value as Obj;
  if (node.type === "integer" || node.type === "number") {
    assert.ok(
      typeof node.minimum === "number" && typeof node.maximum === "number",
      `${where} needs minimum and maximum`,
    );
    assert.ok(node.minimum <= node.maximum, `${where} has inverted bounds`);
  }
  for (const [key, child] of Object.entries(node))
    if (key !== EXTENSION) numericBounds(child, `${where}.${key}`);
}

export function validatePresentation(source: unknown, target: Target): void {
  const schema = obj(source, `${target} schema`);
  const properties = obj(schema.properties, `${target}.properties`);
  const descriptor = obj(schema[EXTENSION], `${target}.${EXTENSION}`);
  keys(
    descriptor,
    ["version", "capability", "sheet", "appearance", "values", "sections", "hiddenPaths"],
    EXTENSION,
  );
  assert.equal(descriptor.version, 1);
  assert.equal(descriptor.capability, `block:adrenaline-${target}`);
  const sheet = obj(descriptor.sheet, `${target}.sheet`);
  keys(sheet, ["id", "label"], `${target}.sheet`);
  assert.equal(sheet.id, `adrenaline-${target}`);
  assert.ok(typeof sheet.label === "string" && sheet.label.length > 0);
  appearance(descriptor.appearance, `${target}.appearance`);
  const values = obj(descriptor.values, `${target}.values`);
  keys(values, ["editorBounds", "range"], `${target}.values`);
  assert.equal(values.editorBounds, "json-schema");
  assert.deepEqual(values.range, {
    minimum: "minimum",
    current: "current",
    maximum: "maximum",
    render: "current",
  });

  const coverage = new Set<string>();
  const usedPaths: string[] = [];
  const forms = new Map<string, string>();
  for (const section of entries(descriptor.sections, `${target}.sections`)) {
    const where = `${target}.sections.${section.id}`;
    keys(
      section,
      [
        "id",
        "label",
        "order",
        "layout",
        ...(section.columns === undefined ? [] : ["columns"]),
        ...(section.showTitle === undefined ? [] : ["showTitle"]),
        "blocks",
      ],
      where,
    );
    layout(section, where);
    if (section.showTitle !== undefined) assert.equal(typeof section.showTitle, "boolean");
    for (const block of entries(section.blocks, `${where}.blocks`)) {
      const blockWhere = `${where}.blocks.${block.id}`;
      keys(
        block,
        [
          "id",
          "label",
          "order",
          "layout",
          ...(block.columns === undefined ? [] : ["columns"]),
          ...(block.form === undefined ? [] : ["form"]),
          ...(block.rangeDisplay === undefined ? [] : ["rangeDisplay"]),
          ...(block.rowLabels === undefined ? [] : ["rowLabels"]),
          ...(block.valueSuffix === undefined ? [] : ["valueSuffix"]),
          ...(block.formationFields === undefined ? [] : ["formationFields"]),
          ...(block.placement === undefined ? [] : ["placement"]),
          ...(block.decoration === undefined ? [] : ["decoration"]),
          "paths",
        ],
        blockWhere,
      );
      layout(block, blockWhere);
      if (block.form !== undefined)
        assert.ok(FORMS.has(block.form as string), `${blockWhere}.form is unknown`);
      if (block.rangeDisplay !== undefined) {
        assert.equal(
          block.form,
          "characteristic-rows",
          `${blockWhere}.rangeDisplay needs characteristic rows`,
        );
        assert.deepEqual(block.rangeDisplay, ["minimum", "current"]);
      }
      if (block.rowLabels !== undefined) {
        assert.ok(
          Array.isArray(block.rowLabels) &&
            block.rowLabels.length === (block.paths as unknown[]).length,
          `${blockWhere}.rowLabels must match paths`,
        );
        assert.ok(
          block.rowLabels.every((label: unknown) => typeof label === "string" && label.length > 0),
        );
      }
      if (block.valueSuffix !== undefined)
        assert.ok(["%", "PX"].includes(block.valueSuffix as string));
      if (block.formationFields !== undefined) {
        assert.equal(block.form, "formation-columns");
        assert.deepEqual(block.formationFields, {
          header: ["type", "nom", "pourcentage"],
          competence: ["nom", "specialite", "pourcentage"],
        });
        const formation = nodeAt(schema, "/formations", blockWhere).node;
        const item = obj(formation.items, `${blockWhere}.items`);
        const header = obj(item.properties, `${blockWhere}.header`);
        const competence = obj(
          obj(
            obj(header.competences, `${blockWhere}.competences`).items,
            `${blockWhere}.competenceItem`,
          ).properties,
          `${blockWhere}.competenceFields`,
        );
        for (const field of ["type", "nom", "pourcentage"]) assert.ok(Object.hasOwn(header, field));
        for (const field of ["nom", "specialite", "pourcentage"])
          assert.ok(Object.hasOwn(competence, field));
      }
      assert.ok(!forms.has(block.id as string), `${target} block id ${block.id} is duplicated`);
      if (block.form !== undefined) forms.set(block.id as string, block.form as string);
      if (block.placement !== undefined) {
        const placement = obj(block.placement, `${blockWhere}.placement`);
        keys(
          placement,
          [
            "column",
            "row",
            ...(placement.rowSpan === undefined ? [] : ["rowSpan"]),
            ...(placement.columnSpan === undefined ? [] : ["columnSpan"]),
          ],
          `${blockWhere}.placement`,
        );
        for (const field of Object.keys(placement))
          assert.ok(
            Number.isInteger(placement[field]) && Number(placement[field]) >= 1,
            `${blockWhere}.placement.${field} must be positive`,
          );
        assert.ok(
          Number(placement.column) <= Number(section.columns ?? 1),
          `${blockWhere}.placement.column exceeds section columns`,
        );
      }
      if (block.decoration !== undefined) decoration(block.decoration, `${blockWhere}.decoration`);
      assert.ok(
        Array.isArray(block.paths) && block.paths.length > 0,
        `${blockWhere}.paths must not be empty`,
      );
      for (const raw of block.paths) {
        coverage.add(nodeAt(schema, raw, blockWhere).root);
        usedPaths.push(raw as string);
      }
    }
  }
  assert.ok(Array.isArray(descriptor.hiddenPaths), `${target}.hiddenPaths must be an array`);
  for (const raw of descriptor.hiddenPaths) {
    coverage.add(nodeAt(schema, raw, `${target}.hiddenPaths`).root);
    usedPaths.push(raw as string);
  }
  assert.equal(new Set(usedPaths).size, usedPaths.length, `${target} paths must be unique`);
  assert.deepEqual(
    [...coverage].sort(),
    Object.keys(properties).sort(),
    `${target} root properties must be covered`,
  );
  numericBounds(schema, `${target} schema`);
  if (target === "pj") {
    for (const [id, expectedForm] of Object.entries({
      nom: "name-card",
      "parametres-jeu": "game-parameters",
      px: "name-card",
      "formations-competences": "formation-columns",
      identite: "identity-fields",
      "caracteristiques-physiques": "characteristic-rows",
      "caracteristiques-mentales": "characteristic-rows",
      possessions: "ruled-list",
      "armes-physiques": "weapon-lines",
      "armes-mentales": "weapon-lines",
      "protections-physiques": "protection-lines",
      "protections-mentales": "protection-lines",
      stress: "stress-dice",
      "seuils-physiques": "threshold-rows",
      "seuils-mentaux": "threshold-rows",
      malus: "status-frames",
      "etats-encaisses": "status-frames",
      fatigue: "fatigue-circles",
    }))
      assert.equal(forms.get(id), expectedForm, `${target}.${id} has wrong form`);
    for (const name of ["for", "con", "dex", "rap", "log", "vol", "per", "cha"]) {
      for (const field of ["minimum", "current", "maximum"]) {
        const numericField: Obj = nodeAt(
          schema,
          `/caracteristiques/${name}/${field}`,
          `${target}.${name}.${field}`,
        ).node;
        assert.equal(numericField.maximum, 50, `${target}.${name}.${field} must be capped at 50`);
      }
    }
    for (const field of ["rounds", "heures"]) {
      const numericField: Obj = nodeAt(
        schema,
        `/etatDePartie/fatigue/${field}`,
        `${target}.fatigue.${field}`,
      ).node;
      assert.equal(numericField.minimum, 0);
      assert.equal(numericField.maximum, 5);
    }
  }
  if (target === "monstre") {
    const numericField: Obj = nodeAt(
      schema,
      "/caracteristiques/for/current",
      `${target}.for.current`,
    ).node;
    assert.ok(
      Number(numericField.maximum) >= 70,
      "monster characteristics must allow values above 50",
    );
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const schemas = new Map<Target, Obj>();
for (const target of TARGETS) {
  const schema = JSON.parse(
    fs.readFileSync(path.join("schemas", "adrenaline", `${target}.schema.json`), "utf8"),
  ) as Obj;
  validatePresentation(schema, target);
  schemas.set(target, schema);
  console.log(`✓ ${target}: presentation descriptor valid`);
}

if (process.argv.includes("--self-test")) {
  const source = schemas.get("pj");
  assert.ok(source);
  const wrongCapability = clone(source);
  obj(wrongCapability[EXTENSION], EXTENSION).capability = "block:adrenaline-pnj";
  assert.throws(() => validatePresentation(wrongCapability, "pj"));
  const unknownPath = clone(source);
  const firstSection = (obj(unknownPath[EXTENSION], EXTENSION).sections as Obj[])[0];
  const firstBlock = (firstSection.blocks as Obj[])[0];
  (firstBlock.paths as string[])[0] = "/inconnu";
  assert.throws(() => validatePresentation(unknownPath, "pj"));
  const duplicatePath = clone(source);
  const duplicateSection = (obj(duplicatePath[EXTENSION], EXTENSION).sections as Obj[])[0];
  const duplicateBlock = (duplicateSection.blocks as Obj[])[0];
  (duplicateBlock.paths as string[]).push((duplicateBlock.paths as string[])[0]);
  assert.throws(() => validatePresentation(duplicatePath, "pj"));
  const missingStyle = clone(source);
  const visual = obj(obj(missingStyle[EXTENSION], EXTENSION).appearance, "appearance");
  const tokens = obj(visual.tokens, "tokens");
  tokens.handwrittenInk = "--missing-written-ink";
  assert.throws(() => validatePresentation(missingStyle, "pj"));
  const wrongBound = clone(source);
  const bound: Obj = nodeAt(wrongBound, "/caracteristiques/for/current", "for.current").node;
  bound.maximum = 200;
  assert.throws(() => validatePresentation(wrongBound, "pj"));
  console.log("✓ presentation validator self-test passed");
}
