/**
 * Information architecture published beside the JSON Schemas.
 *
 * Sections contain visible blocks. Runtime components, module paths, CSS
 * classes and other consumer implementation details are deliberately absent.
 */

export type AdrenalinePresentationLayout = "banner" | "columns" | "grid" | "stack";

export type AdrenalinePresentationForm =
  | "name-card"
  | "game-parameters"
  | "formation-columns"
  | "identity-fields"
  | "characteristic-rows"
  | "ruled-list"
  | "weapon-lines"
  | "protection-lines"
  | "stress-dice"
  | "threshold-rows"
  | "status-frames"
  | "shock-circles"
  | "malus-scale"
  | "narrative"
  | "compact-rows"
  | "combat"
  | "state-card"
  | "state-header"
  | "malus-tracks"
  | "malus-circles"
  | "inline-list"
  | "skill-lines"
  | "action-lines"
  | "reference-table"
  | "location-grid"
  | "wound-circles"
  | "circle-row";

/** A location of the player sheet grid, with the d10 range that designates it. */
export type AdrenalineLocationCell = { id: string; label: string; range: string };

/** Nature of a damage die, by the colour of its badge: yellow shocks, red wounds. */
export type AdrenalineDamageNature = "choquante" | "blessante";

/**
 * A fixed table the sheet prints as it is, whatever the document holds (the
 * social weapons). Its text is published here, never entered.
 */
export type AdrenalineReferenceTable = {
  columns: readonly [string, string];
  /** One line per entry: its name and what it does, with the threshold of its 2d10 when it has one. */
  lines: readonly { name: string; properties: string }[];
  /** Wording of the two natures of die, for the editors that offer them: the sheet does not print it. */
  legend: readonly { dice: string; nature: AdrenalineDamageNature; meaning: string }[];
};

/**
 * Label and malus count of a health threshold level on the player sheet. The
 * match with the contract key is positional: `superficiel` is printed « Léger ».
 */
export type AdrenalineThresholdLevel = {
  key: "superficiel" | "leger" | "grave" | "profond";
  label: string;
  malus: 1 | 2 | 3 | 4;
};

export type AdrenalinePresentationDecoration =
  | {
      kind: "dice-options";
      favorable: readonly ["+1d100", "+2d100"];
      defavorable: readonly ["+1d100", "+2d100"];
    }
  | {
      kind: "circle-groups";
      groups: readonly [{ key: "rounds"; label: "ROUND"; count: 5; shape: "round" }];
    }
  /** From 1 to 9, then `last` for the tenth malus. */
  | { kind: "scale"; from: 1; to: 9; last: "HS" }
  /** Divers: `count` circles, ticked by the counter; the text is still read. */
  | { kind: "circle-row"; count: 4 }
  /**
   * Protection lines followed by the grid of the six locations: a listed
   * location ticks the first of its `boxes`, the others stay empty.
   */
  | {
      kind: "location-grid";
      side: "physical" | "mental";
      unit: "PP" | "PM";
      boxes: 3;
      locations: readonly AdrenalineLocationCell[];
    }
  /** Wounds by duration: two columns, each printing `circles` circle (ticked or not) per duration. */
  | {
      kind: "wound-circles";
      side: "physical" | "mental";
      durations: readonly ["heure", "jour", "semaine", "mois"];
      columns: readonly [{ key: "premiereColonne" }, { key: "secondeColonne" }];
      circles: 1;
    }
  | { kind: "weapon-die"; label: "d10" }
  /**
   * Stress and malus tracks of a compact card: `length` circles per track, the
   * first `stressDefault` stress circles bold when the document gives no count.
   */
  | { kind: "malus-tracks"; length: 10; stressDefault: 2 }
  /**
   * Header of a creature state: a marker before each trigger, and a case marking
   * the state currently played, bound to `current.path` (`/etatActif`) and drawn
   * on the listed cards only. `position` is the side of the title band where
   * the case sits: `end`, flush right.
   */
  | {
      kind: "state-badge";
      triggerMarker: true;
      current: { path: "/etatActif"; cards: readonly ["principal"]; position: "end" };
    };

type AdrenalinePresentationFonts = {
  body: "Adrenaline Body";
  heading: "Adrenaline Display";
  handwritten: "Adrenaline Handwriting";
};

type AdrenalinePresentationTokens = {
  paper: "--background-primary";
  card: "--adrenaline-card-surface";
  ink: "--text-normal";
  band: "--adrenaline-band";
  bandInk: "--adrenaline-band-ink";
  sectionBand: "--adrenaline-section-band";
  rule: "--adrenaline-rule";
  handwrittenInk: "--adrenaline-handwritten-ink";
  statusYellowBg: "--adrenaline-status-yellow-bg";
  statusYellowInk: "--adrenaline-status-yellow-ink";
  statusRedBg: "--adrenaline-status-red-bg";
  statusRedInk: "--adrenaline-status-red-ink";
};

