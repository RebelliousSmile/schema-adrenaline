import { z } from "zod";

/**
 * Une valeur de caractéristique, en pourcentage. Le système se lit en direct
 * sur un d100 : la valeur est le seuil de réussite.
 */
const Pourcentage = z.int().min(0);

/**
 * Les quatre caractéristiques physiques. Objet fermé : le socle en compte
 * quatre, ni plus ni moins.
 */
export const CaracteristiquesPhysiques = z.object({
  for: Pourcentage.meta({ description: "Force." }),
  con: Pourcentage.meta({ description: "Constitution." }),
  dex: Pourcentage.meta({ description: "Dextérité." }),
  rap: Pourcentage.meta({ description: "Rapidité." }),
});

/**
 * Les quatre caractéristiques mentales. Exportées séparément : un profil de
 * corps d'infecté porte les quatre physiques et la seule PER.
 */
export const CaracteristiquesMentales = z.object({
  log: Pourcentage.meta({ description: "Logique." }),
  vol: Pourcentage.meta({ description: "Volonté." }),
  per: Pourcentage.meta({ description: "Perception." }),
  cha: Pourcentage.meta({ description: "Charisme." }),
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
 */
export const Caracteristiques = CaracteristiquesPhysiques.extend(
  CaracteristiquesMentales.shape,
);
