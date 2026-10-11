import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ADRENALINE_VISUAL_CALLOUTS } from "../src/callouts.js";

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
  "shock-circles",
  "malus-scale",
  "narrative",
  "compact-rows",
  "combat",
  "state-card",
  "state-header",
  "malus-tracks",
  "malus-circles",
  "inline-list",
  "skill-lines",
  "action-lines",
]);
const BASE_TOKENS = [
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
];
const COMPACT_CARD_TOKENS = [
  "malusShock",
  "malusWound",
  "bannerGarnet",
  "bannerBlue",
  "bannerOrange",
  "bannerInk",
  "triggerBg",
  "triggerInk",
  "diceBadgeBg",
  "diceBadgeInk",
];
/** Only a creature card has a state header, so only it draws the case of its current state. */
const CREATURE_CARD_TOKENS = ["stateBadge"];
const CARDS = ["principal", "secondaire"];
const CATEGORY_VARIANTS = new Set(["garnet", "blue", "orange"]);
const ICON = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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

function appearance(value: unknown, where: string, target: Target): void {
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
  const compact = visual.surface === "compact-card";
  const tokens = obj(visual.tokens, `${where}.tokens`);
  keys(
    tokens,
    compact
      ? [
          ...BASE_TOKENS,
          ...COMPACT_CARD_TOKENS,
          ...(target === "monstre" ? CREATURE_CARD_TOKENS : []),
        ]
      : BASE_TOKENS,
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
  // Both print their figures flush right: handwritten on the paper sheet, typeset on the card.
  if (compact) {
    assert.deepEqual(visual.sectionTitles, { align: "start", font: "heading" });
    assert.deepEqual(visual.values, {
      align: "end",
      font: "body",
      color: "ink",
      renderMaximum: false,
    });
  } else {
    assert.deepEqual(visual.sectionTitles, { align: "center", font: "heading" });
    assert.deepEqual(visual.values, {
      align: "end",
      font: "handwritten",
      color: "handwrittenInk",
      renderMaximum: false,
    });
  }
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
    case "scale":
      keys(rule, ["kind", "from", "to"], where);
      assert.equal(rule.from, 1);
      assert.equal(rule.to, 10);
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
    case "malus-tracks":
      keys(rule, ["kind", "length", "stressDefault"], where);
      assert.equal(rule.length, 10);
      assert.equal(rule.stressDefault, 2);
      break;
    case "state-badge":
      keys(rule, ["kind", "triggerMarker", "current"], where);
      assert.equal(rule.triggerMarker, true, `${where}.triggerMarker must be true`);
      // What `current` binds to is checked with the block, which knows its paths and cards.
      keys(obj(rule.current, `${where}.current`), ["path", "cards"], `${where}.current`);
      break;
    default:
      assert.fail(`${where} decoration is unknown`);
  }
}