/**
 * Extra tokens of a compact card: category banners, state triggers, dice badges
 * and the two coloured malus tracks (the stress track keeps the ink).
 */
type AdrenalineCompactCardTokens = AdrenalinePresentationTokens & {
  malusShock: "--adrenaline-malus-shock";
  malusWound: "--adrenaline-malus-wound";
  bannerGarnet: "--adrenaline-banner-garnet";
  bannerBlue: "--adrenaline-banner-blue";
  bannerOrange: "--adrenaline-banner-orange";
  bannerInk: "--adrenaline-banner-ink";
  triggerBg: "--adrenaline-trigger-bg";
  triggerInk: "--adrenaline-trigger-ink";
  diceBadgeBg: "--adrenaline-dice-badge-bg";
  diceBadgeInk: "--adrenaline-dice-badge-ink";
};

/** A creature card also draws the case of its current state: the PNJ card has no state header. */
type AdrenalineCreatureCardTokens = AdrenalineCompactCardTokens & {
  stateBadge: "--adrenaline-card-badge";
};

/**
 * The paper sheet prints handwritten values flush right under centred titles;
 * the compact card of a PNJ or a creature prints typeset figures (percentages,
 * totals, solidities) flush right on their line, under titles aligned to the
 * start. Prose values still follow their label.
 */
export type AdrenalinePresentationAppearance =
  | {
      variant: "zombiology";
      surface: "paper-sheet";
      outerRule: true;
      fonts: AdrenalinePresentationFonts;
      tokens: AdrenalinePresentationTokens;
      sectionTitles: { align: "center"; font: "heading" };
      values: { align: "end"; font: "handwritten"; color: "handwrittenInk"; renderMaximum: false };
    }
  | {
      variant: "zombiology";
      surface: "compact-card";
      outerRule: true;
      fonts: AdrenalinePresentationFonts;
      tokens: AdrenalineCompactCardTokens | AdrenalineCreatureCardTokens;
      sectionTitles: { align: "start"; font: "heading" };
      values: { align: "end"; font: "body"; color: "ink"; renderMaximum: false };
    };

/** The cards a creature can print. */
export type AdrenalineCardId = "principal" | "secondaire";

/**
 * Creature only: a card the descriptor names, and when it exists. Every card a
 * section, a block, a join, a fallback or the badge cites is declared here.
 * Without `existsWhenAny` the card is always printed. With it, the card is
 * printed only when the document enters a value at one of the listed JSON
 * Pointers; an array counts as entered when it is not empty. No pointer
 * entered, no card: the sections it carried follow their `fallbackCard`.
 */
export type AdrenalinePresentationCard = {
  id: AdrenalineCardId;
  existsWhenAny?: readonly string[];
};

export type AdrenalinePresentationBlock = {
  id: string;
  label: string;
  order: number;
  layout: AdrenalinePresentationLayout;
  columns?: number;
  form?: AdrenalinePresentationForm;
  /** Visible columns of a playable range; maximum remains editor-only. */
  rangeDisplay?: readonly "current"[];
  rowLabels?: readonly string[];
  /**
   * `name-card` and `game-parameters` only: the pointers, among the block paths,
   * printed on one line under the name (under the sheet label for the game
   * parameters), in this order and joined by a space; a value the document
   * leaves out is not printed. They are not printed again in the banner or in
   * the rows of the parameters.
   */
  subtitlePaths?: readonly string[];
  valueSuffix?: "%" | "PX";
  formationFields?: {
    header: readonly ["type", "nom", "pourcentage"];
    competence: readonly ["nom", "specialite", "pourcentage"];
  };
  /**
   * Printed formation columns, one per type, in sheet order: the sheet keeps
   * every column even when the document leaves it empty.
   */
  formationTypes?: readonly string[];
  placement?: { column: number; row: number; rowSpan?: number; columnSpan?: number };
  /**
   * Printed rows of a field grid, by property name under the block path. A row
   * naming one field spans the whole block.
   */
  fieldRows?: readonly (readonly string[])[];
  /**
   * Printed rows of a block that reads several paths, by JSON Pointer. Each
   * pointer descends from one of the block paths; a row fits the block columns.
   * A cell whose value the document leaves out is not printed. `label`
   * replaces the printed name of the cell.
   */
  pointerRows?: readonly (readonly { path: string; label?: string }[])[];
  /** Creature only: the cards that print this block; absent, every card of its section. */
  cards?: readonly AdrenalineCardId[];
  decoration?: AdrenalinePresentationDecoration;
  /** `reference-table` only: the fixed table, which reads no document path. */
  referenceTable?: AdrenalineReferenceTable;
  /** `threshold-rows` of the player sheet: printed label and malus count of each level. */
  thresholdLevels?: readonly AdrenalineThresholdLevel[];
  /** Fixed texts printed by the block, as the sheet words them. */
  notes?: readonly string[];
  /**
   * `ruled-list` and `weapon-lines` of the player sheet: the number of ruled
   * lines printed at least, as the sheet draws them. Lines the document enters
   * beyond it are printed after them; none is cut. It is a placement of the
   * sheet, never a bound of the document: the contract list stays unbounded.
   */
  minimumRows?: number;
  /** JSON Pointers read by this visible block; only a `reference-table` may read none. */
  paths: string[];
};

