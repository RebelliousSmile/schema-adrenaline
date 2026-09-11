import { z } from "zod";
import { Points } from "./primitives.js";

/**
 * Un seuil tel qu'il est imprimé : une valeur de base, et une seconde valeur
 * qui ne vaut que sur les localisations couvertes.
 *
 * Un seul mot pour ce concept dans tout le dépôt — « seuil », celui de la
 * feuille imprimée. « Palier » n'est plus employé.
 *
 * La feuille imprime une colonne « + Armure » à droite des seuils physiques et
 * une colonne « + Caractère » à droite des mentaux. Sur la feuille lue en
 * exemple, Caractère PM 2 donne des seuils mentaux 5/7, 10/12, 15/17, 20/22 :
 * la valeur couverte est la base augmentée des points de protection.
 */
const Seuil = z
  .strictObject({
    base: Points.meta({
      description: "Valeur du seuil sur une localisation non couverte.",
      examples: [7, 16],
    }),
    couvert: Points.optional().meta({
      description:
        "Valeur du seuil sur une localisation couverte par une armure ou un trait de caractère. Vaut la base augmentée des points de protection.",
      examples: [9, 18],
    }),
  })
  .meta({
    description: "Un seuil de dégât : sa valeur à nu, et sa valeur une fois la protection comptée.",
  });

/**
 * Les quatre seuils de dégât. Une seule forme sert le physique et le mental :
 * le socle pose entre eux une symétrie stricte, que deux définitions séparées
 * laisseraient diverger en silence.
 */
const QuatreSeuils = z.strictObject({
  superficiel: Seuil.meta({
    description: "Seuil de dégât superficiel, le moins élevé des quatre.",
  }),
  leger: Seuil.meta({ description: "Seuil de dégât léger." }),
  grave: Seuil.meta({ description: "Seuil de dégât grave." }),
  profond: Seuil.meta({ description: "Seuil de dégât profond, le plus élevé des quatre." }),
});

/**
 * Les quatre seuils physiques.
 *
 * Dérivation, vérifiée sur la feuille de PJ publiée — Solidité physique PP 7,
 * FOR 40 et CON 50, soit des qualités de 4 et 5 — qui donne 7, 16, 21, 26 :
 * superficiel vaut les PP de Solidité physique ; léger vaut le superficiel
 * augmenté des qualités de FOR et de CON ; grave vaut le léger augmenté de 5 et
 * profond le léger augmenté de 10, tous deux depuis le léger et non en cascade.
 *
 * JSON Schema ne calcule pas : les valeurs sont stockées telles que lues.
 */
export const SeuilsPhysiques = QuatreSeuils.meta({
  description:
    "Seuils physiques : superficiel, léger, grave, profond. Stockés tels que lus sur la feuille, jamais recalculés — deux fiches publiées s'écartent d'un point de la dérivation.",
});

/**
 * Les quatre seuils mentaux, même mécanique depuis la Solidité mentale et les
 * qualités de LOG et de VOL. Vérifié sur deux fiches de PNJ publiées : SM 6 avec
 * LOG 20 et VOL 40 donne un léger à 12, SM 7 avec LOG 30 et VOL 30 donne 13.
 */
export const SeuilsMentaux = QuatreSeuils.meta({
  description:
    "Seuils mentaux : superficiel, léger, grave, profond. Symétriques des physiques, dérivés de la Solidité mentale et des qualités de LOG et VOL.",
});

/**
 * Le bloc Santé d'un personnage.
 *
 * Les dés de stress, les malus et les états encaissés sont imprimés dans ce
 * bloc mais n'y sont pas stockés : ils se remplissent en jeu et relèvent de
 * l'état de partie, non de la fiche. Même raison pour la colonne « Actuel » des
 * caractéristiques.
 */
export const Sante = z
  .strictObject({
    physique: SeuilsPhysiques,
    mental: SeuilsMentaux,
  })
  .meta({
    description:
      "Bloc Santé. Ne porte que les seuils : les dés de stress, les malus et les blessures encaissées se remplissent en jeu et relèvent de l'état de partie.",
  });

/**
 * Le bloc Santé d'une créature : les seuils physiques toujours, les mentaux
 * seulement si elle porte des caractéristiques mentales.
 */
export const SanteDeCreature = z
  .strictObject({
    physique: SeuilsPhysiques,
    mental: QuatreSeuils.partial().optional().meta({
      description:
        "Seuils mentaux. Optionnels, et chacun d'eux facultatif : une créature sans caractéristiques mentales est insensible aux attaques mentales et n'en porte aucun.",
    }),
  })
  .meta({
    description:
      "Bloc Santé d'une créature : les seuils physiques toujours, les mentaux seulement si elle a de quoi les porter.",
  });

export type SeuilValeur = z.infer<typeof Seuil>;
export type SanteValeur = z.infer<typeof Sante>;
export type SanteDeCreatureValeur = z.infer<typeof SanteDeCreature>;