function categories(schema: Obj, value: unknown, where: string): void {
  const rule = obj(value, where);
  keys(
    rule,
    ["path", "fallbackLabel", "defaultVariant", "defaultIcon", "variants", "icons"],
    where,
  );
  assert.equal(rule.path, "/categorie", `${where}.path must read the category`);
  nodeAt(schema, rule.path, `${where}.path`);
  assert.ok(
    typeof rule.fallbackLabel === "string" && rule.fallbackLabel.length > 0,
    `${where}.fallbackLabel must be text`,
  );
  assert.ok(CATEGORY_VARIANTS.has(rule.defaultVariant as string), `${where}.defaultVariant`);
  assert.match(String(rule.defaultIcon), ICON, `${where}.defaultIcon`);
  for (const [name, variant] of Object.entries(obj(rule.variants, `${where}.variants`))) {
    assert.ok(name.length > 0, `${where}.variants names must be text`);
    assert.ok(CATEGORY_VARIANTS.has(variant as string), `${where}.variants.${name}`);
  }
  for (const [name, icon] of Object.entries(obj(rule.icons, `${where}.icons`))) {
    assert.ok(name.length > 0, `${where}.icons names must be text`);
    assert.match(String(icon), ICON, `${where}.icons.${name}`);
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
    [
      "version",
      "capability",
      "sheet",
      "appearance",
      ...(descriptor.categories === undefined ? [] : ["categories"]),
      ...(descriptor.cards === undefined ? [] : ["cards"]),
      "values",
      "sections",
      "hiddenPaths",
    ],
    EXTENSION,
  );
  assert.equal(descriptor.version, 1);
  assert.equal(descriptor.capability, `block:adrenaline-${target}`);
  const sheet = obj(descriptor.sheet, `${target}.sheet`);
  keys(sheet, ["id", "label"], `${target}.sheet`);
  assert.equal(sheet.id, `adrenaline-${target}`);
  assert.ok(typeof sheet.label === "string" && sheet.label.length > 0);
  appearance(descriptor.appearance, `${target}.appearance`, target);
  if (descriptor.categories !== undefined)
    categories(schema, descriptor.categories, `${target}.categories`);
  // The cards the creature can print, and when each exists: every card cited below is one of them.
  const declaredCards = new Map<string, readonly string[] | undefined>();
  if (descriptor.cards !== undefined) {
    assert.equal(target, "monstre", `${target}.cards belongs to the creature card`);
    assert.ok(
      Array.isArray(descriptor.cards) && descriptor.cards.length > 0,
      `${target}.cards must not be empty`,
    );
    descriptor.cards.forEach((raw: unknown, i: number) => {
      const where = `${target}.cards.${i}`;
      const card = obj(raw, where);
      keys(card, card.existsWhenAny === undefined ? ["id"] : ["id", "existsWhenAny"], where);
      assert.ok(CARDS.includes(card.id as string), `${where}.id is unknown`);
      assert.ok(
        !declaredCards.has(card.id as string),
        `${where} declares ${String(card.id)} twice`,
      );
      if (card.existsWhenAny === undefined) {
        declaredCards.set(card.id as string, undefined);
        return;
      }
      const pointers = card.existsWhenAny;
      assert.ok(
        Array.isArray(pointers) && pointers.length > 0,
        `${where}.existsWhenAny must not be empty`,
      );
      for (const pointer of pointers) nodeAt(schema, pointer, `${where}.existsWhenAny ${pointer}`);
      assert.equal(
        new Set(pointers).size,
        pointers.length,
        `${where}.existsWhenAny repeats a pointer`,
      );
      declaredCards.set(card.id as string, pointers as string[]);
    });
    assert.ok(
      declaredCards.has("principal") && declaredCards.get("principal") === undefined,
      `${target}.cards must declare the principal card, always printed`,
    );
  } else assert.notEqual(target, "monstre", `${target} must declare its cards`);
  const declared = (card: unknown, where: string): void =>
    assert.ok(
      declaredCards.has(String(card)),
      `${where} names card ${String(card)}, which the descriptor does not declare`,
    );
  const values = obj(descriptor.values, `${target}.values`);
  keys(values, ["editorBounds", "range"], `${target}.values`);
  assert.equal(values.editorBounds, "json-schema");
  assert.deepEqual(values.range, {
    minimum: "minimum",
    current: "current",
    maximum: "maximum",
    render: "current",
  });

  const sectionList = entries(descriptor.sections, `${target}.sections`);
  const coverage = new Set<string>();
  const usedPaths: string[] = [];
  const forms = new Map<string, string>();
  const rows: { id: string; span: number }[] = [];
  for (const section of sectionList) {
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
        ...(section.row === undefined ? [] : ["row"]),
        ...(section.collapsible === undefined ? [] : ["collapsible"]),
        ...(section.labelFrom === undefined ? [] : ["labelFrom"]),
        ...(section.cards === undefined ? [] : ["cards"]),
        ...(section.joinedTo === undefined ? [] : ["joinedTo"]),
        ...(section.fallbackCard === undefined ? [] : ["fallbackCard"]),
        "blocks",
      ],
      where,
    );
    layout(section, where);
    if (section.showTitle !== undefined) assert.equal(typeof section.showTitle, "boolean");
    if (section.collapsible !== undefined)
      assert.equal(section.collapsible, true, `${where}.collapsible is either true or absent`);
    // The label value is a visible path: it counts once, like a block path.
    if (section.labelFrom !== undefined) {
      coverage.add(nodeAt(schema, section.labelFrom, `${where}.labelFrom`).root);
      usedPaths.push(section.labelFrom as string);
    }
    if (section.cards !== undefined) {
      assert.equal(target, "monstre", `${where}.cards belongs to the creature card`);
      assert.ok(
        Array.isArray(section.cards) && section.cards.length > 0,
        `${where}.cards must not be empty`,
      );
      for (const card of section.cards) declared(card, `${where}.cards`);
      assert.equal(new Set(section.cards).size, section.cards.length, `${where}.cards repeat`);
      assert.ok(section.collapsible === undefined, `${where} cannot fold inside a card`);
    }
    if (section.joinedTo !== undefined) {
      assert.equal(target, "monstre", `${where}.joinedTo belongs to the creature card`);
      const join = obj(section.joinedTo, `${where}.joinedTo`);
      keys(join, ["section", "title", "card"], `${where}.joinedTo`);
      assert.ok(
        typeof join.title === "string" && join.title.trim().length > 0,
        `${where}.joinedTo.title must be text`,
      );
      declared(join.card, `${where}.joinedTo.card`);
      assert.notEqual(join.section, section.id, `${where}.joinedTo cannot name itself`);
      const host = sectionList.find((other) => other.id === join.section);
      assert.ok(host, `${where}.joinedTo names unknown section ${String(join.section)}`);
      assert.ok(
        Array.isArray(section.cards) && section.cards.includes(join.card),
        `${where}.joinedTo needs its own section printed on the ${String(join.card)} card`,
      );
      assert.ok(
        Array.isArray(host.cards) && host.cards.includes(join.card),
        `${where}.joinedTo names section ${String(join.section)}, not printed on the ${String(join.card)} card`,
      );
      assert.equal(
        host.joinedTo,
        undefined,
        `${where}.joinedTo names section ${String(join.section)}, itself joined`,
      );
      assert.ok(
        Number(host.order) < Number(section.order),
        `${where}.joinedTo names section ${String(join.section)}, which does not come first in order`,
      );
    }
    // The card a section falls back to when the cards it names are not printed.
    if (section.fallbackCard !== undefined) {
      assert.equal(target, "monstre", `${where}.fallbackCard belongs to the creature card`);
      assert.ok(Array.isArray(section.cards), `${where}.fallbackCard needs a section on cards`);
      declared(section.fallbackCard, `${where}.fallbackCard`);
      assert.ok(
        !section.cards.includes(section.fallbackCard),
        `${where}.fallbackCard ${String(section.fallbackCard)} is already a card of the section`,
      );
      assert.equal(
        section.fallbackCard,
        "principal",
        `${where}.fallbackCard must name the principal card, the only one every creature prints`,
      );
    }
    if (
      target === "monstre" &&
      Array.isArray(section.cards) &&
      section.cards.length === 1 &&
      section.cards[0] === "secondaire"
    )
      assert.ok(
        section.fallbackCard !== undefined,
        `${where} is printed on the secondaire card only and declares no fallbackCard`,
      );
    if (section.row !== undefined) {
      const row = obj(section.row, `${where}.row`);
      keys(row, ["id", "span"], `${where}.row`);
      assert.ok(typeof row.id === "string" && row.id.length > 0, `${where}.row.id must be text`);
      assert.ok(
        Number.isInteger(row.span) && Number(row.span) >= 1 && Number(row.span) <= 3,
        `${where}.row.span must be 1..3`,
      );
      const current = rows[rows.length - 1];
      if (current && current.id === row.id) current.span += Number(row.span);
      else {
        assert.ok(!rows.some((seen) => seen.id === row.id), `${where}.row must follow its row`);
        rows.push({ id: row.id as string, span: Number(row.span) });
      }
      assert.ok(rows[rows.length - 1].span <= 3, `${where}.row exceeds the sheet width`);
    } else rows.push({ id: "", span: 3 });
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
          ...(block.formationTypes === undefined ? [] : ["formationTypes"]),
          ...(block.placement === undefined ? [] : ["placement"]),
          ...(block.fieldRows === undefined ? [] : ["fieldRows"]),
          ...(block.pointerRows === undefined ? [] : ["pointerRows"]),
          ...(block.cards === undefined ? [] : ["cards"]),
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
      if (block.fieldRows !== undefined) {
        assert.equal(
          block.form,
          "identity-fields",
          `${blockWhere}.fieldRows needs identity fields`,
        );
        const paths = block.paths as string[];
        assert.equal(paths.length, 1, `${blockWhere}.fieldRows needs one path`);
        const fields = obj(nodeAt(schema, paths[0], blockWhere).node.properties, blockWhere);
        assert.ok(Array.isArray(block.fieldRows) && block.fieldRows.length > 0);
        const named = (block.fieldRows as unknown[]).map((row, i) => {
          assert.ok(
            Array.isArray(row) && row.length >= 1 && row.length <= Number(block.columns ?? 1),
            `${blockWhere}.fieldRows.${i} must fit the block columns`,
          );
          return row as unknown[];
        });
        const flat = named.reduce<unknown[]>((all, row) => all.concat(row), []);
        assert.deepEqual(
          [...flat].sort(),
          Object.keys(fields).sort(),
          `${blockWhere}.fieldRows must name each field once`,
        );
      }
      if (block.cards !== undefined) {
        assert.ok(Array.isArray(section.cards), `${blockWhere}.cards needs a section on cards`);
        assert.ok(
          Array.isArray(block.cards) && block.cards.length > 0,
          `${blockWhere}.cards must not be empty`,
        );
        for (const card of block.cards) declared(card, `${blockWhere}.cards`);
        assert.ok(
          block.cards.every((card: unknown) => (section.cards as unknown[]).includes(card)),
          `${blockWhere}.cards must name cards of its section`,
        );
        assert.equal(new Set(block.cards).size, block.cards.length, `${blockWhere}.cards repeat`);
      }
      if (block.pointerRows !== undefined) {
        assert.ok(
          Array.isArray(block.pointerRows) && block.pointerRows.length > 0,
          `${blockWhere}.pointerRows must not be empty`,
        );
        const roots = block.paths as string[];
        const placed: string[] = [];
        block.pointerRows.forEach((row: unknown, i: number) => {
          assert.ok(
            Array.isArray(row) && row.length > 0,
            `${blockWhere}.pointerRows.${i} must not be empty`,
          );
          assert.ok(
            row.length <= Number(block.columns ?? 1),
            `${blockWhere}.pointerRows.${i} must fit the block columns`,
          );
          for (const raw of row as unknown[]) {
            const cell = obj(raw, `${blockWhere}.pointerRows.${i}`);
            keys(cell, cell.label === undefined ? ["path"] : ["path", "label"], blockWhere);
            if (cell.label !== undefined)
              assert.ok(
                typeof cell.label === "string" && cell.label.length > 0,
                `${blockWhere} pointer ${String(cell.path)} label must be text`,
              );
            const pointer = String(cell.path);
            nodeAt(schema, pointer, `${blockWhere} pointer ${pointer}`);
            assert.ok(
              roots.some((root) => pointer === root || pointer.startsWith(`${root}/`)),
              `${blockWhere} pointer ${pointer} does not descend from a block path`,
            );
            assert.ok(
              !placed.includes(pointer),
              `${blockWhere} pointer ${pointer} is placed twice`,
            );
            placed.push(pointer);
          }
        });
        // Every field a block path publishes must be printed in some row.
        for (const root of roots) {
          const node = nodeAt(schema, root, blockWhere).node;
          const expected =
            node.properties === undefined
              ? [root]
              : Object.keys(obj(node.properties, blockWhere)).map((name) => `${root}/${name}`);
          for (const pointer of expected)
            assert.ok(placed.includes(pointer), `${blockWhere} pointer ${pointer} is in no row`);
        }
      }
      if (block.valueSuffix !== undefined)
        assert.ok(["%", "PX"].includes(block.valueSuffix as string));
      if (block.formationTypes !== undefined) {
        assert.equal(
          block.form,
          "formation-columns",
          `${blockWhere}.formationTypes needs formation columns`,
        );
        const formation = nodeAt(schema, "/formations", blockWhere).node;
        const item = obj(formation.items, `${blockWhere}.items`);
        const type = obj(
          obj(item.properties, `${blockWhere}.properties`).type,
          `${blockWhere}.type`,
        );
        assert.deepEqual(
          block.formationTypes,
          type.enum,
          `${blockWhere}.formationTypes must print every published formation type, in order`,
        );
        assert.ok(
          Array.isArray(item.required) && item.required.includes("type"),
          `${blockWhere}.formationTypes needs a required formation type`,
        );
      }
      if (block.formationFields !== undefined) {
        assert.equal(block.form, "formation-columns");
        assert.deepEqual(block.formationFields, {
          header: ["type", "nom", "pourcentage"],
          competence: ["nom", "specialite", "caracteristique", "pourcentage"],
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
        for (const field of ["nom", "specialite", "caracteristique", "pourcentage"])
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
          Number(placement.column) + Number(placement.columnSpan ?? 1) - 1 <=
            Number(section.columns ?? 1),
          `${blockWhere}.placement.column exceeds section columns`,
        );
      }
      if (block.decoration !== undefined) decoration(block.decoration, `${blockWhere}.decoration`);
      if (
        block.decoration !== undefined &&
        obj(block.decoration, blockWhere).kind === "state-badge"
      ) {
        assert.equal(block.form, "state-header", `${blockWhere} state badge needs a state header`);
        const current = obj(obj(block.decoration, blockWhere).current, blockWhere);
        nodeAt(schema, current.path, `${blockWhere} state badge current`);
        assert.ok(
          (block.paths as string[]).includes(current.path as string),
          `${blockWhere} state badge needs its current path among the block paths`,
        );
        assert.ok(
          Array.isArray(current.cards) && current.cards.length > 0,
          `${blockWhere} state badge cards must not be empty`,
        );
        for (const card of current.cards) declared(card, `${blockWhere} state badge cards`);
        assert.ok(
          Array.isArray(section.cards) &&
            current.cards.every((card: unknown) => (section.cards as unknown[]).includes(card)),
          `${blockWhere} state badge cards must name cards of its section`,
        );
        assert.equal(
          new Set(current.cards).size,
          current.cards.length,
          `${blockWhere} state badge cards repeat`,
        );
      }
      const tracks = block.decoration !== undefined && obj(block.decoration, blockWhere).kind;
      if (block.form === "malus-tracks" || tracks === "malus-tracks")
        assert.ok(
          block.form === "malus-tracks" && tracks === "malus-tracks",
          `${blockWhere} malus tracks need both their form and their decoration`,
        );
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
      choc: "shock-circles",
      divers: "status-frames",
      "etats-encaisses": "status-frames",
      "total-malus": "malus-scale",
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
        `/etatDePartie/malus/choc/${field}`,
        `${target}.malus.choc.${field}`,
      ).node;
      assert.equal(numericField.minimum, 0);
      assert.equal(numericField.maximum, 5);
    }
    const total: Obj = nodeAt(schema, "/etatDePartie/malus/total", `${target}.malus.total`).node;
    assert.equal(total.minimum, 0);
    assert.equal(total.maximum, 10, `${target}.malus.total must stop at 10, the HS state`);
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

