import { z } from "zod";

/**
 * Les valeurs chiffrées du socle, bornées des deux côtés.
 *
 * Zod émet pour un `z.int()` nu un `maximum` valant `Number.MAX_SAFE_INTEGER`,
 * soit 9007199254740991 : le JSON Schema publié accepte alors une
 * caractéristique à neuf quadrillions. Le plafond n'est donc pas une coquetterie
 * — sans lui, la borne haute n'existe tout simplement pas côté consommateur.
 *
 * Les plafonds ci-dessous sont des garde-fous de saisie, pas des règles du jeu :
 * le livre n'en énonce aucun. Ils sont posés assez haut pour qu'aucune fiche
 * légitime ne les touche, et assez bas pour qu'une valeur aberrante soit
 * refusée.
 */

/**
 * Un pourcentage de d100, lu en direct : la valeur est le seuil de réussite.
 *
 * Le plafond n'est pas 100. Les règles traitent explicitement le cas d'un
 * pourcentage supérieur ou égal à 100 — réussite automatique, assortie d'un
 * bonus de qualité par tranche de 10 au-dessus de 100 — et un total de
 * compétence plus caractéristique franchit la barre sans difficulté. 200 laisse
 * dix tranches de bonus au-delà du seuil de réussite automatique.
 */
export const Pourcentage = z
  .int()
  .min(0)
  .max(200)
  .meta({
    description:
      "Pourcentage de d100. Peut dépasser 100 : au-delà, la réussite est automatique et la qualité gagne un bonus par tranche de 10.",
    examples: [30, 40, 80],
  });

/**
 * Un nombre de points de protection : solidité, armure, trait de caractère, ou
 * la valeur d'un palier de dégât, qui se compte dans la même unité.
 */
export const Points = z
  .int()
  .min(0)
  .max(100)
  .meta({
    description: "Nombre de points, dans l'unité des protections et des seuils de dégât.",
    examples: [2, 7, 26],
  });

/**
 * Un petit décompte : dés de dégâts, actions par round, niveau de danger.
 *
 * Le ND se construit en additionnant ceux du corps, de l'instinct et du type,
 * il n'est donc pas borné par le 5 des composants publiés ; il reste petit.
 */
export const Compte = z
  .int()
  .min(0)
  .max(100)
  .meta({
    description: "Décompte d'éléments discrets : dés, actions, niveaux.",
    examples: [1, 2, 5],
  });

/**
 * Un cumul qui croît sur toute une campagne. Seul chiffre du socle qui n'est pas
 * plafonné bas.
 */
export const Cumul = z
  .int()
  .min(0)
  .max(1000000)
  .meta({
    description: "Valeur cumulée sur la durée d'une campagne.",
    examples: [0, 25, 340],
  });