export type AdrenalinePresentationSection = {
  id: string;
  label: string;
  order: number;
  layout: AdrenalinePresentationLayout;
  columns?: number;
  showTitle?: boolean;
  /**
   * Sheet row shared with the neighbouring sections of the same id, which sit
   * side by side; `span` is the share of the sheet width, in thirds.
   */
  row?: { id: string; span: 1 | 2 | 3 };
  /** Folded by default: the player sheet closes its identity section. */
  collapsible?: true;
  /** JSON Pointer whose value is printed after the label: `Comportement (Rôdeur)`. */
  labelFrom?: string;
  /**
   * Creature only: the state cards this section is printed on. The `principal`
   * card shows the state named by `etatPrincipal`, or the base state; the
   * `secondaire` card shows the other one. A section without `cards` is printed
   * once, outside the cards.
   */
  cards?: readonly AdrenalineCardId[];
  /**
   * Creature only: on the named card, this section is printed right after the
   * section `section` (which comes first in `order`), under the single title
   * `title` that covers both, instead of on its own. Both sections stay
   * separate everywhere else.
   */
  joinedTo?: { section: string; title: string; card: AdrenalineCardId };
  /**
   * Creature only: the card that prints this section when none of the cards
   * named by `cards` is printed: a card whose `existsWhenAny` finds no entered
   * value does not exist (a creature without a second state has no
   * `secondaire` card). The section is then printed on this card, at its place
   * of `order` among the sections of that card. Required on a section printed
   * on the `secondaire` card only; it names the `principal` card, which every
   * creature prints, and never one already in `cards`.
   */
  fallbackCard?: "principal";
  blocks: AdrenalinePresentationBlock[];
};

export type AdrenalineCategoryVariant = "garnet" | "blue" | "orange";

/**
 * Banner colour and icon by category. Free category strings fall back to the
 * default variant and icon; icons are Lucide identifiers.
 */
export type AdrenalinePresentationCategories = {
  path: "/categorie";
  fallbackLabel: string;
  defaultVariant: AdrenalineCategoryVariant;
  defaultIcon: string;
  variants: Readonly<Record<string, AdrenalineCategoryVariant>>;
  icons: Readonly<Record<string, string>>;
};

export type AdrenalinePresentation = {
  version: 1;
  capability: `block:adrenaline-${"pj" | "pnj" | "monstre"}`;
  sheet: {
    id: `adrenaline-${"pj" | "pnj" | "monstre"}`;
    label: string;
  };
  appearance: AdrenalinePresentationAppearance;
  categories?: AdrenalinePresentationCategories;
  /** Creature only: the cards, and when each exists. */
  cards?: readonly AdrenalinePresentationCard[];
  values: {
    /** Lantern reads scalar input limits from JSON Schema minimum/maximum. */
    editorBounds: "json-schema";
    /** Playable ranges render current by default; blocks may also show minimum. */
    range: {
      minimum: "minimum";
      current: "current";
      maximum: "maximum";
      render: "current";
    };
  };
  sections: AdrenalinePresentationSection[];
  /** Portable metadata intentionally absent from the visual sheet. */
  hiddenPaths: string[];
};

function definePresentation<const T extends AdrenalinePresentation>(value: T): T {
  return value;
}

const VALUES = {
  editorBounds: "json-schema",
  range: {
    minimum: "minimum",
    current: "current",
    maximum: "maximum",
    render: "current",
  },
} as const;

const FONTS = {
  body: "Adrenaline Body",
  heading: "Adrenaline Display",
  handwritten: "Adrenaline Handwriting",
} as const;

const TOKENS = {
  paper: "--background-primary",
  card: "--adrenaline-card-surface",
  ink: "--text-normal",
  band: "--adrenaline-band",
  bandInk: "--adrenaline-band-ink",
  sectionBand: "--adrenaline-section-band",
  rule: "--adrenaline-rule",
  handwrittenInk: "--adrenaline-handwritten-ink",
  statusYellowBg: "--adrenaline-status-yellow-bg",
  statusYellowInk: "--adrenaline-status-yellow-ink",
  statusRedBg: "--adrenaline-status-red-bg",
  statusRedInk: "--adrenaline-status-red-ink",
} as const;