const CALLOUT_ID = /^adrenaline-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CALLOUT_WORD = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CALLOUT_CONTRACT = path.join("handbook", "adrenaline", "callout-contract.md");
const CALLOUT_EXAMPLE = path.join("handbook", "adrenaline", "callouts-example.md");

/* The callout list is the Markdown syntax authors type: every alias must stay unique across
   entries, every capability must be one the pack requires, and both published notes must
   name every id and alias — otherwise a consumer would offer a callout nobody documented. */
function validateCallouts(callouts: readonly Obj[], contract: string, example: string): void {
  const requires = PACK.requires as string[];
  const ids = new Set<string>();
  const aliases = new Set<string>();
  for (const callout of callouts) {
    keys(callout, ["id", "label", "aliases", "template", "capability", "modifiers"], "callout");
    const id = String(callout.id);
    assert.match(id, CALLOUT_ID, `callout id ${id}`);
    assert.ok(!ids.has(id), `duplicate callout id ${id}`);
    ids.add(id);
    assert.ok(String(callout.label).trim().length > 0, `${id}.label must be text`);
    assert.ok(["title-body", "body-only"].includes(String(callout.template)), `${id}.template`);
    assert.ok(
      requires.includes(String(callout.capability)),
      `${id}.capability not required by the pack`,
    );
    assert.ok(contract.includes(`\`${id}\``), `${id} missing from callout-contract.md`);
    const names = callout.aliases as string[];
    assert.ok(Array.isArray(names) && names.length > 0, `${id}.aliases must not be empty`);
    for (const alias of names) {
      assert.match(alias, CALLOUT_WORD, `${id} alias ${alias}`);
      assert.ok(!aliases.has(alias), `alias ${alias} used twice`);
      aliases.add(alias);
      assert.ok(
        contract.includes(`\`${alias}\``),
        `alias ${alias} missing from callout-contract.md`,
      );
    }
    assert.ok(example.includes(`> [!${names[0]}`), `${id} has no example in callouts-example.md`);
    for (const modifier of callout.modifiers as Obj[]) {
      keys(modifier, ["id", "label"], `${id}.modifier`);
      assert.match(String(modifier.id), CALLOUT_WORD, `${id} modifier`);
      assert.ok(
        example.includes(`> [!${names[0]}|${String(modifier.id)}]`),
        `${id}|${String(modifier.id)} has no example in callouts-example.md`,
      );
    }
  }
}

