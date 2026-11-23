import { z } from "zod";
import { RELATIONS_PRESENTATION } from "../../presentation.js";
import { Meta } from "../common/meta.js";
import { Compte } from "../common/primitives.js";

/**
 * La feuille de relations : un document A4 séparé de la fiche PJ, propre à un
 * personnage. Sa contenance est finie comme celle d'une feuille imprimée ; les
 * capacités ci-dessous sont celles d'une page, pas des règles du jeu. Une feuille
 * pleine se poursuit dans un second document.
 */

/** Emplacements « Autres personnages » au plus : une rangée de quatre, puis deux de plus. */
export const AUTRES_PJ_EMPLACEMENTS = 6;

/** Emplacements imprimés par défaut : une seule rangée de quatre colonnes. */
export const AUTRES_PJ_PAR_DEFAUT = 4;

/** Emplacements de PNJ : deux colonnes de cinq rangées. */
export const PNJ_EMPLACEMENTS = 10;

/**
 * Numéro de PNJ le plus haut. Au-delà de dix pour qu'une seconde feuille poursuive
 * la numérotation et renvoie aux PNJ de la première.
 */
export const NUMERO_PNJ_MAXIMUM = 99;

/** Capacité d'un nom : une ligne d'en-tête ou de carte. */
export const NOM_CAPACITE = 60;

/** Capacité de « Ce que je sais » : quelques lignes d'une colonne étroite. */
export const CE_QUE_JE_SAIS_CAPACITE = 160;

/** Capacité d'une dette, dans un sens ou dans l'autre. */
export const DETTE_CAPACITE = 100;

/** Capacité de la précision d'un lien, à côté de ses cases à cocher. */
export const LIEN_DESCRIPTION_CAPACITE = 60;

/** Capacité de « Ce qui lui est arrivé ». */
export const CE_QUI_LUI_EST_ARRIVE_CAPACITE = 120;

/** Capacité des notes d'un PNJ. */
export const NOTES_PNJ_CAPACITE = 120;

/**
 * Attitude d'un PNJ envers le personnage, de la plus hostile à la plus loyale.
 * L'ordre est significatif : la présentation publie les niveaux dans cet ordre.
 * L'attitude « amoureuse » évoquée par le livre ne fait pas partie des cinq
 * niveaux.
 */
export const AttitudeDePnj = z
  .enum(["hostile", "inamicale", "indifferente", "amicale", "loyale"])
  .meta({
    description:
      "Attitude du PNJ envers le personnage, de la plus hostile à la plus loyale. Elle fixe seule le modificateur aux tests d'Arme sociale : le modificateur se déduit, il ne se saisit pas.",
    examples: ["amicale"],
  });

/** Les trois types de lien de la session zéro. */
export const TypeDeLien = z.enum(["familial", "amitie", "travail"]).meta({
  description: "Type de lien entre le personnage et le PNJ : familial, amitié ou travail.",
  examples: ["travail"],
});

const texte = (capacite: number) => z.string().min(1).max(capacite);

const NumeroDePnj = z
  .int()
  .min(1)
  .max(NUMERO_PNJ_MAXIMUM)
  .meta({
    description:
      "Numéro du PNJ sur la feuille, de 1 à 99. Un éditeur doit le garder unique et stable ; le schéma ne vérifie ni son unicité ni l'existence des numéros qui y renvoient.",
    examples: [3],
  });

const AutrePersonnage = z
  .strictObject({
    nom: texte(NOM_CAPACITE).meta({
      description: "Nom de l'autre personnage joueur.",
      examples: ["Malik"],
    }),
    ceQueJeSais: texte(CE_QUE_JE_SAIS_CAPACITE).optional().meta({
      description: "Ce que le personnage sait de lui.",
    }),
    ceQueJeLuiDois: texte(DETTE_CAPACITE).optional().meta({
      description: "Ce que le personnage lui doit.",
    }),
    ceQuIlMeDoit: texte(DETTE_CAPACITE).optional().meta({
      description: "Ce qu'il doit au personnage.",
    }),
  })
  .meta({
    description:
      "Un autre personnage joueur : ce qu'on sait de lui et les dettes. Aucun modificateur.",
  });

