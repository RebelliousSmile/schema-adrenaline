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
  | "action-lines";

export type AdrenalinePresentationDecoration =
  | {
      kind: "dice-options";
      favorable: readonly ["+1d100", "+2d100"];
      defavorable: readonly ["-1d100", "-2d100"];
    }
  | {
      kind: "circle-groups";
      groups: readonly [{ label: "rounds"; count: 5 }, { label: "heures"; count: 5 }];
    }
  | { kind: "scale"; from: 1; to: 10 }
  | { kind: "weapon-die"; label: "d10" }
  | { kind: "protection-units"; physical: "PP"; mental: "PM" }
  /**
   * Stress and malus tracks of a compact card: `length` circles per track, the
   * first `stressDefault` stress circles bold when the document gives no count.
   */
  | { kind: "malus-tracks"; length: 10; stressDefault: 2 };

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
      tokens: AdrenalineCompactCardTokens;
      sectionTitles: { align: "start"; font: "heading" };
      values: { align: "end"; font: "body"; color: "ink"; renderMaximum: false };
    };

export type AdrenalinePresentationBlock = {
  id: string;
  label: string;
  order: number;
  layout: AdrenalinePresentationLayout;
  columns?: number;
  form?: AdrenalinePresentationForm;
  /** Visible columns of a playable range; maximum remains editor-only. */
  rangeDisplay?: readonly ("minimum" | "current")[];
  rowLabels?: readonly string[];
  valueSuffix?: "%" | "PX";
  formationFields?: {
    header: readonly ["type", "nom", "pourcentage"];
    competence: readonly ["nom", "specialite", "caracteristique", "pourcentage"];
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
  decoration?: AdrenalinePresentationDecoration;
  /** JSON Pointers read by this visible block. */
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
  /** Folded by default: game-master material, such as the narrative block. */
  collapsible?: true;
  /** JSON Pointer whose value is printed after the label: `Comportement (Rôdeur)`. */
  labelFrom?: string;
  /**
   * Creature only: the state cards this section is printed on. The `principal`
   * card shows the state named by `etatPrincipal`, or the base state; the
   * `secondaire` card shows the other one. A section without `cards` is printed
   * once, outside the cards.
   */
  cards?: readonly ("principal" | "secondaire")[];
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
          rowLabels: ["Joueuse/Joueur", "Type de création", "Type de scénario"],
          paths: [
            "/parametresDuJeu/joueur",
            "/parametresDuJeu/typeDeCreation",
            "/parametresDuJeu/typeDeScenario",
          ],
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
            competence: ["nom", "specialite", "caracteristique", "pourcentage"],
          },
          formationTypes: ["classe-sociale", "professionnelle", "personnelle"],
          paths: ["/formations"],
        },
      ],
    },
    {
      id: "identite",
      label: "Identité",
      order: 30,
      layout: "stack",
      columns: 1,
      row: { id: "profil", span: 1 },
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
          placement: { column: 1, row: 1 },
          paths: ["/identite"],
        },
      ],
    },
    {
      id: "caracteristique",
      label: "Caractéristique",
      order: 35,
      layout: "columns",
      columns: 2,
      row: { id: "profil", span: 2 },
      blocks: [
        {
          id: "caracteristiques-physiques",
          label: "Carac. physiques",
          order: 20,
          layout: "grid",
          columns: 2,
          form: "characteristic-rows",
          rangeDisplay: ["minimum", "current"],
          rowLabels: ["Force", "Constitution", "Dextérité", "Rapidité"],
          valueSuffix: "%",
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
          rangeDisplay: ["minimum", "current"],
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
          id: "possessions",
          label: "Possessions",
          order: 10,
          layout: "stack",
          form: "ruled-list",
          placement: { column: 1, row: 1, rowSpan: 2 },
          paths: ["/equipement/possessions", "/equipement/equipementFavori"],
        },
        {
          id: "armes-physiques",
          label: "Armes physiques",
          order: 20,
          layout: "stack",
          form: "weapon-lines",
          decoration: { kind: "weapon-die", label: "d10" },
          placement: { column: 2, row: 1 },
          paths: ["/equipement/armesPhysiques"],
        },
        {
          id: "armes-mentales",
          label: "Armes mentales",
          order: 30,
          layout: "stack",
          form: "weapon-lines",
          decoration: { kind: "weapon-die", label: "d10" },
          placement: { column: 3, row: 1 },
          paths: ["/equipement/armesMentales"],
        },
        {
          id: "protections-physiques",
          label: "Protections physiques",
          order: 40,
          layout: "stack",
          form: "protection-lines",
          decoration: { kind: "protection-units", physical: "PP", mental: "PM" },
          placement: { column: 2, row: 2 },
          paths: ["/protections/physiques"],
        },
        {
          id: "protections-mentales",
          label: "Protections mentales",
          order: 50,
          layout: "stack",
          form: "protection-lines",
          decoration: { kind: "protection-units", physical: "PP", mental: "PM" },
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
          id: "stress",
          label: "Dés de stress",
          order: 10,
          layout: "stack",
          form: "stress-dice",
          decoration: {
            kind: "dice-options",
            favorable: ["+1d100", "+2d100"],
            defavorable: ["-1d100", "-2d100"],
          },
          paths: ["/etatDePartie/stress"],
        },
        {
          id: "seuils-physiques",
          label: "Seuils physiques",
          order: 20,
          layout: "stack",
          form: "threshold-rows",
          paths: ["/sante/physique"],
        },
        {
          id: "seuils-mentaux",
          label: "Seuils mentaux",
          order: 30,
          layout: "stack",
          form: "threshold-rows",
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
            groups: [
              { label: "rounds", count: 5 },
              { label: "heures", count: 5 },
            ],
          },
          paths: ["/etatDePartie/malus/choc"],
        },
        {
          id: "divers",
          label: "Divers",
          order: 50,
          layout: "stack",
          form: "status-frames",
          paths: ["/etatDePartie/malus/divers"],
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
          decoration: { kind: "scale", from: 1, to: 10 },
          paths: ["/etatDePartie/malus/total"],
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
      id: "meneur",
      label: "Meneur",
      order: 80,
      layout: "stack",
      collapsible: true,
      blocks: [
        {
          id: "narratif",
          label: "Notes du meneur",
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
 * base and the state's delta. Game-master material folds away below.
 */
export const MONSTRE_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-monstre",
  sheet: { id: "adrenaline-monstre", label: "Fiche monstre" },
  appearance: COMPACT_CARD,
  categories: {
    path: "/categorie",
    fallbackLabel: "Créature",
    defaultVariant: "garnet",
    defaultIcon: "skull",
    variants: { Zombie: "garnet", Animal: "orange" },
    icons: { Zombie: "biohazard", Animal: "paw-print" },
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
          label: "Créature",
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
          paths: ["/etatPrincipal", "/etatActif", "/etatDeBase", "/etats", "/etatAlternatif"],
        },
      ],
    },
    {
      id: "corps",
      label: "Corps",
      order: 40,
      layout: "stack",
      labelFrom: "/typeDeCorps",
      cards: ["principal", "secondaire"],
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
        {
          id: "detection",
          label: "Détection",
          order: 20,
          layout: "stack",
          form: "compact-rows",
          paths: ["/zoneDeDetection"],
        },
        {
          id: "deplacement",
          label: "Déplacement",
          order: 30,
          layout: "stack",
          form: "compact-rows",
          paths: ["/deplacement"],
        },
      ],
    },
    {
      id: "sante",
      label: "Santé",
      order: 50,
      layout: "stack",
      cards: ["principal", "secondaire"],
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
          id: "etats-permanents",
          label: "États permanents",
          order: 20,
          layout: "stack",
          form: "inline-list",
          paths: ["/etatsPermanents"],
        },
        {
          id: "malus",
          label: "Malus avant HS",
          order: 30,
          layout: "stack",
          form: "malus-circles",
          paths: ["/malusAvantHs"],
        },
        {
          id: "protections",
          label: "Protections",
          order: 40,
          layout: "columns",
          columns: 2,
          form: "protection-lines",
          paths: ["/protections"],
        },
      ],
    },
    {
      id: "comportement",
      label: "Comportement",
      order: 60,
      layout: "stack",
      labelFrom: "/instinct",
      cards: ["principal", "secondaire"],
      blocks: [
        {
          id: "combat",
          label: "Combat",
          order: 10,
          layout: "columns",
          columns: 2,
          form: "combat",
          paths: ["/actionsParRound", "/defense"],
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
      id: "meneur",
      label: "Meneur",
      order: 90,
      layout: "stack",
      collapsible: true,
      blocks: [
        {
          id: "comportement-notes",
          label: "Comportement",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/comportement"],
        },
        {
          id: "traits",
          label: "Traits",
          order: 20,
          layout: "stack",
          form: "narrative",
          paths: ["/traitsSpeciaux"],
        },
        {
          id: "competences",
          label: "Compétences",
          order: 30,
          layout: "stack",
          form: "skill-lines",
          paths: ["/competences"],
        },
        {
          id: "contagion",
          label: "Contagion",
          order: 40,
          layout: "stack",
          form: "narrative",
          paths: ["/contagion"],
        },
        {
          id: "narratif",
          label: "Notes du meneur",
          order: 50,
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