const calloutSource = ADRENALINE_VISUAL_CALLOUTS as unknown as readonly Obj[];
const calloutContract = fs.readFileSync(CALLOUT_CONTRACT, "utf8");
const calloutExample = fs.readFileSync(CALLOUT_EXAMPLE, "utf8");
validateCallouts(calloutSource, calloutContract, calloutExample);
console.log(`✓ callouts: ${calloutSource.length} visual callouts documented`);

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
  const sectionsOf = (value: Obj) => obj(value[EXTENSION], EXTENSION).sections as Obj[];
  const tooWide = clone(source);
  for (const section of sectionsOf(tooWide)) if (section.row) obj(section.row, "row").span = 3;
  assert.throws(() => validatePresentation(tooWide, "pj"));
  const splitRow = clone(source);
  const lastSection = sectionsOf(splitRow)[sectionsOf(splitRow).length - 1];
  lastSection.row = { id: "profil", span: 1 };
  assert.throws(() => validatePresentation(splitRow, "pj"));
  const missingField = clone(source);
  for (const section of sectionsOf(missingField))
    for (const block of section.blocks as Obj[])
      if (block.fieldRows) (block.fieldRows as string[][]).pop();
  assert.throws(() => validatePresentation(missingField, "pj"));
  const missingType = clone(source);
  for (const section of sectionsOf(missingType))
    for (const block of section.blocks as Obj[])
      if (block.formationTypes) (block.formationTypes as string[]).pop();
  assert.throws(() => validatePresentation(missingType, "pj"));
  const monster = schemas.get("monstre");
  assert.ok(monster);
  const unknownCard = clone(monster);
  for (const section of sectionsOf(unknownCard))
    if (section.cards) (section.cards as string[]).push("tertiaire");
  assert.throws(
    () => validatePresentation(unknownCard, "monstre"),
    /sections\.etat\.cards names card tertiaire, which the descriptor does not declare/,
  );
  const labelTwice = clone(monster);
  for (const section of sectionsOf(labelTwice))
    if (section.labelFrom) section.labelFrom = "/caracteristiques";
  assert.throws(() => validatePresentation(labelTwice, "monstre"));
  const wrongVariant = clone(monster);
  obj(obj(wrongVariant[EXTENSION], EXTENSION).categories, "categories").defaultVariant = "pink";
  assert.throws(() => validatePresentation(wrongVariant, "monstre"));
  const blocksOf = (value: Obj) => sectionsOf(value).flatMap((section) => section.blocks as Obj[]);
  type Cell = { path: string; label?: string };
  const rowsOf = (value: Obj) => {
    const block = blocksOf(value).find((candidate) => candidate.pointerRows);
    assert.ok(block);
    return block.pointerRows as Cell[][];
  };
  const absentPointer = clone(monster);
  rowsOf(absentPointer)[1][1].path = "/caracteristiques/log";
  assert.throws(
    () => validatePresentation(absentPointer, "monstre"),
    /blocks\.caracteristiques pointer \/caracteristiques\/log/,
  );
  const doubledPointer = clone(monster);
  rowsOf(doubledPointer)[1][0].path = "/caracteristiques/for";
  assert.throws(
    () => validatePresentation(doubledPointer, "monstre"),
    /blocks\.caracteristiques pointer \/caracteristiques\/for is placed twice/,
  );
  const foreignPointer = clone(monster);
  rowsOf(foreignPointer)[1][0].path = "/niveauDeDanger";
  assert.throws(
    () => validatePresentation(foreignPointer, "monstre"),
    /blocks\.caracteristiques pointer \/niveauDeDanger does not descend/,
  );
  const unplacedPointer = clone(monster);
  rowsOf(unplacedPointer)[0].pop();
  assert.throws(
    () => validatePresentation(unplacedPointer, "monstre"),
    /blocks\.caracteristiques pointer \/caracteristiques\/rap is in no row/,
  );
  const wideRow = clone(monster);
  rowsOf(wideRow)[1].push({ path: "/caracteristiques/for" }, { path: "/caracteristiques/con" });
  assert.throws(
    () => validatePresentation(wideRow, "monstre"),
    /blocks\.caracteristiques\.pointerRows\.1 must fit the block columns/,
  );
  /* Joins: the section that follows names the one that comes first. */
  const sectionNamed = (value: Obj, id: string): Obj => {
    const found = sectionsOf(value).find((section) => section.id === id);
    assert.ok(found);
    return found;
  };
  const joinOf = (value: Obj): Obj => obj(sectionNamed(value, "comportement").joinedTo, "joinedTo");
  /* One refusal per rule on the creature: the mutation must fail with the rule's own message. */
  const refuse = (name: string, mutate: (value: Obj) => void, message: RegExp): void => {
    const mutated = clone(monster);
    mutate(mutated);
    assert.throws(() => validatePresentation(mutated, "monstre"), message, name);
  };
  refuse(
    "join to a missing section",
    (value) => (joinOf(value).section = "absente"),
    /sections\.comportement\.joinedTo names unknown section absente/,
  );
  refuse(
    "join without a title",
    (value) => (joinOf(value).title = " "),
    /sections\.comportement\.joinedTo\.title must be text/,
  );
  refuse(
    "join with a stray key",
    (value) => (joinOf(value).stray = true),
    /sections\.comportement\.joinedTo fields differ/,
  );
  refuse(
    "join on an unknown card",
    (value) => (joinOf(value).card = "tertiaire"),
    /sections\.comportement\.joinedTo\.card names card tertiaire, which the descriptor does not declare/,
  );
  refuse(
    "join to a section absent from the card",
    (value) => (sectionNamed(value, "sante").cards = ["principal"]),
    /sections\.comportement\.joinedTo names section sante, not printed on the secondaire card/,
  );
  refuse(
    "join whose own section is absent from the card",
    (value) => (sectionNamed(value, "comportement").cards = ["principal"]),
    /sections\.comportement\.joinedTo needs its own section printed on the secondaire card/,
  );
  refuse(
    "join on itself",
    (value) => (joinOf(value).section = "comportement"),
    /sections\.comportement\.joinedTo cannot name itself/,
  );
  refuse(
    "join to a section itself joined",
    (value) => {
      const host = sectionNamed(value, "sante");
      host.joinedTo = { section: "corps", title: "Corps et santé", card: "secondaire" };
      host.order = 55;
    },
    /sections\.comportement\.joinedTo names section sante, itself joined/,
  );
  refuse(
    "join carried by the section that comes first",
    (value) => {
      const first = sectionNamed(value, "sante");
      first.joinedTo = {
        section: "comportement",
        title: String(joinOf(value).title),
        card: "secondaire",
      };
      delete sectionNamed(value, "comportement").joinedTo;
    },
    /sections\.sante\.joinedTo names section comportement, which does not come first in order/,
  );
  const joinOnNpc = clone(schemas.get("pnj") as Obj);
  sectionsOf(joinOnNpc)[1].joinedTo = {
    section: String(sectionsOf(joinOnNpc)[0].id),
    title: "Fusion",
    card: "secondaire",
  };
  assert.throws(
    () => validatePresentation(joinOnNpc, "pnj"),
    /joinedTo belongs to the creature card/,
  );
  const unknownDecoration = clone(monster);
  for (const block of blocksOf(unknownDecoration))
    if (block.decoration) obj(block.decoration, "decoration").kind = "state-pill";
  assert.throws(() => validatePresentation(unknownDecoration, "monstre"), /decoration is unknown/);
  const foreignBlockCard = clone(monster);
  for (const block of blocksOf(foreignBlockCard))
    if (block.id === "malus") block.cards = ["tertiaire"];
  assert.throws(
    () => validatePresentation(foreignBlockCard, "monstre"),
    /blocks\.malus\.cards names card tertiaire, which the descriptor does not declare/,
  );
  /* Compact-card rules of the creature. */
  const blockNamed = (value: Obj, id: string): Obj => {
    const found = blocksOf(value).find((block) => block.id === id);
    assert.ok(found);
    return found;
  };
  const badgeOf = (value: Obj): Obj => obj(blockNamed(value, "etat").decoration, "decoration");
  refuse(
    "badge without trigger marker",
    (value) => (badgeOf(value).triggerMarker = false),
    /blocks\.etat\.decoration\.triggerMarker must be true/,
  );
  refuse(
    "badge with a stray key",
    (value) => (badgeOf(value).stray = true),
    /blocks\.etat\.decoration fields differ/,
  );
  refuse(
    "badge on a block that is not a state header",
    (value) => (blockNamed(value, "etat").form = "state-card"),
    /blocks\.etat state badge needs a state header/,
  );
  refuse(
    "badge without the active state path",
    (value) => {
      const block = blockNamed(value, "etat");
      block.paths = (block.paths as string[]).filter((path) => path !== "/etatActif");
    },
    /blocks\.etat state badge needs its current path among the block paths/,
  );
  refuse(
    "block cards on a section without cards",
    (value) => (blockNamed(value, "description").cards = ["principal"]),
    /blocks\.description\.cards needs a section on cards/,
  );
  refuse(
    "empty block cards",
    (value) => (blockNamed(value, "malus").cards = []),
    /blocks\.malus\.cards must not be empty/,
  );
  refuse(
    "repeated block cards",
    (value) => (blockNamed(value, "malus").cards = ["principal", "principal"]),
    /blocks\.malus\.cards repeat/,
  );
  refuse(
    "empty pointer rows",
    (value) => (blockNamed(value, "caracteristiques").pointerRows = []),
    /blocks\.caracteristiques\.pointerRows must not be empty/,
  );
  refuse(
    "empty pointer row",
    (value) => rowsOf(value).push([]),
    /blocks\.caracteristiques\.pointerRows\.2 must not be empty/,
  );
  refuse(
    "pointer cell with a stray key",
    (value) => ((rowsOf(value)[0][0] as Obj).stray = true),
    /blocks\.caracteristiques fields differ/,
  );
  refuse(
    "pointer cell with an empty label",
    (value) => (rowsOf(value)[1][0].label = ""),
    /blocks\.caracteristiques pointer \/zoneDeDetection label must be text/,
  );
  refuse(
    "column span past the section columns",
    (value) => (blockNamed(value, "malus").placement = { column: 2, row: 2, columnSpan: 2 }),
    /blocks\.malus\.placement\.column exceeds section columns/,
  );
  refuse(
    "detection printed apart from the characteristics",
    (value) => {
      const sante = sectionNamed(value, "corps");
      (sante.blocks as Obj[]).push({
        id: "detection",
        label: "Détection",
        order: 90,
        layout: "stack",
        form: "compact-rows",
        paths: ["/zoneDeDetection"],
      });
    },
    /monstre paths must be unique/,
  );
  /* Fallback card: where a section goes when the cards it names are not printed. */
  refuse(
    "secondary-only section without a fallback card",
    (value) => delete sectionNamed(value, "equipement").fallbackCard,
    /sections\.equipement is printed on the secondaire card only and declares no fallbackCard/,
  );
  refuse(
    "fallback card unknown",
    (value) => (sectionNamed(value, "equipement").fallbackCard = "tertiaire"),
    /sections\.equipement\.fallbackCard names card tertiaire, which the descriptor does not declare/,
  );
  refuse(
    "fallback card already a card of the section",
    (value) => (sectionNamed(value, "corps").fallbackCard = "principal"),
    /sections\.corps\.fallbackCard principal is already a card of the section/,
  );
  refuse(
    "fallback card that is not the principal card",
    (value) => (sectionNamed(value, "agir").fallbackCard = "secondaire"),
    /sections\.agir\.fallbackCard must name the principal card/,
  );
  refuse(
    "fallback card on a section without cards",
    (value) => (sectionNamed(value, "meneur").fallbackCard = "principal"),
    /sections\.meneur\.fallbackCard needs a section on cards/,
  );
  const fallbackOnNpc = clone(schemas.get("pnj") as Obj);
  sectionsOf(fallbackOnNpc)[1].fallbackCard = "principal";
  assert.throws(
    () => validatePresentation(fallbackOnNpc, "pnj"),
    /fallbackCard belongs to the creature card/,
  );
  /* State badge: what its case is bound to. */
  const currentOf = (value: Obj): Obj => obj(badgeOf(value).current, "current");
  refuse(
    "badge case on a card the section does not print",
    (value) => (currentOf(value).cards = ["tertiaire"]),
    /blocks\.etat state badge cards names card tertiaire, which the descriptor does not declare/,
  );
  refuse(
    "badge case without cards",
    (value) => (currentOf(value).cards = []),
    /blocks\.etat state badge cards must not be empty/,
  );
  refuse(
    "badge case cards repeated",
    (value) => (currentOf(value).cards = ["principal", "principal"]),
    /blocks\.etat state badge cards repeat/,
  );
  refuse(
    "badge case bound to a path the contract lacks",
    (value) => (currentOf(value).path = "/inconnu"),
    /blocks\.etat state badge current references unknown property inconnu/,
  );
  refuse(
    "badge case bound to a path the block does not read",
    (value) => (currentOf(value).path = "/nom"),
    /blocks\.etat state badge needs its current path among the block paths/,
  );
  refuse(
    "badge case with a stray key",
    (value) => (currentOf(value).stray = true),
    /blocks\.etat\.decoration\.current fields differ/,
  );
  /* Card declaration: every card cited is declared, and the condition of a card is published data. */
  const cardsOf = (value: Obj): Obj[] => obj(value[EXTENSION], EXTENSION).cards as Obj[];
  const secondaryOf = (value: Obj): Obj => {
    const found = cardsOf(value).find((card) => card.id === "secondaire");
    assert.ok(found);
    return found;
  };
  refuse(
    "secondary card cited but not declared",
    (value) => {
      obj(value[EXTENSION], EXTENSION).cards = cardsOf(value).filter(
        (card) => card.id !== "secondaire",
      );
    },
    /sections\.etat\.cards names card secondaire, which the descriptor does not declare/,
  );
  refuse(
    "creature without any card declaration",
    (value) => delete obj(value[EXTENSION], EXTENSION).cards,
    /monstre must declare its cards/,
  );
  refuse(
    "empty card declaration",
    (value) => (obj(value[EXTENSION], EXTENSION).cards = []),
    /monstre\.cards must not be empty/,
  );
  refuse(
    "card declaration with a stray key",
    (value) => (secondaryOf(value).stray = true),
    /monstre\.cards\.1 fields differ/,
  );
  refuse(
    "card declaration of an unknown card",
    (value) => (secondaryOf(value).id = "tertiaire"),
    /monstre\.cards\.1\.id is unknown/,
  );
  refuse(
    "card declared twice",
    (value) => (secondaryOf(value).id = "principal"),
    /monstre\.cards\.1 declares principal twice/,
  );
  refuse(
    "principal card not declared",
    (value) => {
      obj(value[EXTENSION], EXTENSION).cards = cardsOf(value).filter(
        (card) => card.id !== "principal",
      );
    },
    /monstre\.cards must declare the principal card, always printed/,
  );
  refuse(
    "principal card with a condition",
    (value) => (cardsOf(value)[0].existsWhenAny = ["/etats"]),
    /monstre\.cards must declare the principal card, always printed/,
  );
  refuse(
    "card condition without pointer",
    (value) => (secondaryOf(value).existsWhenAny = []),
    /monstre\.cards\.1\.existsWhenAny must not be empty/,
  );
  refuse(
    "card condition that is not a list",
    (value) => (secondaryOf(value).existsWhenAny = "/etats"),
    /monstre\.cards\.1\.existsWhenAny must not be empty/,
  );
  refuse(
    "card condition on a pointer the contract lacks",
    (value) => (secondaryOf(value).existsWhenAny = ["/etats", "/inconnu"]),
    /monstre\.cards\.1\.existsWhenAny \/inconnu references unknown property inconnu/,
  );
  refuse(
    "card condition that repeats a pointer",
    (value) => (secondaryOf(value).existsWhenAny = ["/etats", "/etats"]),
    /monstre\.cards\.1\.existsWhenAny repeats a pointer/,
  );
  for (const target of ["pj", "pnj"] as const) {
    const withCards = clone(schemas.get(target) as Obj);
    obj(withCards[EXTENSION], EXTENSION).cards = [{ id: "principal" }];
    assert.throws(
      () => validatePresentation(withCards, target),
      new RegExp(`${target}\.cards belongs to the creature card`),
    );
  }
  /* Pointers: a root only owns what lies under `<root>/`, not a sibling that shares its prefix. */
  refuse(
    "pointer on a sibling that shares the prefix of a block path",
    (value) => {
      const block = blockNamed(value, "caracteristiques");
      (block.paths as string[]).push("/etats");
      rowsOf(value)[1][0].path = "/etatsPermanents";
    },
    /blocks\.caracteristiques pointer \/etatsPermanents does not descend from a block path/,
  );
  /* Keys: nothing outside the published properties, at each level of the descriptor. */
  refuse(
    "stray key on the descriptor",
    (value) => ((value[EXTENSION] as Obj).stray = true),
    /x-adrenaline-presentation fields differ/,
  );
  refuse(
    "stray key on a section",
    (value) => (sectionNamed(value, "entete").stray = true),
    /sections\.entete fields differ/,
  );
  refuse(
    "stray key on a block",
    (value) => (blockNamed(value, "identification").stray = true),
    /blocks\.identification fields differ/,
  );
  /* Tokens: the creature card draws the badge case, the PNJ card has none. */
  const tokensOf = (value: Obj): Obj =>
    obj(obj(obj(value[EXTENSION], EXTENSION).appearance, "appearance").tokens, "tokens");
  refuse(
    "creature card without its state badge token",
    (value) => delete tokensOf(value).stateBadge,
    /monstre\.appearance\.tokens fields differ/,
  );
  refuse(
    "creature card with a stray token",
    (value) => (tokensOf(value).stray = "--stray"),
    /monstre\.appearance\.tokens fields differ/,
  );
  const badgeTokenOnNpc = clone(schemas.get("pnj") as Obj);
  tokensOf(badgeTokenOnNpc).stateBadge = "--adrenaline-card-badge";
  assert.throws(
    () => validatePresentation(badgeTokenOnNpc, "pnj"),
    /pnj\.appearance\.tokens fields differ/,
  );
  const npc = schemas.get("pnj");
  assert.ok(npc);
  const bareTracks = clone(npc);
  for (const section of sectionsOf(bareTracks))
    for (const block of section.blocks as Obj[])
      if (block.form === "malus-tracks") delete block.decoration;
  assert.throws(() => validatePresentation(bareTracks, "pnj"));
  const cardsOnNpc = clone(npc);
  sectionsOf(cardsOnNpc)[1].cards = ["principal"];
  assert.throws(() => validatePresentation(cardsOnNpc, "pnj"));
  const handwrittenCard = clone(npc);
  obj(obj(handwrittenCard[EXTENSION], EXTENSION).appearance, "appearance").values = {
    align: "end",
    font: "handwritten",
    color: "handwrittenInk",
    renderMaximum: false,
  };
  assert.throws(() => validatePresentation(handwrittenCard, "pnj"));
  const twiceAliased = clone(calloutSource as unknown as Obj) as unknown as Obj[];
  (twiceAliased[1].aliases as string[]).push((twiceAliased[0].aliases as string[])[0]);
  assert.throws(() => validateCallouts(twiceAliased, calloutContract, calloutExample));
  const foreignCapability = clone(calloutSource as unknown as Obj) as unknown as Obj[];
  foreignCapability[0].capability = "style:pbta";
  assert.throws(() => validateCallouts(foreignCapability, calloutContract, calloutExample));
  const undocumented = calloutContract.replace("`adrenaline-encart`", "encart");
  assert.throws(() => validateCallouts(calloutSource, undocumented, calloutExample));
  console.log("✓ presentation validator self-test passed");
}
