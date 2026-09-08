import { z } from "zod";
import { Pourcentage } from "./primitives";

/**
 * Les quatre caractéristiques physiques. Objet fermé : le socle en compte
 * quatre, ni plus ni moins.
 */
export const CaracteristiquesPhysiques = z.object({
  for: Pourcentage.meta({
    description: "Force. Pourcentage de d100.",
    examples: [40],
  }),
  con: Pourcentage.meta({
    description: "Constitution. Pourcentage de d100.",
    examples: [50],
  }),
  dex: Pourcentage.meta({
    description: "Dextérité. Pourcentage de d100.",
    examples: [45],
  }),
  rap: Pourcentage.meta({
    description: "Rapidité. Pourcentage de d100.",
    examples: [35],
  }),
});

/**
 * Les quatre caractéristiques mentales. Exportées séparément : un profil de
 * corps d'infecté porte les quatre physiques et la seule PER.
 */
export const CaracteristiquesMentales = z.object({
  log: Pourcentage.meta({
    description: "Logique. Pourcentage de d100.",
    examples: [30],
  }),
  vol: Pourcentage.meta({
    description: "Volonté. Pourcentage de d100.",
    examples: [40],
  }),
  per: Pourcentage.meta({
    description: "Perception. Pourcentage de d100.",
    examples: [50],
  }),
  cha: Pourcentage.meta({
    description: "Charisme. Pourcentage de d100.",
    examples: [25],
  }),
});

/**
 * Les huit caractéristiques d'un personnage complet.
 *
 * Composition par `extend`, jamais par `and` : une intersection produit un
 * `allOf` de deux objets portant chacun `additionalProperties: false`, qu'aucun
 * document ne peut satisfaire. Vérifié sur Zod 4.3.6.
 *
 * La qualité d'une caractéristique — le chiffre de ses dizaines — se recalcule
 * à tout instant et n'est donc jamais stockée.
 *
 * La feuille imprime une colonne « Actuel » à droite du pourcentage : elle se
 * remplit en jeu, au même titre que les malus et les dés de stress, et relève
 * de l'état de partie et non de la fiche.
 */
export const Caracteristiques = CaracteristiquesPhysiques.extend(
  CaracteristiquesMentales.shape,
).meta({
  description:
    "Les huit caractéristiques. La qualité — le chiffre des dizaines — se recalcule et n'est pas stockée ; la colonne « Actuel » de la feuille relève de l'état de partie.",
});

export type CaracteristiquesPhysiquesValeur = z.infer<typeof CaracteristiquesPhysiques>;
export type CaracteristiquesMentalesValeur = z.infer<typeof CaracteristiquesMentales>;
export type CaracteristiquesValeur = z.infer<typeof Caracteristiques>;
