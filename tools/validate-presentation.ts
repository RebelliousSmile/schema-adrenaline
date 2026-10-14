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
  "reference-table",
  "location-grid",
  "wound-circles",
  "circle-row",
]);
const PHYSICAL_LOCATIONS = [
  { id: "jambe-droite", label: "Jambe D", range: "1" },
  { id: "jambe-gauche", label: "Jambe G", range: "2" },
  { id: "torse", label: "Torse", range: "3-4" },
  { id: "bras-faible", label: "Bras faible", range: "5-6" },
  { id: "bras-fort", label: "Bras fort", range: "7-8" },
  { id: "tete", label: "Tête", range: "9-0" },
];
const MENTAL_LOCATIONS = [
  { id: "culpabilite", label: "Culpabilité", range: "1" },
  { id: "tristesse", label: "Tristesse", range: "2" },
  { id: "colere", label: "Colère", range: "3-4" },
  { id: "impuissance", label: "Impuissance", range: "5-6" },
  { id: "anxiete", label: "Anxiété", range: "7-8" },
  { id: "peur", label: "Peur", range: "9-0" },
];
/** Positional: the contract key `superficiel` is printed « Léger ». */
const THRESHOLD_LEVELS = [
  { key: "superficiel", label: "Léger", malus: 1 },
  { key: "leger", label: "Modéré", malus: 2 },
  { key: "grave", label: "Grave", malus: 3 },
  { key: "profond", label: "Profond", malus: 4 },
];
/** Fixed texts of the player sheet, by block. */
const PJ_NOTES: Record<string, string[]> = {
  "formations-competences": ["Compétence de substitution : malus de -10 %"],
  "caracteristiques-physiques": ["Marcher (qualité de RAP) ; Courir (Marcher × 3)"],
  "total-malus": ["1 malus = -10 %"],
};

/** Block id of the decorations that name a side: the decoration must match the block it sits on. */
const PJ_SIDES: Record<string, "physical" | "mental"> = {
  "blessures-physiques": "physical",
  "blessures-mentales": "mental",
  "protections-physiques": "physical",
  "protections-mentales": "mental",
};

/** The paths a PJ block reads, by block id: a side is bound to what the block reads, not to its id only. */
const PJ_PATHS: Record<string, string[]> = {
  "blessures-physiques": ["/etatDePartie/blessures/physiques"],
  "blessures-mentales": ["/etatDePartie/blessures/mentales"],
  "protections-physiques": ["/protections/physiques"],
  "protections-mentales": ["/protections/mentales"],
  divers: ["/etatDePartie/malus/divers", "/etatDePartie/malus/diversCercles"],
};

/** The decoration the player sheet draws on a block, by block id: it is required, not merely allowed. */
const PJ_DECORATIONS: Record<string, string> = {
  stress: "dice-options",
  divers: "circle-row",
  "blessures-physiques": "wound-circles",
  "blessures-mentales": "wound-circles",
  "protections-physiques": "location-grid",
  "protections-mentales": "location-grid",
};

/** A form whose decoration has the same name: the one never goes without the other. */
const FORM_DECORATIONS = new Set(["location-grid", "wound-circles", "circle-row"]);

/** The printed label and the section of the PJ blocks whose place is a decision of the sheet. */
const PJ_PLACES: Record<string, { label: string; section: string }> = {
  "armes-sociales": { label: "Armes sociales", section: "equipement" },
  "blessures-physiques": { label: "Blessures physiques", section: "sante" },
  "blessures-mentales": { label: "Blessures mentales", section: "sante" },
  contraintes: { label: "Contraintes", section: "identite" },
};

/** The three lines of the constraints block: path and printed label, in order. */
const PJ_CONSTRAINT_ROWS = [
  [{ path: "/identite/contraintes/professionnelles", label: "Professionnelles" }],
  [{ path: "/identite/contraintes/familiales", label: "Familiales" }],
  [{ path: "/identite/contraintes/engagementsExterieurs", label: "Engagements extérieurs" }],
];

/** The identity fields the PJ prints in their own blocks, so the fields grid leaves them out. */
const PJ_IDENTITY_SIBLINGS = ["contraintes", "historique", "personnalite"];

/** The fixed table of the social weapons, as the sheet prints it: text and order. */
const SOCIAL_WEAPONS_TABLE = {
  columns: ["Armes sociales", "Propriétés"],
  lines: [
    { name: "Bluff", properties: "Inf." },
    { name: "Intimidation", properties: "Inf., Ét. sans issue (2d10)" },
    { name: "Manipulation", properties: "Inf." },
    { name: "Négociation", properties: "Négo. situation diff. (2d10)" },
    { name: "Persuasion", properties: "Inf. insoluble (2d10)" },
    {
      name: "Provocation",
      properties: "Inf., Loc. Colère, Étourd.",
    },
    { name: "Séduction", properties: "Séd. loyal/amoureux (2d10)" },
  ],
  legend: [
    { dice: "Xd10", nature: "choquante", meaning: "dégâts des armes ayant la propriété Choquante" },
    { dice: "Xd10", nature: "blessante", meaning: "dégâts des armes ayant la propriété Blessante" },
  ],
};

/** The fixed table of the social weapons: two columns, seven lines, no dice column; the legend is wording for editors, not printed. */
function referenceTable(value: unknown, where: string): void {
  const table = obj(value, where);
  keys(table, ["columns", "lines", "legend"], where);
  assert.deepEqual(
    table.columns,
    SOCIAL_WEAPONS_TABLE.columns,
    `${where}.columns differ from the sheet`,
  );
  assert.ok(Array.isArray(table.lines), `${where}.lines must be a list`);
  assert.equal(table.lines.length, 7, `${where} must print seven lines`);
  table.lines.forEach((raw: unknown, i: number) => {
    const line = obj(raw, `${where}.lines.${i}`);
    const name = typeof line.name === "string" ? line.name : `#${i}`;
    keys(line, ["name", "properties"], `${where}.lines.${name}`);
    assert.ok(name.length > 0, `${where}.lines.${i} needs a name`);
    assert.ok(
      typeof line.properties === "string" && line.properties.length > 0,
      `${where}.lines.${name} needs its properties`,
    );
  });
  assert.deepEqual(
    (table.lines as Obj[]).map((line) => line.name),
    SOCIAL_WEAPONS_TABLE.lines.map((line) => line.name),
    `${where}.lines are not the seven social weapons of the sheet, in order`,
  );
  table.lines.forEach((raw: unknown, i: number) => {
    const expected = SOCIAL_WEAPONS_TABLE.lines[i];
    const line = obj(raw, `${where}.lines.${i}`);
    assert.equal(
      line.properties,
      expected.properties,
      `${where}.lines.${expected.name} properties differ from the sheet`,
    );
  });
  assert.deepEqual(
    table.legend,
    SOCIAL_WEAPONS_TABLE.legend,
    `${where}.legend differs from the sheet: choquante then blessante, as worded`,
  );
}
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
    assert.deepEqual(
      visual.sectionTitles,
      { align: "start", font: "heading" },
      `${where}.sectionTitles must start-align on the compact card`,
    );
    assert.deepEqual(
      visual.values,
      {
        align: "end",
        font: "body",
        color: "ink",
        renderMaximum: false,
      },
      `${where}.values must be typeset on the compact card`,
    );
  } else {
    assert.deepEqual(
      visual.sectionTitles,
      { align: "center", font: "heading" },
      `${where}.sectionTitles must be centred on the paper sheet`,
    );
    assert.deepEqual(
      visual.values,
      {
        align: "end",
        font: "handwritten",
        color: "handwrittenInk",
        renderMaximum: false,
      },
      `${where}.values must be handwritten on the paper sheet`,
    );
  }
}

