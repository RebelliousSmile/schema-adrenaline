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
  | "fatigue-circles"
  | "narrative"
  | "compact-rows"
  | "combat"
  | "state-card";

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
  | { kind: "weapon-die"; label: "d10" }
  | { kind: "protection-units"; physical: "PP"; mental: "PM" };

export type AdrenalinePresentationAppearance = {
  variant: "zombiology";
  surface: "paper-sheet" | "compact-card";
  outerRule: true;
  fonts: {
    body: "Adrenaline Body";
    heading: "Adrenaline Display";
    handwritten: "Adrenaline Handwriting";
  };
  tokens: {
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
  sectionTitles: { align: "center"; font: "heading" };
  values: { align: "end"; font: "handwritten"; color: "handwrittenInk"; renderMaximum: false };
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
    competence: readonly ["nom", "specialite", "pourcentage"];
  };
  placement?: { column: number; row: number; rowSpan?: number; columnSpan?: number };
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
  blocks: AdrenalinePresentationBlock[];
};

export type AdrenalinePresentation = {
  version: 1;
  capability: `block:adrenaline-${"pj" | "pnj" | "monstre"}`;
  sheet: {
    id: `adrenaline-${"pj" | "pnj" | "monstre"}`;
    label: string;
  };
  appearance: AdrenalinePresentationAppearance;
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

function appearance(surface: "paper-sheet" | "compact-card"): AdrenalinePresentationAppearance {
  return {
    variant: "zombiology",
    surface,
    outerRule: true,
    fonts: {
      body: "Adrenaline Body",
      heading: "Adrenaline Display",
      handwritten: "Adrenaline Handwriting",
    },
    tokens: TOKENS,
    sectionTitles: { align: "center", font: "heading" },
    values: { align: "end", font: "handwritten", color: "handwrittenInk", renderMaximum: false },
  };
}

export const PJ_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-pj",
  sheet: { id: "adrenaline-pj", label: "Fiche PJ" },
  appearance: appearance("paper-sheet"),
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
          paths: [
            "/parametresDuJeu/joueur",
            "/parametresDuJeu/typeDeCreation",
            "/parametresDuJeu/typeDeScenario",
            "/parametresDuJeu/declinaisonDeCampagne",
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
            competence: ["nom", "specialite", "pourcentage"],
          },
          paths: ["/formations"],
        },
      ],
    },
    {
      id: "profil",
      label: "Profil",
      order: 30,
      layout: "columns",
      columns: 3,
      blocks: [
        {
          id: "identite",
          label: "Identité",
          order: 10,
          layout: "grid",
          columns: 2,
          form: "identity-fields",
          placement: { column: 1, row: 1 },
          paths: ["/identite"],
        },
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
          placement: { column: 2, row: 1 },
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
          placement: { column: 3, row: 1 },
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
          id: "malus",
          label: "Malus",
          order: 40,
          layout: "stack",
          form: "status-frames",
          paths: ["/etatDePartie/malus"],
        },
        {
          id: "etats-encaisses",
          label: "États encaissés",
          order: 50,
          layout: "stack",
          form: "status-frames",
          paths: ["/etatDePartie/etats"],
        },
        {
          id: "fatigue",
          label: "Fatigue",
          order: 60,
          layout: "stack",
          form: "fatigue-circles",
          decoration: {
            kind: "circle-groups",
            groups: [
              { label: "rounds", count: 5 },
              { label: "heures", count: 5 },
            ],
          },
          paths: ["/etatDePartie/fatigue"],
        },
      ],
    },
  ],
  hiddenPaths: ["/meta"],
});

export const PNJ_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-pnj",
  sheet: { id: "adrenaline-pnj", label: "Fiche PNJ" },
  appearance: appearance("compact-card"),
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
          paths: ["/nom", "/niveauDeDanger"],
        },
      ],
    },
    {
      id: "presentation",
      label: "Présentation",
      order: 20,
      layout: "stack",
      blocks: [
        {
          id: "description",
          label: "Description",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/description", "/narratif"],
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
      id: "sante-protections",
      label: "Santé et protections",
      order: 40,
      layout: "columns",
      columns: 2,
      blocks: [
        {
          id: "sante",
          label: "Santé",
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
          id: "etat-partie",
          label: "État de partie",
          order: 30,
          layout: "stack",
          form: "status-frames",
          paths: ["/etatDePartie"],
        },
      ],
    },
    {
      id: "formations-competences",
      label: "Formations et compétences",
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
        {
          id: "competences",
          label: "Compétences",
          order: 20,
          layout: "stack",
          form: "compact-rows",
          paths: ["/competences"],
        },
      ],
    },
    {
      id: "equipement",
      label: "Équipement",
      order: 60,
      layout: "stack",
      blocks: [
        {
          id: "equipement",
          label: "Équipement",
          order: 10,
          layout: "stack",
          form: "ruled-list",
          paths: ["/equipement"],
        },
      ],
    },
  ],
  hiddenPaths: ["/identite", "/meta"],
});

export const MONSTRE_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-monstre",
  sheet: { id: "adrenaline-monstre", label: "Fiche monstre" },
  appearance: appearance("compact-card"),
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
          layout: "grid",
          columns: 3,
          form: "name-card",
          paths: [
            "/nom",
            "/typeDeCorps",
            "/instinct",
            "/typeInfecte",
            "/niveauDeDanger",
            "/description",
          ],
        },
      ],
    },
    {
      id: "detection-deplacement",
      label: "Détection et déplacement",
      order: 20,
      layout: "columns",
      columns: 2,
      blocks: [
        {
          id: "detection",
          label: "Détection",
          order: 10,
          layout: "stack",
          form: "compact-rows",
          paths: ["/zoneDeDetection"],
        },
        {
          id: "deplacement",
          label: "Déplacement",
          order: 20,
          layout: "stack",
          form: "compact-rows",
          paths: ["/deplacement"],
        },
      ],
    },
    {
      id: "actions-comportement",
      label: "Actions et comportement",
      order: 30,
      layout: "columns",
      columns: 2,
      blocks: [
        {
          id: "comportement",
          label: "Comportement",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/comportement"],
        },
        {
          id: "combat",
          label: "Combat",
          order: 20,
          layout: "stack",
          form: "combat",
          paths: ["/actionsParRound", "/defense", "/actions"],
        },
      ],
    },
    {
      id: "caracteristiques",
      label: "Caractéristiques",
      order: 40,
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
      id: "sante-protections",
      label: "Santé et protections",
      order: 50,
      layout: "columns",
      columns: 2,
      blocks: [
        {
          id: "sante",
          label: "Santé",
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
      ],
    },
    {
      id: "capacites-etats",
      label: "Capacités et états",
      order: 60,
      layout: "stack",
      blocks: [
        {
          id: "traits",
          label: "Traits",
          order: 10,
          layout: "stack",
          form: "narrative",
          paths: ["/traitsSpeciaux"],
        },
        {
          id: "competences",
          label: "Compétences",
          order: 20,
          layout: "stack",
          form: "compact-rows",
          paths: ["/competences"],
        },
        {
          id: "contagion",
          label: "Contagion",
          order: 30,
          layout: "stack",
          form: "narrative",
          paths: ["/contagion"],
        },
        {
          id: "etats",
          label: "États",
          order: 40,
          layout: "columns",
          columns: 2,
          form: "state-card",
          paths: ["/etatActif", "/etats", "/etatAlternatif"],
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
          form: "ruled-list",
          paths: ["/equipement"],
        },
      ],
    },
  ],
  hiddenPaths: ["/narratif", "/etatDePartie", "/meta"],
});