const COMPACT_CARD_TOKENS = {
  ...TOKENS,
  malusShock: "--adrenaline-malus-shock",
  malusWound: "--adrenaline-malus-wound",
  bannerGarnet: "--adrenaline-banner-garnet",
  bannerBlue: "--adrenaline-banner-blue",
  bannerOrange: "--adrenaline-banner-orange",
  bannerInk: "--adrenaline-banner-ink",
  triggerBg: "--adrenaline-trigger-bg",
  triggerInk: "--adrenaline-trigger-ink",
  diceBadgeBg: "--adrenaline-dice-badge-bg",
  diceBadgeInk: "--adrenaline-dice-badge-ink",
} as const;

const CREATURE_CARD_TOKENS = {
  ...COMPACT_CARD_TOKENS,
  stateBadge: "--adrenaline-card-badge",
} as const;

const PAPER_SHEET = {
  variant: "zombiology",
  surface: "paper-sheet",
  outerRule: true,
  fonts: FONTS,
  tokens: TOKENS,
  sectionTitles: { align: "center", font: "heading" },
  values: { align: "end", font: "handwritten", color: "handwrittenInk", renderMaximum: false },
} as const satisfies AdrenalinePresentationAppearance;

const COMPACT_CARD = {
  variant: "zombiology",
  surface: "compact-card",
  outerRule: true,
  fonts: FONTS,
  tokens: COMPACT_CARD_TOKENS,
  sectionTitles: { align: "start", font: "heading" },
  values: { align: "end", font: "body", color: "ink", renderMaximum: false },
} as const satisfies AdrenalinePresentationAppearance;

const CREATURE_CARD = {
  ...COMPACT_CARD,
  tokens: CREATURE_CARD_TOKENS,
} as const satisfies AdrenalinePresentationAppearance;

/** Fixed table of the social weapons: the name, then what sets the die to 2d10, no more. */
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
    {
      dice: "Xd10",
      nature: "choquante",
      meaning: "dégâts des armes ayant la propriété Choquante",
    },
    {
      dice: "Xd10",
      nature: "blessante",
      meaning: "dégâts des armes ayant la propriété Blessante",
    },
  ],
} as const satisfies AdrenalineReferenceTable;

/** Labels and malus count of the thresholds: positional, `superficiel` is printed « Léger ». */
const THRESHOLD_LEVELS = [
  { key: "superficiel", label: "Léger", malus: 1 },
  { key: "leger", label: "Modéré", malus: 2 },
  { key: "grave", label: "Grave", malus: 3 },
  { key: "profond", label: "Profond", malus: 4 },
] as const satisfies readonly AdrenalineThresholdLevel[];

const WOUND_DURATIONS = ["heure", "jour", "semaine", "mois"] as const;
const WOUND_COLUMNS = [{ key: "premiereColonne" }, { key: "secondeColonne" }] as const;

