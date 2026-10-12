import { z } from "zod";
import { KIT_JOUEUR, KIT_SOUPLE, type KitDeValeurs } from "./primitives.js";

/**
 * Les caractéristiques, construites sur le kit de valeurs de la fiche : triplet
 * jouable pour le PJ, nombre simple ou triplet pour le PNJ et la créature.
 */
function construireCaracteristiques<K extends KitDeValeurs>(k: K) {
  /**
   * Les quatre caractéristiques physiques. Objet fermé : le socle en compte
   * quatre, ni plus ni moins.
   */
  const CaracteristiquesPhysiques = z.strictObject({
    for: k.pourcentage.meta({
      description: "Force. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(40)],
    }),
    con: k.pourcentage.meta({
      description: "Constitution. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(50)],
    }),
    dex: k.pourcentage.meta({
      description: "Dextérité. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(45)],
    }),
    rap: k.pourcentage.meta({
      description: "Rapidité. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(35)],
    }),
  });

  /**
   * Les quatre caractéristiques mentales. Exportées séparément : un profil de
   * corps d'infecté porte les quatre physiques et la seule PER.
   */
  const CaracteristiquesMentales = z.strictObject({
    log: k.pourcentage.meta({
      description: "Logique. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(30)],
    }),
    vol: k.pourcentage.meta({
      description: "Volonté. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(40)],
    }),
    per: k.pourcentage.meta({
      description: "Perception. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(50)],
    }),
    cha: k.pourcentage.meta({
      description: "Charisme. Pourcentage de d100 jouable." + k.note,
      examples: [k.exemple(25)],
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
  const Caracteristiques = CaracteristiquesPhysiques.extend(CaracteristiquesMentales.shape).meta({
    description:
      (k.note
        ? "Les huit caractéristiques, chacune en nombre simple (le triplet { minimum, current, maximum } reste lu). "
        : "Les huit caractéristiques jouables, chacune avec minimum, current et maximum. ") +
      "La qualité — le chiffre des dizaines — se recalcule et n'est pas stockée.",
  });

  return { CaracteristiquesPhysiques, CaracteristiquesMentales, Caracteristiques };
}

const joueur = construireCaracteristiques(KIT_JOUEUR);
const souple = construireCaracteristiques(KIT_SOUPLE);

export const CaracteristiquesPhysiques = joueur.CaracteristiquesPhysiques;
export const CaracteristiquesMentales = joueur.CaracteristiquesMentales;
export const Caracteristiques = joueur.Caracteristiques;
/** Les quatre physiques d'une créature ou d'un PNJ : nombre simple ou triplet. */
export const CaracteristiquesPhysiquesSouples = souple.CaracteristiquesPhysiques;
/** Les quatre mentales d'une créature ou d'un PNJ : nombre simple ou triplet. */
export const CaracteristiquesMentalesSouples = souple.CaracteristiquesMentales;
/** Les huit caractéristiques d'un PNJ : nombre simple ou triplet. */
export const CaracteristiquesSouples = souple.Caracteristiques;

export type CaracteristiquesPhysiquesValeur = z.infer<typeof CaracteristiquesPhysiques>;
export type CaracteristiquesMentalesValeur = z.infer<typeof CaracteristiquesMentales>;
export type CaracteristiquesValeur = z.infer<typeof Caracteristiques>;
