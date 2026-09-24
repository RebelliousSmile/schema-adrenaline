/**
 * Declarative presentation semantics published beside the JSON Schemas.
 *
 * The vocabulary deliberately describes information architecture only. It
 * never names a React component, a module, a CSS class or executable consumer
 * configuration. Consumers activate the same `block:*` capability published
 * by the Handbook pack, then apply their own renderer to these regions.
 */

export type AdrenalinePresentationLayout = "banner" | "columns" | "grid" | "stack";

export type AdrenalinePresentationSection = {
  id: string;
  label: string;
  order: number;
  layout: AdrenalinePresentationLayout;
  columns?: number;
  /** JSON Pointers into the document root. */
  paths: string[];
};

export type AdrenalinePresentationRegion = {
  id: string;
  label: string;
  order: number;
  layout: AdrenalinePresentationLayout;
  columns?: number;
  sections: AdrenalinePresentationSection[];
};

export type AdrenalinePresentation = {
  version: 1;
  capability: `block:adrenaline-${"pj" | "pnj" | "monstre"}`;
  block: {
    id: `adrenaline-${"pj" | "pnj" | "monstre"}`;
    label: string;
  };
  values: {
    /** Scalar input limits are read from JSON Schema, never duplicated here. */
    scalarBounds: "json-schema";
    /** A playable range is always displayed in this stable order. */
    rangeFields: readonly ["minimum", "current", "maximum"];
    rangeLabels: readonly ["Minimum", "Actuel", "Maximum"];
  };
  regions: AdrenalinePresentationRegion[];
};

function definePresentation<const T extends AdrenalinePresentation>(value: T): T {
  return value;
}

const VALUES = {
  scalarBounds: "json-schema",
  rangeFields: ["minimum", "current", "maximum"],
  rangeLabels: ["Minimum", "Actuel", "Maximum"],
} as const;

export const PJ_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-pj",
  block: { id: "adrenaline-pj", label: "Fiche PJ" },
  values: VALUES,
  regions: [
    {
      id: "entete",
      label: "En-tête",
      order: 10,
      layout: "columns",
      columns: 2,
      sections: [
        { id: "personnage", label: "Personnage", order: 10, layout: "stack", paths: ["/nom"] },
        {
          id: "parametres",
          label: "Paramètres du jeu",
          order: 20,
          layout: "grid",
          columns: 2,
          paths: ["/parametresDuJeu"],
        },
      ],
    },
    {
      id: "competences",
      label: "Formations et compétences",
      order: 20,
      layout: "columns",
      columns: 3,
      sections: [
        {
          id: "formations",
          label: "Formations",
          order: 10,
          layout: "columns",
          columns: 3,
          paths: ["/formations"],
        },
      ],
    },
    {
      id: "profil",
      label: "Identité et caractéristiques",
      order: 30,
      layout: "columns",
      columns: 2,
      sections: [
        {
          id: "identite",
          label: "Identité",
          order: 10,
          layout: "grid",
          columns: 2,
          paths: ["/identite"],
        },
        {
          id: "caracteristiques",
          label: "Caractéristiques",
          order: 20,
          layout: "grid",
          columns: 2,
          paths: ["/caracteristiques"],
        },
      ],
    },
    {
      id: "equipement",
      label: "Équipement",
      order: 40,
      layout: "columns",
      columns: 3,
      sections: [
        {
          id: "inventaire",
          label: "Équipement",
          order: 10,
          layout: "grid",
          columns: 3,
          paths: ["/equipement"],
        },
      ],
    },
    {
      id: "sante",
      label: "Santé",
      order: 50,
      layout: "columns",
      columns: 3,
      sections: [
        {
          id: "seuils",
          label: "Seuils",
          order: 10,
          layout: "columns",
          columns: 2,
          paths: ["/sante"],
        },
        {
          id: "protections",
          label: "Protections",
          order: 20,
          layout: "columns",
          columns: 2,
          paths: ["/protections"],
        },
        {
          id: "etat-partie",
          label: "État de partie",
          order: 30,
          layout: "grid",
          columns: 2,
          paths: ["/etatDePartie"],
        },
      ],
    },
    {
      id: "provenance",
      label: "Provenance",
      order: 60,
      layout: "stack",
      sections: [{ id: "meta", label: "Source", order: 10, layout: "stack", paths: ["/meta"] }],
    },
  ],
});