export const PJ_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-pj",
  sheet: { id: "adrenaline-pj", label: "Feuille de personnage" },
  appearance: PAPER_SHEET,
  values: VALUES,
  sections: [
    {
      id: "entete",
      label: "En-tête",
      order: 10,
      layout: "columns",
      columns: 3,
      showTitle: false,
      blocks: [
        {
          id: "nom",
          label: "Nom du personnage",
          order: 10,
          layout: "stack",
          form: "name-card",
          paths: ["/nom"],
        },
        {
          id: "parametres-jeu",
          label: "Paramètres du jeu",
          order: 20,
          layout: "grid",
          columns: 2,
          form: "game-parameters",
          rowLabels: ["Joueur.se", "Type création", "Type de scénario", "Scénario"],
          paths: [
            "/parametresDuJeu/joueur",
            "/parametresDuJeu/typeDeCreation",
            "/parametresDuJeu/typeDeScenario",
            "/parametresDuJeu/scenario",
          ],
          subtitlePaths: ["/parametresDuJeu/typeDeScenario"],
        },
        {
          id: "px",
          label: "PX",
          order: 30,
          layout: "stack",
          form: "name-card",
          valueSuffix: "PX",
          paths: ["/parametresDuJeu/px"],
        },
      ],
    },
    {
      id: "competence",
      label: "Compétence",
      order: 20,
      layout: "columns",
      columns: 3,
      blocks: [
        {
          id: "formations-competences",
          label: "Formations et compétences",
          order: 10,
          layout: "columns",
          columns: 3,
          form: "formation-columns",
          valueSuffix: "%",
          formationFields: {
            header: ["type", "nom", "pourcentage"],
            competence: ["nom", "specialite", "pourcentage"],
          },
          formationTypes: ["classe-sociale", "professionnelle", "personnelle"],
          notes: ["Compétence de substitution : malus de -10 %"],
          paths: ["/formations"],
        },
      ],
    },
    {
      id: "caracteristique",
      label: "Caractéristique",
      order: 35,
      layout: "columns",
      columns: 3,
      row: { id: "profil", span: 3 },
      blocks: [
        {
          id: "caracteristiques-physiques",
          label: "Carac. physiques",
          order: 20,
          layout: "grid",
          columns: 2,
          form: "characteristic-rows",
          rangeDisplay: ["current"],
          rowLabels: ["Force", "Constitution", "Dextérité", "Rapidité"],
          valueSuffix: "%",
          notes: ["Marcher (qualité de RAP) ; Courir (Marcher × 3)"],
          placement: { column: 1, row: 1 },
          paths: [
            "/caracteristiques/for",
            "/caracteristiques/con",
            "/caracteristiques/dex",
            "/caracteristiques/rap",
          ],
        },
        {
          id: "caracteristiques-mentales",
          label: "Carac. mentales",
          order: 30,
          layout: "grid",
          columns: 2,
          form: "characteristic-rows",
          rangeDisplay: ["current"],
          rowLabels: ["Logique", "Volonté", "Perception", "Charisme"],
          valueSuffix: "%",
          placement: { column: 2, row: 1 },
          paths: [
            "/caracteristiques/log",
            "/caracteristiques/vol",
            "/caracteristiques/per",
            "/caracteristiques/cha",
          ],
        },
        {
          id: "stress",
          label: "Dés de stress",
          order: 40,
          layout: "stack",
          form: "stress-dice",
          decoration: {
            kind: "dice-options",
            favorable: ["+1d100", "+2d100"],
            defavorable: ["+1d100", "+2d100"],
          },
          placement: { column: 3, row: 1 },
          paths: ["/etatDePartie/stress"],
        },
      ],
    },
    {
      id: "equipement",
      label: "Équipement",
      order: 40,
      layout: "columns",
      columns: 3,
      blocks: [
        {
          id: "armes-physiques",
          label: "Armes physiques",
          order: 10,
          layout: "stack",
          form: "weapon-lines",
          decoration: { kind: "weapon-die", label: "d10" },
          placement: { column: 1, row: 1 },
          minimumRows: 5,
          paths: ["/equipement/armesPhysiques"],
        },
        {
          id: "armes-sociales",
          label: "Armes sociales",
          order: 20,
          layout: "stack",
          form: "reference-table",
          referenceTable: SOCIAL_WEAPONS_TABLE,
          placement: { column: 2, row: 1 },
          paths: ["/equipement/armesSocialesBarrees"],
        },
        {
          id: "avantages-immunites",
          label: "Avantages et immunités",
          order: 30,
          layout: "stack",
          form: "ruled-list",
          placement: { column: 3, row: 1 },
          minimumRows: 5,
          paths: ["/equipement/avantagesEtImmunites"],
        },
        {
          id: "possessions",
          label: "Possessions",
          order: 40,
          layout: "stack",
          form: "ruled-list",
          placement: { column: 1, row: 2 },
          minimumRows: 4,
          paths: ["/equipement/possessions", "/equipement/equipementFavori"],
        },
        {
          id: "protections-physiques",
          label: "Protections physiques",
          order: 50,
          layout: "stack",
          form: "location-grid",
          decoration: {
            kind: "location-grid",
            side: "physical",
            unit: "PP",
            boxes: 3,
            locations: [
              { id: "jambe-droite", label: "Jambe D", range: "1" },
              { id: "jambe-gauche", label: "Jambe G", range: "2" },
              { id: "torse", label: "Torse", range: "3-4" },
              { id: "bras-faible", label: "Bras faible", range: "5-6" },
              { id: "bras-fort", label: "Bras fort", range: "7-8" },
              { id: "tete", label: "Tête", range: "9-0" },
            ],
          },
          placement: { column: 2, row: 2 },
          paths: ["/protections/physiques"],
        },
        {
          id: "protections-mentales",
          label: "Protections mentales",
          order: 60,
          layout: "stack",
          form: "location-grid",
          decoration: {
            kind: "location-grid",
            side: "mental",
            unit: "PM",
            boxes: 3,
            locations: [
              { id: "culpabilite", label: "Culpabilité", range: "1" },
              { id: "tristesse", label: "Tristesse", range: "2" },
              { id: "colere", label: "Colère", range: "3-4" },
              { id: "impuissance", label: "Impuissance", range: "5-6" },
              { id: "anxiete", label: "Anxiété", range: "7-8" },
              { id: "peur", label: "Peur", range: "9-0" },
            ],
          },
          placement: { column: 3, row: 2 },
          paths: ["/protections/mentales"],
        },
      ],
    },
    {
      id: "sante",
      label: "Santé",
      order: 50,
      layout: "columns",
      columns: 3,
      blocks: [
        {
          id: "seuils-physiques",
          label: "Seuils physiques",
          order: 20,
          layout: "stack",
          form: "threshold-rows",
          thresholdLevels: THRESHOLD_LEVELS,
          paths: ["/sante/physique"],
        },
        {
          id: "seuils-mentaux",
          label: "Seuils mentaux",
          order: 30,
          layout: "stack",
          form: "threshold-rows",
          thresholdLevels: THRESHOLD_LEVELS,
          paths: ["/sante/mental"],
        },
        {
          id: "choc",
          label: "Choc",
          order: 40,
          layout: "stack",
          form: "shock-circles",
          decoration: {
            kind: "circle-groups",
            groups: [{ key: "rounds", label: "ROUND", count: 5, shape: "round" }],
          },
          paths: ["/etatDePartie/malus/choc", "/etatDePartie/malus/choc/notes"],
        },
        {
          id: "divers",
          label: "Divers",
          order: 50,
          layout: "stack",
          form: "circle-row",
          decoration: { kind: "circle-row", count: 4 },
          paths: ["/etatDePartie/malus/divers", "/etatDePartie/malus/diversCercles"],
        },
        {
          id: "blessures-physiques",
          label: "Blessures physiques",
          order: 52,
          layout: "stack",
          form: "wound-circles",
          decoration: {
            kind: "wound-circles",
            side: "physical",
            durations: WOUND_DURATIONS,
            columns: WOUND_COLUMNS,
            circles: 1,
          },
          paths: ["/etatDePartie/blessures/physiques"],
        },
        {
          id: "blessures-mentales",
          label: "Blessures mentales",
          order: 54,
          layout: "stack",
          form: "wound-circles",
          decoration: {
            kind: "wound-circles",
            side: "mental",
            durations: WOUND_DURATIONS,
            columns: WOUND_COLUMNS,
            circles: 1,
          },
          paths: ["/etatDePartie/blessures/mentales"],
        },
        {
          id: "etats-encaisses",
          label: "États",
          order: 60,
          layout: "stack",
          form: "status-frames",
          paths: ["/etatDePartie/etats"],
        },
        {
          id: "total-malus",
          label: "Total des malus",
          order: 70,
          layout: "stack",
          form: "malus-scale",
          decoration: { kind: "scale", from: 1, to: 9, last: "HS" },
          notes: ["1 malus = -10 %"],
          paths: ["/etatDePartie/malus/total"],
        },
      ],
    },
    {
      id: "identite",
      label: "Identité",
      order: 60,
      layout: "stack",
      columns: 1,
      collapsible: true,
      blocks: [
        {
          id: "identite",
          label: "Identité",
          order: 10,
          layout: "grid",
          columns: 2,
          form: "identity-fields",
          fieldRows: [
            ["nationalite", "genre"],
            ["cheveux", "age"],
            ["yeux", "taille"],
            ["peau", "poids"],
            ["signesParticuliers"],
          ],
          paths: ["/identite"],
        },
        {
          id: "contraintes",
          label: "Contraintes",
          order: 20,
          layout: "grid",
          columns: 1,
          form: "compact-rows",
          pointerRows: [
            [{ path: "/identite/contraintes/professionnelles", label: "Professionnelles" }],
            [{ path: "/identite/contraintes/familiales", label: "Familiales" }],
            [
              {
                path: "/identite/contraintes/engagementsExterieurs",
                label: "Engagements extérieurs",
              },
            ],
          ],
          paths: ["/identite/contraintes"],
        },
        {
          id: "historique",
          label: "Historique",
          order: 30,
          layout: "stack",
          form: "narrative",
          paths: ["/identite/historique"],
        },
        {
          id: "personnalite",
          label: "Personnalité",
          order: 40,
          layout: "stack",
          form: "narrative",
          paths: ["/identite/personnalite"],
        },
      ],
    },
  ],
  hiddenPaths: ["/meta", "/parametresDuJeu/declinaisonDeCampagne"],
});

