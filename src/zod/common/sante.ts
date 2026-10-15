import { z } from "zod";
import { KIT_JOUEUR, KIT_SOUPLE, Points, type KitDeValeurs } from "./primitives.js";

/**
 * Les blocs Santé, construits sur le kit de valeurs de la fiche : triplet
 * jouable pour le PJ, nombre simple ou triplet pour le PNJ et la créature.
 */
function construireSante<K extends KitDeValeurs>(k: K) {
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
      base: k.seuil.meta({
        description: "Valeur du seuil sur une localisation non couverte." + k.note,
        examples: [k.exemple(7)],
      }),
      couvert: k.seuil.optional().meta({
        description:
          "Valeur du seuil sur une localisation couverte par une armure ou un trait de caractère. Vaut la base augmentée des points de protection." +
          k.note,
        examples: [k.exemple(9)],
      }),
    })
    .meta({
      description:
        "Un seuil de dégât : sa valeur à nu, et sa valeur une fois la protection comptée.",
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
  const SeuilsPhysiques = QuatreSeuils.meta({
    description:
      "Seuils physiques : superficiel, léger, grave, profond. Stockés tels que lus sur la feuille, jamais recalculés — deux fiches publiées s'écartent d'un point de la dérivation.",
  });

  /**
   * Les quatre seuils mentaux, même mécanique depuis la Solidité mentale et les
   * qualités de LOG et de VOL. Vérifié sur deux fiches de PNJ publiées : SM 6 avec
   * LOG 20 et VOL 40 donne un léger à 12, SM 7 avec LOG 30 et VOL 30 donne 13.
   */
  const SeuilsMentaux = QuatreSeuils.meta({
    description:
      "Seuils mentaux : superficiel, léger, grave, profond. Symétriques des physiques, dérivés de la Solidité mentale et des qualités de LOG et VOL.",
  });

  /**
   * Le bloc Santé d'un personnage.
   *
   * Les dés de stress, les malus et les états encaissés sont imprimés dans ce
   * bloc mais n'y sont pas stockés : ils se remplissent en jeu et relèvent de
   * l'état de partie, non de la fiche. Les seuils eux-mêmes portent toutefois
   * leur minimum, leur valeur actuelle et leur maximum.
   */
  const Sante = z
    .strictObject({
      physique: SeuilsPhysiques,
      mental: SeuilsMentaux,
    })
    .meta({
      description:
        (k.note
          ? "Bloc Santé. Chaque seuil s'écrit en nombre simple ; "
          : "Bloc Santé. Chaque seuil jouable porte minimum, current et maximum ; ") +
        "les dés de stress, les malus et les blessures encaissées restent de l'état de partie." +
        (k.note ? " Le triplet { minimum, current, maximum } reste lu." : ""),
    });

  /**
   * Le bloc Santé d'une créature : les seuils physiques toujours, les mentaux
   * seulement si elle porte des caractéristiques mentales.
   */
  const SanteDeCreature = z
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

  return { Seuil, QuatreSeuils, SeuilsPhysiques, SeuilsMentaux, Sante, SanteDeCreature };
}

/*
 * Un seuil ne varie pas en cours de partie : le PJ le porte en nombre simple, comme la feuille
 * l'imprime, sans minimum ni maximum.
 */
const joueur = construireSante({
  ...KIT_JOUEUR,
  points: Points,
  seuil: Points,
  exemple: (nombre: number) => nombre,
});
const souple = construireSante(KIT_SOUPLE);

export const SeuilsPhysiques = joueur.SeuilsPhysiques;
export const SeuilsMentaux = joueur.SeuilsMentaux;
/** Santé d'un personnage joueur : seuils en triplet jouable. */
export const Sante = joueur.Sante;
/** Santé d'un PNJ : seuils en nombre simple ou en triplet. */
export const SanteDePnj = souple.Sante;
/** Santé d'une créature : seuils en nombre simple ou en triplet. */
export const SanteDeCreature = souple.SanteDeCreature;

export type SeuilValeur = z.infer<typeof joueur.Seuil>;
export type SanteValeur = z.infer<typeof Sante>;
export type SanteDePnjValeur = z.infer<typeof SanteDePnj>;
export type SanteDeCreatureValeur = z.infer<typeof SanteDeCreature>;