function decoration(value: unknown, where: string): void {
  const rule = obj(value, where);
  switch (rule.kind) {
    case "dice-options":
      keys(rule, ["kind", "favorable", "defavorable"], where);
      assert.deepEqual(rule.favorable, ["+1d100", "+2d100"]);
      assert.deepEqual(rule.defavorable, ["+1d100", "+2d100"]);
      break;
    case "circle-groups":
      keys(rule, ["kind", "groups"], where);
      assert.deepEqual(rule.groups, [{ key: "rounds", label: "ROUND", count: 5, shape: "round" }]);
      break;
    case "scale":
      keys(rule, ["kind", "from", "to", "last"], where);
      assert.equal(rule.from, 1);
      assert.equal(rule.to, 9);
      assert.equal(rule.last, "HS");
      break;
    case "circle-row":
      keys(rule, ["kind", "count"], where);
      assert.equal(rule.count, 4);
      break;
    case "location-grid":
      keys(rule, ["kind", "side", "unit", "boxes", "locations"], where);
      assert.ok(rule.side === "physical" || rule.side === "mental", `${where}.side is unknown`);
      assert.equal(
        rule.unit,
        rule.side === "physical" ? "PP" : "PM",
        `${where}.unit must be ${rule.side === "physical" ? "PP" : "PM"}, the unit of the ${String(rule.side)} side`,
      );
      assert.equal(rule.boxes, 3, `${where}.boxes must be three per location`);
      assert.deepEqual(
        rule.locations,
        rule.side === "physical" ? PHYSICAL_LOCATIONS : MENTAL_LOCATIONS,
        `${where}.locations differ from the six locations and their d10 ranges`,
      );
      break;
    case "wound-circles":
      keys(rule, ["kind", "side", "durations", "columns", "circles"], where);
      assert.ok(rule.side === "physical" || rule.side === "mental", `${where}.side is unknown`);
      assert.deepEqual(rule.durations, ["heure", "jour", "semaine", "mois"]);
      assert.deepEqual(rule.columns, [{ key: "premiereColonne" }, { key: "secondeColonne" }]);
      assert.equal(rule.circles, 1, `${where}.circles must be one circle per duration`);
      break;
    case "weapon-die":
      keys(rule, ["kind", "label"], where);
      assert.equal(rule.label, "d10");
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
      keys(
        obj(rule.current, `${where}.current`),
        ["path", "cards", "position"],
        `${where}.current`,
      );
      assert.equal(
        obj(rule.current, `${where}.current`).position,
        "end",
        `${where}.current.position must be end`,
      );
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
  assert.equal(
    descriptor.capability,
    `block:adrenaline-${target}`,
    `${target}.capability must be block:adrenaline-${target}`,
  );
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
  const siblingPaths = sectionList.flatMap((section) =>
    entries(section.blocks, `${target}.sections.${section.id}.blocks`).flatMap(
      (block) => block.paths as string[],
    ),
  );
  const forms = new Map<string, string>();
  const sectionOf = new Map<string, string>();
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
          ...(block.subtitlePaths === undefined ? [] : ["subtitlePaths"]),
          ...(block.valueSuffix === undefined ? [] : ["valueSuffix"]),
          ...(block.formationFields === undefined ? [] : ["formationFields"]),
          ...(block.formationTypes === undefined ? [] : ["formationTypes"]),
          ...(block.placement === undefined ? [] : ["placement"]),
          ...(block.fieldRows === undefined ? [] : ["fieldRows"]),
          ...(block.pointerRows === undefined ? [] : ["pointerRows"]),
          ...(block.cards === undefined ? [] : ["cards"]),
          ...(block.decoration === undefined ? [] : ["decoration"]),
          ...(block.referenceTable === undefined ? [] : ["referenceTable"]),
          ...(block.thresholdLevels === undefined ? [] : ["thresholdLevels"]),
          ...(block.notes === undefined ? [] : ["notes"]),
          ...(block.minimumRows === undefined ? [] : ["minimumRows"]),
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
        assert.deepEqual(
          block.rangeDisplay,
          ["current"],
          `${blockWhere}.rangeDisplay must print the current value only`,
        );
      }
      assert.ok(
        !(target === "pj" && block.form === "characteristic-rows") ||
          block.rangeDisplay !== undefined,
        `${blockWhere}.rangeDisplay must be published: the player sheet prints the current value only`,
      );
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
      if (block.subtitlePaths !== undefined) {
        assert.ok(
          block.form === "name-card" || block.form === "game-parameters",
          `${blockWhere}.subtitlePaths needs a name card or game parameters`,
        );
        assert.ok(
          Array.isArray(block.subtitlePaths) && block.subtitlePaths.length > 0,
          `${blockWhere}.subtitlePaths must not be empty`,
        );
        assert.equal(
          new Set(block.subtitlePaths).size,
          block.subtitlePaths.length,
          `${blockWhere}.subtitlePaths repeat`,
        );
        for (const pointer of block.subtitlePaths as string[]) {
          nodeAt(schema, pointer, `${blockWhere}.subtitlePaths`);
          assert.ok(
            (block.paths as string[]).includes(pointer),
            `${blockWhere}.subtitlePaths ${pointer} is not among the block paths`,
          );
        }
      }
      if (block.fieldRows !== undefined) {
        assert.equal(
          block.form,
          "identity-fields",
          `${blockWhere}.fieldRows needs identity fields`,
        );
        const paths = block.paths as string[];
        assert.equal(paths.length, 1, `${blockWhere}.fieldRows needs one path`);
        // Only the player sheet prints identity fields in blocks of their own (the constraints,
        // the history, the personality): those are not part of its grid. Elsewhere every field is.
        const fields = Object.fromEntries(
          Object.entries(
            obj(nodeAt(schema, paths[0], blockWhere).node.properties, blockWhere),
          ).filter(
            ([name]) =>
              !(
                target === "pj" &&
                PJ_IDENTITY_SIBLINGS.includes(name) &&
                siblingPaths.includes(`${paths[0]}/${name}`)
              ),
          ),
        );
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
      sectionOf.set(block.id as string, String(section.id));
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
      // A decoration that names a side belongs to the block of that side, not to the other.
      // The side is judged first: the rules of the decoration itself come after.
      if (target === "pj" && Object.hasOwn(PJ_SIDES, block.id as string)) {
        assert.equal(
          obj(block.decoration, `${blockWhere}.decoration`).side,
          PJ_SIDES[block.id as string],
          `${blockWhere}.decoration.side must be ${PJ_SIDES[block.id as string]}, the side of the block`,
        );
      }
      // The side is bound to what the block reads, not to its id only.
      if (target === "pj" && Object.hasOwn(PJ_PATHS, block.id as string))
        assert.deepEqual(
          block.paths,
          PJ_PATHS[block.id as string],
          `${blockWhere} must read ${PJ_PATHS[block.id as string].join(" and ")}`,
        );
      // A form and its decoration of the same name never go without each other.
      const decorationKind =
        block.decoration === undefined ? undefined : obj(block.decoration, blockWhere).kind;
      if (FORM_DECORATIONS.has(block.form as string))
        assert.equal(
          decorationKind,
          block.form,
          `${blockWhere} form ${String(block.form)} needs its ${String(block.form)} decoration`,
        );
      if (FORM_DECORATIONS.has(decorationKind as string))
        assert.equal(
          block.form,
          decorationKind,
          `${blockWhere}.decoration ${String(decorationKind)} needs a ${String(decorationKind)} block`,
        );
      if (target === "pj" && Object.hasOwn(PJ_DECORATIONS, block.id as string))
        assert.equal(
          decorationKind,
          PJ_DECORATIONS[block.id as string],
          `${blockWhere}.decoration must be published as ${PJ_DECORATIONS[block.id as string]}: the player sheet draws it`,
        );
      if (block.decoration !== undefined) decoration(block.decoration, `${blockWhere}.decoration`);
      // What the wound circles print is what the schema declares: its durations and its columns.
      if (decorationKind === "wound-circles") {
        const rule = obj(block.decoration, blockWhere);
        const woundPaths = block.paths as string[];
        assert.equal(woundPaths.length, 1, `${blockWhere} wound circles need one path`);
        const side = obj(nodeAt(schema, woundPaths[0], blockWhere).node.properties, blockWhere);
        assert.deepEqual(
          (rule.columns as Obj[]).map((column) => column.key),
          Object.keys(side),
          `${blockWhere}.decoration.columns differ from the columns the schema declares`,
        );
        for (const [column, node] of Object.entries(side)) {
          const columnProperties = obj(obj(node, `${blockWhere}/${column}`).properties, blockWhere);
          // `notes` is the writing area under the circles, not a duration.
          assert.equal(
            obj(columnProperties.notes, `${blockWhere}/${column}/notes`).type,
            "string",
            `${blockWhere}/${column}/notes must be the free writing area (string)`,
          );
          const durations = Object.fromEntries(
            Object.entries(columnProperties).filter(([key]) => key !== "notes"),
          ) as Obj;
          assert.deepEqual(
            rule.durations,
            Object.keys(durations),
            `${blockWhere}.decoration.durations differ from the durations the schema declares in ${column}`,
          );
          for (const [duration, circle] of Object.entries(durations))
            assert.equal(
              obj(circle, `${blockWhere}/${column}/${duration}`).type,
              "boolean",
              `${blockWhere}/${column}/${duration} must be a ticked or unticked circle (boolean)`,
            );
        }
      }
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
      if (block.form === "reference-table") {
        assert.equal(target, "pj", `${blockWhere} reference table belongs to the player sheet`);
        assert.deepEqual(
          block.paths,
          ["/equipement/armesSocialesBarrees"],
          `${blockWhere} reads only the list of the weapons struck out: its table is fixed`,
        );
        referenceTable(block.referenceTable, `${blockWhere}.referenceTable`);
      } else {
        assert.equal(
          block.referenceTable,
          undefined,
          `${blockWhere}.referenceTable needs a reference table`,
        );
        assert.ok(
          Array.isArray(block.paths) && block.paths.length > 0,
          `${blockWhere}.paths must not be empty`,
        );
      }
      if (block.thresholdLevels !== undefined) {
        assert.equal(target, "pj", `${blockWhere}.thresholdLevels belongs to the player sheet`);
        assert.equal(
          block.form,
          "threshold-rows",
          `${blockWhere}.thresholdLevels needs threshold rows`,
        );
        assert.deepEqual(
          block.thresholdLevels,
          THRESHOLD_LEVELS,
          `${blockWhere}.thresholdLevels differ from the sheet labels and malus count`,
        );
      } else
        assert.ok(
          !(target === "pj" && block.form === "threshold-rows"),
          `${blockWhere} must publish its threshold levels`,
        );
      if (block.notes !== undefined) {
        assert.equal(target, "pj", `${blockWhere}.notes belongs to the player sheet`);
        assert.deepEqual(
          block.notes,
          PJ_NOTES[block.id as string],
          `${blockWhere}.notes differ from the fixed texts of the sheet`,
        );
      }
      const ruledForm = block.form === "ruled-list" || block.form === "weapon-lines";
      if (block.minimumRows !== undefined) {
        assert.equal(target, "pj", `${blockWhere}.minimumRows belongs to the player sheet`);
        assert.ok(ruledForm, `${blockWhere}.minimumRows needs a ruled list or weapon lines`);
        assert.ok(
          Number.isInteger(block.minimumRows) && Number(block.minimumRows) >= 1,
          `${blockWhere}.minimumRows must be an integer of at least 1`,
        );
      } else
        assert.ok(
          !(target === "pj" && ruledForm),
          `${blockWhere} must publish its minimum printed rows`,
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
      "avantages-immunites": "ruled-list",
      "protections-physiques": "location-grid",
      "protections-mentales": "location-grid",
      "armes-sociales": "reference-table",
      contraintes: "compact-rows",
      historique: "narrative",
      personnalite: "narrative",
      "blessures-physiques": "wound-circles",
      "blessures-mentales": "wound-circles",
      stress: "stress-dice",
      "seuils-physiques": "threshold-rows",
      "seuils-mentaux": "threshold-rows",
      choc: "shock-circles",
      divers: "circle-row",
      "etats-encaisses": "status-frames",
      "total-malus": "malus-scale",
    }))
      assert.equal(forms.get(id), expectedForm, `${target}.${id} has wrong form`);
    const noted = sectionList.flatMap((section) =>
      entries(section.blocks, `${target}.sections.${section.id}.blocks`)
        .filter((block) => block.notes !== undefined)
        .map((block) => block.id),
    );
    assert.deepEqual(noted.sort(), Object.keys(PJ_NOTES).sort(), `${target} fixed texts missing`);
    // The places the sheet decides: printed label and section of a block, the lines of the constraints.
    for (const [id, place] of Object.entries(PJ_PLACES)) {
      assert.equal(
        blockOf(sectionList, id).label,
        place.label,
        `${target}.${id}.label must be « ${place.label} »`,
      );
      assert.equal(
        sectionOf.get(id),
        place.section,
        `${target}.${id} must sit in the ${place.section} section`,
      );
    }
    assert.deepEqual(
      blockOf(sectionList, "contraintes").pointerRows,
      PJ_CONSTRAINT_ROWS,
      `${target}.contraintes must print the three lines of the sheet, with their labels`,
    );
    // One reference table, the social weapons: a second one, under another id, is not the sheet's.
    assert.deepEqual(
      [...forms.entries()].filter(([, form]) => form === "reference-table").map(([id]) => id),
      ["armes-sociales"],
      `${target} must print one reference table, the social weapons (block armes-sociales)`,
    );
    // The scenario is the third line of the game parameters: its path and its printed label.
    const parameters = blockOf(sectionList, "parametres-jeu");
    const scenarioAt = (parameters.paths as string[]).indexOf("/parametresDuJeu/scenario");
    assert.ok(scenarioAt >= 0, `${target}.parametres-jeu must read /parametresDuJeu/scenario`);
    assert.equal(
      (parameters.rowLabels as string[])[scenarioAt],
      "Scénario",
      `${target}.parametres-jeu must label the scenario line « Scénario »`,
    );
    assert.equal(
      scenarioAt,
      (parameters.paths as string[]).indexOf("/parametresDuJeu/typeDeScenario") + 1,
      `${target}.parametres-jeu must print the scenario line right after the scenario format`,
    );
    assert.equal(
      scenarioAt,
      3,
      `${target}.parametres-jeu must print the scenario as its fourth line`,
    );
    // The stress dice sit with the characteristics, read from the stress counters.
    const stressDice = entries(
      obj(
        sectionList.find((section) => section.id === "caracteristique"),
        `${target}.sections.caracteristique`,
      ).blocks,
      `${target}.sections.caracteristique.blocks`,
    ).find((block) => block.id === "stress");
    assert.ok(
      stressDice,
      `${target}.sections.caracteristique must hold the stress dice block, with the characteristics`,
    );
    assert.equal(stressDice.form, "stress-dice", `${target}.stress must be the stress dice`);
    assert.deepEqual(
      stressDice.paths,
      ["/etatDePartie/stress"],
      `${target}.stress must read /etatDePartie/stress`,
    );
    const identity = sectionList.find((section) => section.id === "identite");
    assert.ok(identity, `${target} needs its identity section`);
    assert.equal(identity.collapsible, true, `${target} identity section must be foldable`);
    assert.equal(identity.row, undefined, `${target} identity section sits in no row`);
    assert.equal(
      identity,
      sectionList[sectionList.length - 1],
      `${target} identity section comes last`,
    );
    for (const name of ["for", "con", "dex", "rap", "log", "vol", "per", "cha"]) {
      const numericField: Obj = nodeAt(
        schema,
        `/caracteristiques/${name}`,
        `${target}.${name}`,
      ).node;
      assert.equal(numericField.type, "integer", `${target}.${name} must be a plain number`);
      assert.equal(numericField.maximum, 50, `${target}.${name} must be capped at 50`);
    }
    const shockRounds: Obj = nodeAt(
      schema,
      "/etatDePartie/malus/choc/rounds",
      `${target}.malus.choc.rounds`,
    ).node;
    assert.equal(shockRounds.minimum, 0);
    assert.equal(shockRounds.maximum, 5);
    // The sheet prints no « hour » circle: the PJ shock box carries no `heures`.
    assert.equal(
      (nodeAt(schema, "/etatDePartie/malus/choc", `${target}.malus.choc`).node.properties as Obj)
        ?.heures,
      undefined,
      `${target}.malus.choc must not carry heures`,
    );
    const total: Obj = nodeAt(schema, "/etatDePartie/malus/total", `${target}.malus.total`).node;
    assert.equal(total.minimum, 0);
    assert.equal(total.maximum, 10, `${target}.malus.total must stop at 10, the HS state`);
  }
  if (target === "monstre" || target === "pnj") {
    // Creature and NPC accept a plain number or a triplet everywhere: a strict triplet
    // (an object with minimum, current and maximum) outside an anyOf with a number is a
    // value the player rule leaked into.
    const strictPaths: string[] = [];
    const walk = (node: unknown, path: string, offersNumber: boolean): void => {
      if (Array.isArray(node)) {
        node.forEach((item, index) => walk(item, `${path}[${index}]`, offersNumber));
        return;
      }
      if (node === null || typeof node !== "object") return;
      const record = node as Obj;
      const props = record.properties as Obj | undefined;
      if (
        record.type === "object" &&
        props &&
        ["minimum", "current", "maximum"].every((key) => key in props) &&
        !offersNumber
      )
        strictPaths.push(path);
      for (const [key, child] of Object.entries(record)) {
        const branches = Array.isArray(child) ? (child as Obj[]) : [];
        const offers =
          (key === "anyOf" || key === "oneOf") &&
          branches.some((branch) => branch.type === "integer" || branch.type === "number");
        walk(child, `${path}/${key}`, offers);
      }
    };
    walk(schema, "", false);
    assert.deepEqual(
      strictPaths,
      [],
      `${target} must not carry a strict triplet outside a number-or-triplet choice`,
    );
  }
  if (target === "monstre") {
    // A creature value is either a plain number or the triplet: both branches must allow
    // values above 50.
    const value: Obj = nodeAt(schema, "/caracteristiques/for", `${target}.for`).node;
    const branches = value.anyOf as Obj[];
    assert.ok(
      Array.isArray(branches) && branches.length === 2,
      `${target}.for must offer two forms`,
    );
    const plain = branches.find((branch) => branch.type === "integer");
    const triplet = branches.find((branch) => branch.type === "object");
    assert.ok(plain && triplet, `${target}.for must be a number or a triplet`);
    const current = obj(obj(triplet.properties, "monstre.for.properties").current, "for.current");
    for (const numericField of [plain, current])
      assert.ok(
        Number(numericField.maximum) >= 70,
        "monster characteristics must allow values above 50",
      );
  }
}

