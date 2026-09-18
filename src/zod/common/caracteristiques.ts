import { z } from "zod";
import { PourcentageJouable } from "./primitives.js";

/**
 * Les quatre caractéristiques physiques. Objet fermé : le socle en compte
 * quatre, ni plus ni moins.
 */
export const CaracteristiquesPhysiques = z.strictObject({
  for: PourcentageJouable.meta({
    description: "Force. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 40, maximum: 40 }],
  }),
  con: PourcentageJouable.meta({
    description: "Constitution. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 50, maximum: 50 }],
  }),
  dex: PourcentageJouable.meta({
    description: "Dextérité. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 45, maximum: 45 }],
  }),
  rap: PourcentageJouable.meta({
    description: "Rapidité. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 35, maximum: 35 }],
  }),
});

/**
 * Les quatre caractéristiques mentales. Exportées séparément : un profil de
 * corps d'infecté porte les quatre physiques et la seule PER.
 */
export const CaracteristiquesMentales = z.strictObject({
  log: PourcentageJouable.meta({
    description: "Logique. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 30, maximum: 30 }],
  }),
  vol: PourcentageJouable.meta({
    description: "Volonté. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 40, maximum: 40 }],
  }),
  per: PourcentageJouable.meta({
    description: "Perception. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 50, maximum: 50 }],
  }),
  cha: PourcentageJouable.meta({
    description: "Charisme. Pourcentage de d100 jouable.",
    examples: [{ minimum: 0, current: 25, maximum: 25 }],
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
 * à tout instant et n'est donc jamais stockée. Sa valeur jouable courante est
 * en revanche portée par `current`, entre `minimum` et `maximum`.
 */
export const Caracteristiques = CaracteristiquesPhysiques.extend(
  CaracteristiquesMentales.shape,
).meta({
  description:
    "Les huit caractéristiques jouables, chacune avec minimum, current et maximum. La qualité — le chiffre des dizaines — se recalcule et n'est pas stockée.",
});

export type CaracteristiquesPhysiquesValeur = z.infer<typeof CaracteristiquesPhysiques>;
export type CaracteristiquesMentalesValeur = z.infer<typeof CaracteristiquesMentales>;
export type CaracteristiquesValeur = z.infer<typeof Caracteristiques>;