const HEADER_PATHS = [
  "/nom",
  "/categorie",
  "/niveauDeDanger",
  "/niveauDeDangerAlternatif",
  "/niveauDeDangerNote",
] as const;

/** The creature banner also reads the instinct and the body type, printed under the name. */
const CREATURE_HEADER_PATHS = [...HEADER_PATHS, "/instinct", "/typeDeCorps"] as const;

/**
 * The compact PNJ card of the booklets: a coloured banner (category, name,
 * ND), the description paragraph, then characteristics, health and its tracks,
 * formations, skill lines and equipment. Game-master notes fold away.
 */
export const PNJ_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-pnj",
  sheet: { id: "adrenaline-pnj", label: "Fiche PNJ" },
  appearance: COMPACT_CARD,
  categories: {
    path: "/categorie",
    fallbackLabel: "PNJ",
    defaultVariant: "garnet",
    defaultIcon: "user",
    variants: { PNJ: "garnet", Police: "blue", Animal: "orange" },
    icons: { Police: "shield", Animal: "paw-print" },
  },
  values: VALUES,
  sections: [
    {
      id: "entete",
      label: "En-tête",
      order: 10,
      layout: "banner",
      blocks: [
        {
          id: "identification",
          label: "PNJ",
          order: 10,
          layout: "columns",
          columns: 2,
          form: "name-card",
          paths: [...HEADER_PATHS],
        },
      ],
    },
    {
      id: "description",
      label: "Description",
      order: 20,
      layout: "stack",
      showTitle: false,
      blocks: [
        {
          id: "description",
          label: "Description",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/description"],
        },
      ],
    },
    {
      id: "caracteristiques",
      label: "Caractéristiques",
      order: 30,
      layout: "grid",
      columns: 4,
      blocks: [
        {
          id: "caracteristiques",
          label: "Caractéristiques",
          order: 10,
          layout: "grid",
          columns: 4,
          form: "compact-rows",
          paths: ["/caracteristiques"],
        },
      ],
    },
    {
      id: "sante",
      label: "Santé",
      order: 40,
      layout: "stack",
      blocks: [
        {
          id: "sante",
          label: "Seuils",
          order: 10,
          layout: "columns",
          columns: 2,
          form: "threshold-rows",
          paths: ["/sante"],
        },
        {
          id: "protections",
          label: "Protections",
          order: 20,
          layout: "columns",
          columns: 2,
          form: "protection-lines",
          paths: ["/protections"],
        },
        {
          id: "pistes",
          label: "Stress et malus",
          order: 30,
          layout: "stack",
          form: "malus-tracks",
          decoration: { kind: "malus-tracks", length: 10, stressDefault: 2 },
          paths: ["/pistes"],
        },
        {
          id: "etat-partie",
          label: "État de partie",
          order: 40,
          layout: "stack",
          form: "status-frames",
          paths: ["/etatDePartie"],
        },
      ],
    },
    {
      id: "formations",
      label: "Formations",
      order: 50,
      layout: "stack",
      blocks: [
        {
          id: "formations",
          label: "Formations",
          order: 10,
          layout: "stack",
          form: "compact-rows",
          paths: ["/formations"],
        },
      ],
    },
    {
      id: "competences",
      label: "Compétences",
      order: 60,
      layout: "stack",
      blocks: [
        {
          id: "competences",
          label: "Compétences",
          order: 10,
          layout: "stack",
          form: "skill-lines",
          paths: ["/competences"],
        },
      ],
    },
    {
      id: "equipement",
      label: "Équipement",
      order: 70,
      layout: "stack",
      blocks: [
        {
          id: "equipement",
          label: "Équipement",
          order: 10,
          layout: "stack",
          form: "inline-list",
          paths: ["/equipement"],
        },
      ],
    },
    {
      id: "notes",
      label: "Notes",
      order: 80,
      layout: "stack",
      blocks: [
        {
          id: "narratif",
          label: "Notes",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/narratif"],
        },
      ],
    },
  ],
  hiddenPaths: ["/identite", "/meta"],
});