export const PNJ_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-pnj",
  block: { id: "adrenaline-pnj", label: "Fiche PNJ" },
  values: VALUES,
  regions: [
    {
      id: "entete",
      label: "En-tête",
      order: 10,
      layout: "banner",
      sections: [
        {
          id: "identification",
          label: "PNJ",
          order: 10,
          layout: "columns",
          columns: 2,
          paths: ["/nom", "/niveauDeDanger"],
        },
        {
          id: "presentation",
          label: "Présentation",
          order: 20,
          layout: "stack",
          paths: ["/description", "/narratif"],
        },
      ],
    },
    {
      id: "profil",
      label: "Profil",
      order: 20,
      layout: "stack",
      sections: [
        {
          id: "identite",
          label: "Identité",
          order: 10,
          layout: "grid",
          columns: 2,
          paths: ["/identite"],
        },
        {
          id: "caracteristiques",
          label: "Caractéristiques",
          order: 20,
          layout: "grid",
          columns: 4,
          paths: ["/caracteristiques"],
        },
      ],
    },
    {
      id: "sante",
      label: "Santé et protections",
      order: 30,
      layout: "columns",
      columns: 2,
      sections: [
        {
          id: "seuils",
          label: "Seuils",
          order: 10,
          layout: "columns",
          columns: 2,
          paths: ["/sante"],
        },
        {
          id: "protections",
          label: "Protections",
          order: 20,
          layout: "columns",
          columns: 2,
          paths: ["/protections"],
        },
        {
          id: "etat-partie",
          label: "État de partie",
          order: 30,
          layout: "stack",
          paths: ["/etatDePartie"],
        },
      ],
    },
    {
      id: "aptitudes",
      label: "Formations et compétences",
      order: 40,
      layout: "stack",
      sections: [
        {
          id: "formations",
          label: "Formations",
          order: 10,
          layout: "grid",
          columns: 2,
          paths: ["/formations"],
        },
        {
          id: "competences",
          label: "Compétences",
          order: 20,
          layout: "stack",
          paths: ["/competences"],
        },
      ],
    },
    {
      id: "equipement",
      label: "Équipement",
      order: 50,
      layout: "stack",
      sections: [
        {
          id: "inventaire",
          label: "Équipement",
          order: 10,
          layout: "stack",
          paths: ["/equipement"],
        },
      ],
    },
    {
      id: "provenance",
      label: "Provenance",
      order: 60,
      layout: "stack",
      sections: [{ id: "meta", label: "Source", order: 10, layout: "stack", paths: ["/meta"] }],
    },
  ],
});

export const MONSTRE_PRESENTATION = definePresentation({
  version: 1,
  capability: "block:adrenaline-monstre",
  block: { id: "adrenaline-monstre", label: "Fiche monstre" },
  values: VALUES,
  regions: [
    {
      id: "entete",
      label: "En-tête",
      order: 10,
      layout: "banner",
      sections: [
        {
          id: "identification",
          label: "Créature",
          order: 10,
          layout: "grid",
          columns: 3,
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
      id: "detection",
      label: "Détection et déplacement",
      order: 20,
      layout: "columns",
      columns: 2,
      sections: [
        {
          id: "mobilite",
          label: "Mobilité",
          order: 10,
          layout: "columns",
          columns: 2,
          paths: ["/zoneDeDetection", "/deplacement"],
        },
      ],
    },
    {
      id: "combat",
      label: "Actions et comportement",
      order: 30,
      layout: "columns",
      columns: 2,
      sections: [
        {
          id: "comportement",
          label: "Comportement",
          order: 10,
          layout: "stack",
          paths: ["/comportement"],
        },
        {
          id: "actions",
          label: "Combat",
          order: 20,
          layout: "stack",
          paths: ["/actionsParRound", "/defense", "/actions"],
        },
      ],
    },
    {
      id: "profil",
      label: "Caractéristiques, santé et protections",
      order: 40,
      layout: "stack",
      sections: [
        {
          id: "caracteristiques",
          label: "Caractéristiques",
          order: 10,
          layout: "grid",
          columns: 4,
          paths: ["/caracteristiques"],
        },
        {
          id: "sante",
          label: "Santé et protections",
          order: 20,
          layout: "columns",
          columns: 2,
          paths: ["/sante", "/protections"],
        },
      ],
    },
    {
      id: "capacites",
      label: "Capacités",
      order: 50,
      layout: "stack",
      sections: [
        {
          id: "traits",
          label: "Traits spéciaux",
          order: 10,
          layout: "stack",
          paths: ["/traitsSpeciaux"],
        },
        {
          id: "competences",
          label: "Compétences",
          order: 20,
          layout: "stack",
          paths: ["/competences"],
        },
        { id: "contagion", label: "Contagion", order: 30, layout: "stack", paths: ["/contagion"] },
      ],
    },
    {
      id: "etats",
      label: "États",
      order: 60,
      layout: "columns",
      columns: 2,
      sections: [
        {
          id: "profils-etat",
          label: "Profils d'état",
          order: 10,
          layout: "columns",
          columns: 2,
          paths: ["/etatActif", "/etats", "/etatAlternatif"],
        },
        {
          id: "etat-partie",
          label: "État de partie",
          order: 20,
          layout: "stack",
          paths: ["/etatDePartie"],
        },
      ],
    },
    {
      id: "complements",
      label: "Compléments",
      order: 70,
      layout: "columns",
      columns: 2,
      sections: [
        {
          id: "equipement",
          label: "Équipement",
          order: 10,
          layout: "stack",
          paths: ["/equipement"],
        },
        { id: "narratif", label: "Narratif", order: 20, layout: "stack", paths: ["/narratif"] },
        { id: "meta", label: "Source", order: 30, layout: "stack", paths: ["/meta"] },
      ],
    },
  ],
});
