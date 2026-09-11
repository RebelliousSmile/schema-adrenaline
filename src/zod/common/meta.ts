import { z } from "zod";

/**
 * D'où vient cette fiche. Ensemble fermé de quatre, aligné sur le vocabulaire
 * de `schema-in-the-mist` (`publication_type`) pour qu'un outil lisant les deux
 * écosystèmes n'ait qu'une correspondance de mots à faire, jamais de sémantique
 * à inventer : `officiel` = `official`, `tiers` = `third_party`,
 * `communautaire` = `cauldron`, `maison` = `homebrew`.
 */
export const TypeDePublication = z.enum(["officiel", "tiers", "communautaire", "maison"]).meta({
  description:
    "Origine du contenu, pour le catalogage par les outils tiers. Correspondance schema-in-the-mist : officiel/official, tiers/third_party, communautaire/cauldron, maison/homebrew.",
  examples: ["officiel", "maison"],
});

/**
 * Attribution et catalogage. Bloc optionnel, présent sur les trois cibles.
 *
 * Il ne décrit pas le personnage mais le fichier : qui l'a écrit, d'où il sort,
 * à quelle page. C'est ce qui permet à une bibliothèque d'outils de trier des
 * fiches d'origines mélangées sans les ouvrir, et c'est l'équivalent direct du
 * `meta` que porte chaque cible de `schema-in-the-mist`.
 *
 * À ne pas confondre avec `parametresDuJeu` de la cible `pj`, qui décrit une
 * partie et non un fichier.
 */
export const Meta = z
  .strictObject({
    typeDePublication: TypeDePublication.optional(),
    source: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Titre de l'ouvrage, du supplément ou du PDF dont la fiche est tirée.",
        examples: ["Zombiology — Contamination", "Livret PNJ et animaux"],
      }),
    auteurs: z
      .array(z.string().min(1).meta({ description: "Un nom crédité." }))
      .optional()
      .meta({
        description: "Personnes créditées.",
        examples: [["Damien Coltice"]],
      }),
    page: z
      .int()
      .min(1)
      .max(10000)
      .optional()
      .meta({
        description: "Page dans la source, quand elle est pertinente.",
        examples: [42, 118],
      }),
    licence: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Conditions de réutilisation de cette fiche, en clair.",
        examples: ["CC BY 4.0"],
      }),
  })
  .meta({
    description: "Attribution et catalogage : d'où vient cette fiche, pas ce qu'elle décrit.",
  });

export type TypeDePublicationValeur = z.infer<typeof TypeDePublication>;
export type MetaValeur = z.infer<typeof Meta>;