/**
 * The creature card of the booklets: a banner, the description, then two
 * state cards side by side — the large `principal` card and the small
 * `secondaire` one — each printing the profile of its state, resolved from the
 * base and the state's delta. The skills, the contagion and the notes are printed below, outside the cards.
 */
export const MONSTRE_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-monstre",
  sheet: { id: "adrenaline-monstre", label: "Fiche monstre" },
  appearance: CREATURE_CARD,
  categories: {
    path: "/categorie",
    fallbackLabel: "Créature",
    defaultVariant: "garnet",
    defaultIcon: "skull",
    variants: { Zombie: "garnet", Animal: "orange" },
    icons: { Zombie: "biohazard", Animal: "paw-print" },
  },
  cards: [{ id: "principal" }, { id: "secondaire", existsWhenAny: ["/etats", "/etatAlternatif"] }],
  values: VALUES,
  sections: [
    {
      id: "entete",
      label: "En-tête",
      order: 10,
      layout: "banner",
      blocks: [
        {
          id: "identification",
          label: "Créature",
          order: 10,
          layout: "columns",
          columns: 2,
          form: "name-card",
          subtitlePaths: ["/instinct", "/typeDeCorps"],
          paths: [...CREATURE_HEADER_PATHS],
        },
      ],
    },
    {
      id: "description",
      label: "Description",
      order: 20,
      layout: "stack",
      showTitle: false,
      blocks: [
        {
          id: "description",
          label: "Description",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/description"],
        },
      ],
    },
    {
      id: "etat",
      label: "État",
      order: 30,
      layout: "stack",
      showTitle: false,
      cards: ["principal", "secondaire"],
      blocks: [
        {
          id: "etat",
          label: "État",
          order: 10,
          layout: "stack",
          form: "state-header",
          decoration: {
            kind: "state-badge",
            triggerMarker: true,
            current: { path: "/etatActif", cards: ["principal"], position: "end" },
          },
          paths: ["/etatPrincipal", "/etatActif", "/etatDeBase", "/etats", "/etatAlternatif"],
        },
      ],
    },
    {
      id: "corps",
      label: "Corps",
      order: 40,
      layout: "stack",
      showTitle: false,
      cards: ["principal", "secondaire"],
      blocks: [
        {
          id: "caracteristiques",
          label: "Caractéristiques",
          order: 10,
          layout: "grid",
          columns: 4,
          form: "compact-rows",
          pointerRows: [
            [
              { path: "/caracteristiques/for" },
              { path: "/caracteristiques/con" },
              { path: "/caracteristiques/dex" },
              { path: "/caracteristiques/rap" },
            ],
            [
              { path: "/zoneDeDetection", label: "Zone de détection" },
              { path: "/caracteristiques/per" },
              { path: "/deplacement", label: "Dépl." },
            ],
          ],
          paths: ["/caracteristiques", "/zoneDeDetection", "/deplacement"],
        },
      ],
    },
    {
      id: "sante",
      label: "Santé",
      order: 50,
      layout: "grid",
      columns: 2,
      cards: ["principal", "secondaire"],
      blocks: [
        {
          id: "sante",
          label: "SP",
          order: 10,
          layout: "columns",
          columns: 2,
          form: "threshold-rows",
          placement: { column: 1, row: 1 },
          paths: ["/sante"],
        },
        {
          id: "etats-permanents",
          label: "État",
          order: 20,
          layout: "stack",
          form: "inline-list",
          placement: { column: 2, row: 1 },
          paths: ["/etatsPermanents"],
        },
        {
          id: "malus",
          label: "Malus avant HS",
          order: 30,
          layout: "stack",
          form: "malus-circles",
          placement: { column: 1, row: 2, columnSpan: 2 },
          cards: ["principal"],
          paths: ["/malusAvantHs"],
        },
        {
          id: "protections",
          label: "Protections",
          order: 40,
          layout: "columns",
          columns: 2,
          form: "protection-lines",
          placement: { column: 1, row: 3, columnSpan: 2 },
          cards: ["principal"],
          paths: ["/protections"],
        },
      ],
    },
    {
      id: "comportement",
      label: "Comportement",
      order: 60,
      layout: "stack",
      cards: ["principal", "secondaire"],
      joinedTo: { section: "sante", title: "Santé et comportement", card: "secondaire" },
      blocks: [
        {
          id: "combat",
          label: "Combat",
          order: 10,
          layout: "columns",
          columns: 2,
          form: "combat",
          rowLabels: ["Actions", "Défense"],
          paths: ["/actionsParRound", "/defense"],
        },
        {
          id: "comportement-notes",
          label: "Comportement",
          order: 20,
          layout: "stack",
          form: "narrative",
          cards: ["principal"],
          paths: ["/comportement"],
        },
        {
          id: "traits",
          label: "Traits spéciaux",
          order: 30,
          layout: "stack",
          form: "narrative",
          cards: ["principal"],
          paths: ["/traitsSpeciaux"],
        },
      ],
    },
    {
      id: "agir",
      label: "Agir",
      order: 70,
      layout: "stack",
      labelFrom: "/typeInfecte",
      cards: ["principal"],
      blocks: [
        {
          id: "actions",
          label: "Actions",
          order: 10,
          layout: "stack",
          form: "action-lines",
          paths: ["/actions"],
        },
      ],
    },
    {
      id: "equipement",
      label: "Équipement",
      order: 80,
      layout: "stack",
      cards: ["secondaire"],
      fallbackCard: "principal",
      blocks: [
        {
          id: "equipement",
          label: "Équipement",
          order: 10,
          layout: "stack",
          form: "inline-list",
          paths: ["/equipement"],
        },
      ],
    },
    {
      id: "competences",
      label: "Compétences",
      order: 90,
      layout: "stack",
      blocks: [
        {
          id: "competences",
          label: "Compétences",
          order: 10,
          layout: "stack",
          form: "skill-lines",
          paths: ["/competences"],
        },
      ],
    },
    {
      id: "contagion",
      label: "Contagion",
      order: 100,
      layout: "stack",
      blocks: [
        {
          id: "contagion",
          label: "Contagion",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/contagion"],
        },
      ],
    },
    {
      id: "notes",
      label: "Notes",
      order: 110,
      layout: "stack",
      blocks: [
        {
          id: "narratif",
          label: "Notes",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/narratif"],
        },
      ],
    },
  ],
  hiddenPaths: ["/etatDePartie", "/meta"],
});

export { ADRENALINE_VISUAL_CALLOUTS } from "./callouts.js";
export type { AdrenalineVisualCallout } from "./callouts.js";