function blockOf(sectionList: Obj[], id: string): Obj {
  const found = sectionList
    .flatMap((section) => section.blocks as Obj[])
    .find((block) => block.id === id);
  assert.ok(found, `block ${id} is missing`);
  return found;
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
  assert.throws(
    () => validatePresentation(wrongCapability, "pj"),
    /pj\.capability must be block:adrenaline-pj/,
  );
  const unknownPath = clone(source);
  const firstSection = (obj(unknownPath[EXTENSION], EXTENSION).sections as Obj[])[0];
  const firstBlock = (firstSection.blocks as Obj[])[0];
  (firstBlock.paths as string[])[0] = "/inconnu";
  assert.throws(
    () => validatePresentation(unknownPath, "pj"),
    /references unknown property inconnu/,
  );
  const duplicatePath = clone(source);
  const duplicateSection = (obj(duplicatePath[EXTENSION], EXTENSION).sections as Obj[])[0];
  const duplicateBlock = (duplicateSection.blocks as Obj[])[0];
  (duplicateBlock.paths as string[]).push((duplicateBlock.paths as string[])[0]);
  assert.throws(() => validatePresentation(duplicatePath, "pj"), /pj paths must be unique/);
  const missingStyle = clone(source);
  const visual = obj(obj(missingStyle[EXTENSION], EXTENSION).appearance, "appearance");
  const tokens = obj(visual.tokens, "tokens");
  tokens.handwrittenInk = "--missing-written-ink";
  assert.throws(
    () => validatePresentation(missingStyle, "pj"),
    /token --missing-written-ink missing in light/,
  );
  const wrongBound = clone(source);
  const bound: Obj = nodeAt(wrongBound, "/caracteristiques/for", "for").node;
  bound.maximum = 200;
  assert.throws(() => validatePresentation(wrongBound, "pj"), /pj\.for must be capped at 50/);
  const sectionsOf = (value: Obj) => obj(value[EXTENSION], EXTENSION).sections as Obj[];
  const tooWide = clone(source);
  const wideSections = sectionsOf(tooWide);
  const wideAt = wideSections.findIndex((section) => section.row);
  wideSections[wideAt + 1].row = { id: obj(wideSections[wideAt].row, "row").id, span: 1 };
  assert.throws(
    () => validatePresentation(tooWide, "pj"),
    /sections\.equipement\.row exceeds the sheet width/,
  );
  const splitRow = clone(source);
  const lastSection = sectionsOf(splitRow)[sectionsOf(splitRow).length - 1];
  lastSection.row = { id: "profil", span: 1 };
  assert.throws(
    () => validatePresentation(splitRow, "pj"),
    /sections\.identite\.row must follow its row/,
  );
  const missingField = clone(source);
  for (const section of sectionsOf(missingField))
    for (const block of section.blocks as Obj[])
      if (block.fieldRows) (block.fieldRows as string[][]).pop();
  assert.throws(
    () => validatePresentation(missingField, "pj"),
    /fieldRows must name each field once/,
  );
  const missingType = clone(source);
  for (const section of sectionsOf(missingType))
    for (const block of section.blocks as Obj[])
      if (block.formationTypes) (block.formationTypes as string[]).pop();
  assert.throws(
    () => validatePresentation(missingType, "pj"),
    /formationTypes must print every published formation type, in order/,
  );
  const pjBlocks = (value: Obj) => sectionsOf(value).flatMap((section) => section.blocks as Obj[]);
  const findBlock = (value: Obj, id: string) => {
    const block = pjBlocks(value).find((candidate) => candidate.id === id);
    assert.ok(block, `self-test: block ${id}`);
    return block;
  };
  const sixLines = clone(source);
  (obj(findBlock(sixLines, "armes-sociales").referenceTable, "table").lines as Obj[]).pop();
  assert.throws(() => validatePresentation(sixLines, "pj"), /seven lines/);
  const tablePath = clone(source);
  findBlock(tablePath, "armes-sociales").paths = ["/equipement/armesPhysiques"];
  assert.throws(
    () => validatePresentation(tablePath, "pj"),
    /armes-sociales reads only the list of the weapons struck out/,
  );
  const wrongLevels = clone(source);
  (findBlock(wrongLevels, "seuils-physiques").thresholdLevels as string[]).reverse();
  assert.throws(
    () => validatePresentation(wrongLevels, "pj"),
    /seuils-physiques\.thresholdLevels differ from the sheet labels and malus count/,
  );
  const noLevels = clone(source);
  delete findBlock(noLevels, "seuils-mentaux").thresholdLevels;
  assert.throws(
    () => validatePresentation(noLevels, "pj"),
    /seuils-mentaux must publish its threshold levels/,
  );
  const wrongNote = clone(source);
  findBlock(wrongNote, "total-malus").notes = ["1 malus = -5 %"];
  assert.throws(
    () => validatePresentation(wrongNote, "pj"),
    /total-malus\.notes differ from the fixed texts of the sheet/,
  );
  const noRows = clone(source);
  delete findBlock(noRows, "possessions").minimumRows;
  assert.throws(
    () => validatePresentation(noRows, "pj"),
    /possessions must publish its minimum printed rows/,
  );
  for (const bad of [0, 2.5, "7"]) {
    const badRows = clone(source);
    findBlock(badRows, "armes-physiques").minimumRows = bad;
    assert.throws(
      () => validatePresentation(badRows, "pj"),
      /armes-physiques\.minimumRows must be an integer of at least 1/,
    );
  }
  const rowsOnForm = clone(source);
  findBlock(rowsOnForm, "seuils-physiques").minimumRows = 4;
  assert.throws(
    () => validatePresentation(rowsOnForm, "pj"),
    /seuils-physiques\.minimumRows needs a ruled list or weapon lines/,
  );
  const rowsOnPnj = clone(schemas.get("pnj") as Obj);
  pjBlocks(rowsOnPnj)[0].minimumRows = 4;
  assert.throws(
    () => validatePresentation(rowsOnPnj, "pnj"),
    /minimumRows belongs to the player sheet/,
  );
  const unfoldedIdentity = clone(source);
  delete sectionsOf(unfoldedIdentity).find((section) => section.id === "identite")?.collapsible;
  assert.throws(
    () => validatePresentation(unfoldedIdentity, "pj"),
    /pj identity section must be foldable/,
  );
  const identityFirst = clone(source);
  const identitySections = sectionsOf(identityFirst);
  const movedIdentity = identitySections.splice(identitySections.length - 1, 1)[0];
  movedIdentity.order = 5;
  identitySections.unshift(movedIdentity);
  assert.throws(() => validatePresentation(identityFirst, "pj"), /pj identity section comes last/);
  const wrongGrid = clone(source);
  const grid = obj(findBlock(wrongGrid, "protections-physiques").decoration, "decoration");
  (grid.locations as Obj[])[0].range = "1-2";
  assert.throws(
    () => validatePresentation(wrongGrid, "pj"),
    /protections-physiques\.decoration\.locations differ from the six locations and their d10 ranges/,
  );
  /* The social weapons table: every printed text is pinned, not only its shape. */
  const tableOf = (value: Obj): Obj =>
    obj(findBlock(value, "armes-sociales").referenceTable, "table");
  const refuseTable = (name: string, mutate: (table: Obj) => void, message: RegExp): void => {
    const mutated = clone(source);
    mutate(tableOf(mutated));
    assert.throws(() => validatePresentation(mutated, "pj"), message, name);
  };
  refuseTable(
    "weapon renamed",
    (table) => ((table.lines as Obj[])[0].name = "Baratin"),
    /lines are not the seven social weapons of the sheet, in order/,
  );
  refuseTable(
    "property changed",
    (table) => ((table.lines as Obj[])[2].properties = "Inf., Ét."),
    /lines\.Manipulation properties differ from the sheet/,
  );
  refuseTable(
    "lines reversed",
    (table) => (table.lines as Obj[]).reverse(),
    /lines are not the seven social weapons of the sheet, in order/,
  );
  refuseTable(
    "legend meanings swapped",
    (table) => {
      const legend = table.legend as Obj[];
      [legend[0].meaning, legend[1].meaning] = [legend[1].meaning, legend[0].meaning];
    },
    /legend differs from the sheet/,
  );
  refuseTable(
    "column renamed",
    (table) => ((table.columns as string[])[1] = "Dommages"),
    /referenceTable\.columns differ from the sheet/,
  );
  /* A decoration that names a side belongs to the block of that side. */
  const wrongSide = clone(source);
  obj(findBlock(wrongSide, "blessures-physiques").decoration, "decoration").side = "mental";
  assert.throws(
    () => validatePresentation(wrongSide, "pj"),
    /blessures-physiques\.decoration\.side must be physical, the side of the block/,
  );
  const woundSideMental = clone(source);
  obj(findBlock(woundSideMental, "blessures-mentales").decoration, "decoration").side = "physical";
  assert.throws(
    () => validatePresentation(woundSideMental, "pj"),
    /blessures-mentales\.decoration\.side must be mental, the side of the block/,
  );
  const mentalGridOnPhysical = clone(source);
  findBlock(mentalGridOnPhysical, "protections-physiques").decoration = clone(
    findBlock(source, "protections-mentales").decoration,
  );
  assert.throws(
    () => validatePresentation(mentalGridOnPhysical, "pj"),
    /protections-physiques\.decoration\.side must be physical, the side of the block/,
  );
  const physicalGridOnMental = clone(source);
  findBlock(physicalGridOnMental, "protections-mentales").decoration = clone(
    findBlock(source, "protections-physiques").decoration,
  );
  assert.throws(
    () => validatePresentation(physicalGridOnMental, "pj"),
    /protections-mentales\.decoration\.side must be mental, the side of the block/,
  );
  const crowdedWounds = clone(source);
  obj(findBlock(crowdedWounds, "blessures-mentales").decoration, "decoration").circles = 4;
  assert.throws(
    () => validatePresentation(crowdedWounds, "pj"),
    /blessures-mentales\.decoration\.circles must be one circle per duration/,
  );
  /* One refusal per rule on the player sheet: the mutation must fail with the rule's own message. */
  const refusePj = (name: string, mutate: (value: Obj) => void, message: RegExp): void => {
    const mutated = clone(source);
    mutate(mutated);
    assert.throws(() => validatePresentation(mutated, "pj"), message, name);
  };
  const decorationOf = (value: Obj, id: string): Obj =>
    obj(findBlock(value, id).decoration, `${id}.decoration`);
  const woundSide = (value: Obj, side: "physiques" | "mentales"): Obj => {
    const state = obj(obj(value.properties, "properties").etatDePartie, "etatDePartie");
    const wounds = obj(obj(state.properties, "etatDePartie.properties").blessures, "blessures");
    return obj(obj(wounds.properties, "blessures.properties")[side], side);
  };
  const woundColumn = (value: Obj, side: "physiques" | "mentales", column: string): Obj =>
    obj(obj(woundSide(value, side).properties, `${side}.properties`)[column], column);
  /* A side is bound to what the block reads, not to its id only. */
  refusePj(
    "wound paths swapped",
    (value) => {
      const physical = findBlock(value, "blessures-physiques");
      const mental = findBlock(value, "blessures-mentales");
      [physical.paths, mental.paths] = [mental.paths, physical.paths];
    },
    /blessures-physiques must read \/etatDePartie\/blessures\/physiques/,
  );
  refusePj(
    "physical wounds read the parent",
    (value) => (findBlock(value, "blessures-physiques").paths = ["/etatDePartie/blessures"]),
    /blessures-physiques must read \/etatDePartie\/blessures\/physiques/,
  );
  refusePj(
    "mental wounds read the parent",
    (value) => (findBlock(value, "blessures-mentales").paths = ["/etatDePartie/blessures"]),
    /blessures-mentales must read \/etatDePartie\/blessures\/mentales/,
  );
  refusePj(
    "protection paths swapped",
    (value) => {
      const physical = findBlock(value, "protections-physiques");
      const mental = findBlock(value, "protections-mentales");
      [physical.paths, mental.paths] = [mental.paths, physical.paths];
    },
    /protections-physiques must read \/protections\/physiques/,
  );
  refusePj(
    "divers loses its text path",
    (value) => (findBlock(value, "divers").paths = ["/etatDePartie/malus/diversCercles"]),
    /divers must read \/etatDePartie\/malus\/divers and \/etatDePartie\/malus\/diversCercles/,
  );
  refusePj(
    "divers loses its counter path",
    (value) => (findBlock(value, "divers").paths = ["/etatDePartie/malus/divers"]),
    /divers must read \/etatDePartie\/malus\/divers and \/etatDePartie\/malus\/diversCercles/,
  );
  /* A form and its decoration of the same name never go without each other. */
  refusePj(
    "wound circles on a location grid block",
    (value) =>
      (findBlock(value, "protections-physiques").decoration = clone(
        decorationOf(source, "blessures-physiques"),
      )),
    /protections-physiques form location-grid needs its location-grid decoration/,
  );
  refusePj(
    "location grid on a wound circles block",
    (value) =>
      (findBlock(value, "blessures-physiques").decoration = clone(
        decorationOf(source, "protections-physiques"),
      )),
    /blessures-physiques form wound-circles needs its wound-circles decoration/,
  );
  refusePj(
    "wound circles on divers",
    (value) =>
      (findBlock(value, "divers").decoration = clone(decorationOf(source, "blessures-physiques"))),
    /divers form circle-row needs its circle-row decoration/,
  );
  refusePj(
    "divers loses its four circles",
    (value) => delete findBlock(value, "divers").decoration,
    /divers form circle-row needs its circle-row decoration/,
  );
  refusePj(
    "divers turned into a wound block",
    (value) => {
      const divers = findBlock(value, "divers");
      divers.form = "wound-circles";
      divers.decoration = clone(decorationOf(source, "blessures-physiques"));
    },
    /divers\.decoration must be published as circle-row: the player sheet draws it/,
  );
  refusePj(
    "stress loses its dice options",
    (value) => delete findBlock(value, "stress").decoration,
    /stress\.decoration must be published as dice-options: the player sheet draws it/,
  );
  refusePj(
    "circle row decoration on a plain block",
    (value) => (findBlock(value, "possessions").decoration = { kind: "circle-row", count: 4 }),
    /possessions\.decoration circle-row needs a circle-row block/,
  );
  /* The side of a protection fails on the side rule, before the rules of the grid. */
  refusePj(
    "physical grid declared mental",
    (value) => (decorationOf(value, "protections-physiques").side = "mental"),
    /protections-physiques\.decoration\.side must be physical, the side of the block/,
  );
  refusePj(
    "mental grid declared physical",
    (value) => (decorationOf(value, "protections-mentales").side = "physical"),
    /protections-mentales\.decoration\.side must be mental, the side of the block/,
  );
  refusePj(
    "physical grid with the unit of the other side",
    (value) => (decorationOf(value, "protections-physiques").unit = "PM"),
    /protections-physiques\.decoration\.unit must be PP, the unit of the physical side/,
  );
  /* What the wound circles print is what the schema declares. */
  refusePj(
    "a fifth duration in the schema",
    (value) => {
      const column = woundColumn(value, "physiques", "premiereColonne");
      obj(column.properties, "column.properties").annee = { type: "boolean" };
    },
    /blessures-physiques\.decoration\.durations differ from the durations the schema declares in premiereColonne/,
  );
  refusePj(
    "a column dropped from the schema",
    (value) =>
      delete obj(woundSide(value, "mentales").properties, "mentales.properties").secondeColonne,
    /blessures-mentales\.decoration\.columns differ from the columns the schema declares/,
  );
  refusePj(
    "a duration that is no longer a circle",
    (value) => {
      const column = woundColumn(value, "physiques", "premiereColonne");
      obj(obj(column.properties, "column.properties").heure, "heure").type = "integer";
    },
    /blessures-physiques\/premiereColonne\/heure must be a ticked or unticked circle \(boolean\)/,
  );
  /* The places and labels the sheet decides. */
  refusePj(
    "social weapons relabelled",
    (value) => (findBlock(value, "armes-sociales").label = "Armes mentales"),
    /armes-sociales\.label must be « Armes sociales »/,
  );
  refusePj(
    "social weapons moved to another section",
    (value) => {
      const sections = sectionsOf(value);
      const from = sections.find((section) => section.id === "equipement") as Obj;
      const blocks = from.blocks as Obj[];
      const [moved] = blocks.splice(
        blocks.findIndex((block) => block.id === "armes-sociales"),
        1,
      );
      delete moved.placement;
      moved.order = 99;
      ((sections.find((section) => section.id === "sante") as Obj).blocks as Obj[]).push(moved);
    },
    /armes-sociales must sit in the equipement section/,
  );
  refusePj(
    "physical wounds labelled mental",
    (value) => (findBlock(value, "blessures-physiques").label = "Blessures mentales"),
    /blessures-physiques\.label must be « Blessures physiques »/,
  );
  refusePj(
    "mental wounds relabelled",
    (value) => (findBlock(value, "blessures-mentales").label = "Blessures psychiques"),
    /blessures-mentales\.label must be « Blessures mentales »/,
  );
  refusePj(
    "a constraint line relabelled",
    (value) => ((findBlock(value, "contraintes").pointerRows as Obj[][])[0][0].label = "Pro"),
    /contraintes must print the three lines of the sheet, with their labels/,
  );
  refusePj(
    "a second reference table under another id",
    (value) => {
      const copy = clone(findBlock(value, "armes-sociales"));
      copy.id = "armes-sociales-bis";
      copy.order = 61;
      copy.placement = { column: 1, row: 4, columnSpan: 3 };
      const host = sectionsOf(value).find((section) => section.id === "equipement") as Obj;
      (host.blocks as Obj[]).push(copy);
    },
    /pj paths must be unique|pj must print one reference table, the social weapons \(block armes-sociales\)/,
  );
  /* The scenario comes after the format, on the fourth line. */
  refusePj(
    "scenario before the format",
    (value) => {
      const parameters = findBlock(value, "parametres-jeu");
      for (const list of [parameters.paths, parameters.rowLabels] as string[][])
        [list[2], list[3]] = [list[3], list[2]];
    },
    /parametres-jeu must print the scenario line right after the scenario format/,
  );
  /* Identity fields: a field read by a sibling block is left out of the grid on the player sheet only,
     whatever the name of the field. */
  const npcWithIdentityGrid = clone(schemas.get("pnj") as Obj);
  const gridBlocks = sectionsOf(npcWithIdentityGrid)[0].blocks as Obj[];
  const lastOrder = Number(gridBlocks[gridBlocks.length - 1].order);
  gridBlocks.push(
    {
      id: "sonde-grille",
      label: "Narratif",
      order: lastOrder + 10,
      layout: "grid",
      columns: 1,
      form: "identity-fields",
      fieldRows: [
        ["role"],
        ["attitude"],
        ["personnalite"],
        ["evolutionPossible"],
        ["interpretation"],
        ["repliques"],
        ["notesMj"],
      ],
      paths: ["/narratif"],
    },
    {
      id: "sonde-frere",
      label: "Historique",
      order: lastOrder + 20,
      layout: "stack",
      form: "narrative",
      paths: ["/narratif/historique"],
    },
  );
  assert.throws(
    () => validatePresentation(npcWithIdentityGrid, "pnj"),
    /sonde-grille\.fieldRows must name each field once/,
  );
  /* The threshold levels are the player sheet's alone. */
  for (const target of ["pnj", "monstre"] as const) {
    const withLevels = clone(schemas.get(target) as Obj);
    const thresholds = pjBlocks(withLevels).find((block) => block.form === "threshold-rows");
    assert.ok(thresholds, `self-test: ${target} threshold rows`);
    thresholds.thresholdLevels = clone(THRESHOLD_LEVELS);
    assert.throws(
      () => validatePresentation(withLevels, target),
      /blocks\.sante\.thresholdLevels belongs to the player sheet/,
      target,
    );
  }
  /* The reference table is the player sheet's alone. */
  for (const target of ["pnj", "monstre"] as const) {
    const withTable = clone(schemas.get(target) as Obj);
    const host = sectionsOf(withTable)[0];
    const hosted = host.blocks as Obj[];
    const table = clone(findBlock(source, "armes-sociales"));
    delete table.placement;
    table.order = Number(hosted[hosted.length - 1].order) + 10;
    hosted.push(table);
    assert.throws(
      () => validatePresentation(withTable, target),
      /blocks\.armes-sociales reference table belongs to the player sheet/,
      target,
    );
  }
  /* What the player sheet prints is required, not merely allowed. */
  const noRange = clone(source);
  delete findBlock(noRange, "caracteristiques-physiques").rangeDisplay;
  assert.throws(
    () => validatePresentation(noRange, "pj"),
    /caracteristiques-physiques\.rangeDisplay must be published: the player sheet prints the current value only/,
  );
  const noRangeMental = clone(source);
  delete findBlock(noRangeMental, "caracteristiques-mentales").rangeDisplay;
  assert.throws(
    () => validatePresentation(noRangeMental, "pj"),
    /caracteristiques-mentales\.rangeDisplay must be published/,
  );
  const scenarioRenamed = clone(source);
  (findBlock(scenarioRenamed, "parametres-jeu").rowLabels as string[])[3] = "Scénarios";
  assert.throws(
    () => validatePresentation(scenarioRenamed, "pj"),
    /parametres-jeu must label the scenario line « Scénario »/,
  );
  const scenarioDropped = clone(source);
  const parameters = findBlock(scenarioDropped, "parametres-jeu");
  (parameters.paths as string[]).pop();
  (parameters.rowLabels as string[]).pop();
  assert.throws(
    () => validatePresentation(scenarioDropped, "pj"),
    /parametres-jeu must read \/parametresDuJeu\/scenario/,
  );
  const scenarioMoved = clone(source);
  const movedParameters = findBlock(scenarioMoved, "parametres-jeu");
  (movedParameters.paths as string[]).reverse();
  assert.throws(
    () => validatePresentation(scenarioMoved, "pj"),
    /parametres-jeu must label the scenario line « Scénario »/,
  );
  const strayStress = clone(source);
  const stressSections = sectionsOf(strayStress);
  const profile = stressSections.find((section) => section.id === "caracteristique") as Obj;
  const [stressBlock] = (profile.blocks as Obj[]).splice(
    (profile.blocks as Obj[]).findIndex((block) => block.id === "stress"),
    1,
  );
  delete stressBlock.placement;
  const health = stressSections.find((section) => section.id === "sante") as Obj;
  stressBlock.order = 80;
  (health.blocks as Obj[]).push(stressBlock);
  assert.throws(
    () => validatePresentation(strayStress, "pj"),
    /pj\.sections\.caracteristique must hold the stress dice block, with the characteristics/,
  );
  const stressElsewhere = clone(source);
  findBlock(stressElsewhere, "stress").paths = ["/etatDePartie/malus"];
  assert.throws(
    () => validatePresentation(stressElsewhere, "pj"),
    /pj\.stress must read \/etatDePartie\/stress/,
  );
  /* The unit decoration of the former protection lines is gone from the closed list. */
  const retiredUnits = clone(source);
  findBlock(retiredUnits, "possessions").decoration = {
    kind: "protection-units",
    physical: "PP",
    mental: "PM",
  };
  assert.throws(
    () => validatePresentation(retiredUnits, "pj"),
    /possessions\.decoration decoration is unknown/,
  );
  const notesOnPnj = clone(schemas.get("pnj") as Obj);
  pjBlocks(notesOnPnj)[0].notes = ["Marcher / Courir"];
  assert.throws(() => validatePresentation(notesOnPnj, "pnj"), /notes belongs to the player sheet/);
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
  assert.throws(() => validatePresentation(labelTwice, "monstre"), /monstre paths must be unique/);
  const wrongVariant = clone(monster);
  obj(obj(wrongVariant[EXTENSION], EXTENSION).categories, "categories").defaultVariant = "pink";
  assert.throws(
    () => validatePresentation(wrongVariant, "monstre"),
    /monstre\.categories\.defaultVariant/,
  );
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
  /* A strict triplet outside a number-or-triplet choice is refused; inside one, it is accepted. */
  const strictTriplet = {
    type: "object",
    properties: {
      minimum: { type: "integer", minimum: 0, maximum: 50 },
      current: { type: "integer", minimum: 0, maximum: 50 },
      maximum: { type: "integer", minimum: 0, maximum: 50 },
    },
  };
  const withDefinition = (value: Obj, definition: Obj): void => {
    value.$defs = { ...((value.$defs as Obj | undefined) ?? {}), sonde: definition };
  };
  refuse(
    "strict triplet outside a number-or-triplet choice",
    (value) => withDefinition(value, clone(strictTriplet)),
    /monstre must not carry a strict triplet outside a number-or-triplet choice/,
  );
  const tolerated = clone(monster);
  withDefinition(tolerated, {
    anyOf: [{ type: "integer", minimum: 0, maximum: 50 }, clone(strictTriplet)],
  });
  validatePresentation(tolerated, "monstre");
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
    (value) => (sectionNamed(value, "contagion").fallbackCard = "principal"),
    /sections\.contagion\.fallbackCard needs a section on cards/,
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
  refuse(
    "badge case without its position",
    (value) => delete currentOf(value).position,
    /blocks\.etat\.decoration\.current fields differ/,
  );
  refuse(
    "badge case on the start side",
    (value) => (currentOf(value).position = "start"),
    /blocks\.etat\.decoration\.current\.position must be end/,
  );
  /* Banner subtitle: the pointers printed under the name. */
  const subtitleOf = (value: Obj): string[] =>
    blockNamed(value, "identification").subtitlePaths as string[];
  refuse(
    "subtitle on a block that is not a name card",
    (value) => (blockNamed(value, "description").subtitlePaths = ["/description"]),
    /blocks\.description\.subtitlePaths needs a name card/,
  );
  refuse(
    "empty subtitle",
    (value) => (blockNamed(value, "identification").subtitlePaths = []),
    /blocks\.identification\.subtitlePaths must not be empty/,
  );
  refuse(
    "subtitle pointer repeated",
    (value) => subtitleOf(value).push("/instinct"),
    /blocks\.identification\.subtitlePaths repeat/,
  );
  refuse(
    "subtitle pointer the contract lacks",
    (value) => (subtitleOf(value)[0] = "/inconnu"),
    /references unknown property inconnu/,
  );
  refuse(
    "subtitle pointer the block does not read",
    (value) => (subtitleOf(value)[0] = "/typeInfecte"),
    /blocks\.identification\.subtitlePaths \/typeInfecte is not among the block paths/,
  );
  refuse(
    "subtitle path printed a second time as a section label",
    (value) => (sectionNamed(value, "comportement").labelFrom = "/instinct"),
    /monstre paths must be unique/,
  );
  refuse(
    "body type printed a second time as a section label",
    (value) => (sectionNamed(value, "corps").labelFrom = "/typeDeCorps"),
    /monstre paths must be unique/,
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
  assert.throws(
    () => validatePresentation(bareTracks, "pnj"),
    /malus tracks need both their form and their decoration/,
  );
  const cardsOnNpc = clone(npc);
  sectionsOf(cardsOnNpc)[1].cards = ["principal"];
  assert.throws(
    () => validatePresentation(cardsOnNpc, "pnj"),
    /pnj\.sections\.[a-z-]+\.cards belongs to the creature card/,
  );
  const handwrittenCard = clone(npc);
  obj(obj(handwrittenCard[EXTENSION], EXTENSION).appearance, "appearance").values = {
    align: "end",
    font: "handwritten",
    color: "handwrittenInk",
    renderMaximum: false,
  };
  assert.throws(
    () => validatePresentation(handwrittenCard, "pnj"),
    /pnj\.appearance\.values must be typeset on the compact card/,
  );
  const twiceAliased = clone(calloutSource as unknown as Obj) as unknown as Obj[];
  (twiceAliased[1].aliases as string[]).push((twiceAliased[0].aliases as string[])[0]);
  assert.throws(
    () => validateCallouts(twiceAliased, calloutContract, calloutExample),
    /alias .+ used twice/,
  );
  const foreignCapability = clone(calloutSource as unknown as Obj) as unknown as Obj[];
  foreignCapability[0].capability = "style:pbta";
  assert.throws(
    () => validateCallouts(foreignCapability, calloutContract, calloutExample),
    /capability not required by the pack/,
  );
  const undocumented = calloutContract.replace("`adrenaline-encart`", "encart");
  assert.throws(
    () => validateCallouts(calloutSource, undocumented, calloutExample),
    /adrenaline-encart missing from callout-contract\.md/,
  );
  console.log("✓ presentation validator self-test passed");
}