const LienDePnj = z
  .strictObject({
    type: TypeDeLien,
    description: texte(LIEN_DESCRIPTION_CAPACITE)
      .optional()
      .meta({
        description: "Précision du lien, en quelques mots.",
        examples: ["ancien collègue du dépôt"],
      }),
  })
  .meta({ description: "Lien entre le personnage et le PNJ." });

const Pnj = z
  .strictObject({
    numero: NumeroDePnj,
    nom: texte(NOM_CAPACITE).meta({
      description: "Nom du PNJ.",
      examples: ["Le docteur Ferran"],
    }),
    attitude: AttitudeDePnj.optional().meta({
      description:
        "Attitude du PNJ envers le personnage propriétaire de la feuille. Elle seule fixe le modificateur aux tests d'Arme sociale, qui se lit dans la présentation et ne se saisit pas.",
    }),
    lien: LienDePnj.optional(),
    reliesA: z
      .array(NumeroDePnj)
      .max(PNJ_EMPLACEMENTS - 1)
      .optional()
      .meta({
        description:
          "Numéros des autres PNJ auxquels celui-ci est relié. Le schéma ne vérifie pas que ces numéros existent.",
        examples: [[1, 4]],
      }),
    ceQuiLuiEstArrive: texte(CE_QUI_LUI_EST_ARRIVE_CAPACITE).optional().meta({
      description: "Ce qui lui est arrivé au fil des parties.",
    }),
    notes: texte(NOTES_PNJ_CAPACITE).optional().meta({
      description:
        "Notes libres : l'attitude du personnage envers le PNJ, son autorité sociale, les nuances.",
    }),
  })
  .meta({ description: "Un PNJ connu du personnage, repéré par son numéro." });

export const FeuilleDeRelations = z
  .strictObject({
    personnage: texte(NOM_CAPACITE).meta({
      description: "Nom du personnage propriétaire de la feuille, sur la ligne d'en-tête.",
      examples: ["Claire Vasseur"],
    }),
    joueur: texte(NOM_CAPACITE).optional().meta({
      description: "Personne qui joue le personnage, sur la ligne d'en-tête.",
    }),
    partie: texte(NOM_CAPACITE)
      .optional()
      .meta({
        description: "Nom de la partie ou de la campagne, sur la ligne d'en-tête.",
        examples: ["Les Veilleurs"],
      }),
    nombreDAutresPersonnages: z
      .int()
      .min(1)
      .max(AUTRES_PJ_EMPLACEMENTS)
      .optional()
      .meta({
        description:
          "Nombre d'emplacements « Autres personnages » imprimés, de 1 à 6 : la table compte autant de personnages joueurs que la feuille en a besoin. Absent, la feuille en imprime quatre, sur une seule rangée ; au-delà de quatre, les emplacements passent sur une seconde rangée. Les emplacements remplis s'impriment toujours, même au-delà de ce nombre.",
        default: AUTRES_PJ_PAR_DEFAUT,
        examples: [3],
      }),
    autresPersonnages: z.array(AutrePersonnage).max(AUTRES_PJ_EMPLACEMENTS).optional().meta({
      description:
        "Les autres personnages joueurs, en haut de la feuille : six emplacements au plus, par rangées de quatre.",
    }),
    testsDeDrame: Compte.optional().meta({
      description:
        "Nombre de tests de drame faits. C'est un décompte, jamais déduit du nombre de PNJ morts.",
      examples: [2],
    }),
    pnjs: z.array(Pnj).max(PNJ_EMPLACEMENTS).optional().meta({
      description:
        "Les PNJ connus du personnage : dix emplacements au plus. Une feuille pleine se poursuit dans un second document.",
    }),
    meta: Meta.optional().meta({
      description: "Attribution et catalogage : d'où vient cette feuille.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/relations.schema.json",
    title: "Feuille de relations — Adrenaline System",
    description:
      "Feuille de relations du socle Adrenaline System, séparée de la fiche PJ : ligne d'en-tête (personnage, joueur, partie), autres personnages joueurs avec ce qu'on sait d'eux et les dettes, PNJ numérotés avec attitude, lien, liens croisés, et le décompte des tests de drame.",
    "x-adrenaline-presentation": RELATIONS_PRESENTATION,
  });

export type FeuilleDeRelationsValeur = z.infer<typeof FeuilleDeRelations>;
export type AttitudeDePnjValeur = z.infer<typeof AttitudeDePnj>;
export type TypeDeLienValeur = z.infer<typeof TypeDeLien>;
